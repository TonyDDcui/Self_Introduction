import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

import { authOptions } from "../../../../../../../src/lib/auth/options";
import { isUploader } from "../../../../../../../src/lib/auth/guards";
import { sql } from "../../../../../../../src/lib/db";
import type { PhotoRow } from "../../../../../../../src/lib/gallery/photos";
import { classifyAlbumFromPhoto } from "../../../../../../../src/lib/gallery/albumRules";
import {
  edgefnChatComplete,
  edgefnSupportsImages,
} from "../../../../../../../src/lib/ai/edgefn";
import { extractUserVisibleCaption, isCaptionLikelyValid } from "../../../../../../../src/lib/ai/caption";
import {
  getClientIp,
  assertSameOrigin,
  json429,
} from "../../../../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../../../../src/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApiOk = { ok: true; narrative: string };
type ApiErr = { ok: false; reason: string };

function buildPrompt(photo: PhotoRow) {
  const tags = (photo.tags || []).map((t) => String(t).trim()).filter(Boolean);
  const tagLine = tags.length ? `标签：${tags.join("，")}` : "标签：无";
  const titleLine = photo.title?.trim() ? `标题：${photo.title.trim()}` : "标题：无";
  const captionLine = photo.caption?.trim() ? `描述：${photo.caption.trim()}` : "描述：无";

  const user = `请为一张照片生成一段简短配文，用于网页相册中图片下方的纯文字展示。\n\n${tagLine}\n${titleLine}\n${captionLine}\n\n要求：\n1) 用中文\n2) 1 段，1～3 句，总字数不超过 60 字\n3) 风格：克制、干净、有画面感，偏 Apple 文案气质\n4) 不要 emoji，不要标题，不要列清单\n5) 只输出配文正文`;

  return {
    system:
      "你是一个为摄影作品撰写极简中文配文的编辑。请不要输出思考过程或 <think> 标签，只输出最终配文正文。",
    user,
  };
}

function looksLikeUnsupportedMultimodal(errMsg: string) {
  const s = errMsg.toLowerCase();
  return (
    s.includes("invalidrequestbody") ||
    s.includes("image") ||
    s.includes("multimodal") ||
    s.includes("unsupported")
  );
}

async function ensureTable() {
  await sql`
    create table if not exists photo_narratives (
      photo_id text primary key,
      album_slug text,
      narrative_md text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create index if not exists idx_photo_narratives_album_slug on photo_narratives (album_slug)
  `;
}

async function upsertPhotoNarrative(input: { photoId: string; albumSlug: string; narrative: string }) {
  await ensureTable();
  await sql`
    insert into photo_narratives (photo_id, album_slug, narrative_md)
    values (${input.photoId}, ${input.albumSlug}, ${input.narrative})
    on conflict (photo_id) do update set
      album_slug = excluded.album_slug,
      narrative_md = excluded.narrative_md,
      updated_at = now()
  `;
}

async function createNarrative(photo: PhotoRow): Promise<string> {
  const prompt = buildPrompt(photo);

  const runTextOnly = async (extra?: string) =>
    edgefnChatComplete({
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: `${prompt.user}${extra ? `\n\n${extra}` : ""}` },
      ],
      temperature: 0.7,
      maxTokens: 220,
    });

  // 默认不启用图片识别；只有显式配置 EDGEFN_SUPPORTS_IMAGES=1 才尝试多模态
  if (edgefnSupportsImages() && photo.blob_url) {
    try {
      return await edgefnChatComplete({
        messages: [
          { role: "system", content: prompt.system },
          {
            role: "user",
            content: [
              { type: "text", text: prompt.user },
              { type: "image_url", image_url: { url: photo.blob_url } },
            ],
          },
        ],
        temperature: 0.7,
        maxTokens: 220,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!looksLikeUnsupportedMultimodal(msg) && !msg.includes("EDGEFN_EMPTY_RESPONSE")) throw e;
      // 回退文本
    }
  }

  // 文本模式：若空响应，再强约束重试一次
  const attempt1 = await runTextOnly();
  const c1 = extractUserVisibleCaption(attempt1);
  if (isCaptionLikelyValid(c1)) return c1;

  const attempt2 = await runTextOnly(
    "请只输出严格 JSON：{\"caption\":\"...\"}，不要输出任何其它文字。",
  );
  const c2 = extractUserVisibleCaption(attempt2);
  if (isCaptionLikelyValid(c2)) return c2;

  const attempt3 = await runTextOnly(
    "如果你刚才输出了任何解释/推理/过程，请丢弃它们。现在只输出 1 段配文正文（<=60字）。",
  );
  const c3 = extractUserVisibleCaption(attempt3);
  if (isCaptionLikelyValid(c3)) return c3;

  throw new Error("AI_CAPTION_INVALID_OUTPUT");
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const sameOrigin = assertSameOrigin(request);
  if (!sameOrigin.ok) {
    return NextResponse.json({ ok: false, reason: sameOrigin.reason } satisfies ApiErr, {
      status: 403,
    });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, reason: "unauthorized" } satisfies ApiErr, {
      status: 401,
    });
  }
  if (!isUploader(session)) {
    return NextResponse.json({ ok: false, reason: "forbidden" } satisfies ApiErr, {
      status: 403,
    });
  }

  const ip = getClientIp(request);
  const rl = await enforceRateLimit({
    key: `api:gallery:narrative_regen:ip=${ip}:actor=uploader`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  const id = context.params.id;
  if (!id) {
    return NextResponse.json({ ok: false, reason: "missing_id" } satisfies ApiErr, {
      status: 400,
    });
  }

  // 取 photo 元信息（用于 prompt / album slug）
  const { rows } = await sql<PhotoRow>`
    select
      id,
      blob_url,
      blob_pathname,
      title,
      caption,
      category,
      tags,
      visibility,
      sort_order,
      created_at,
      published_at
    from photos
    where id = ${id}
    limit 1
  `;
  const photo = rows[0];
  if (!photo) {
    return NextResponse.json({ ok: false, reason: "not_found" } satisfies ApiErr, {
      status: 404,
    });
  }

  if (!process.env.EDGEFN_API_KEY) {
    return NextResponse.json({ ok: false, reason: "EDGEFN_API_KEY_NOT_SET" } satisfies ApiErr, {
      status: 500,
    });
  }

  try {
    const albumSlug = classifyAlbumFromPhoto(photo).slug;
    const narrative = await createNarrative(photo);
    await upsertPhotoNarrative({ photoId: id, albumSlug, narrative });

    // 保守起见：让相册相关页面尽快更新（公共照片列表缓存）
    revalidateTag("gallery:publicPhotos");

    return NextResponse.json({ ok: true, narrative } satisfies ApiOk, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/gallery/photos/:id/narrative/regenerate] failed:", id, msg);
    return NextResponse.json({ ok: false, reason: msg } satisfies ApiErr, { status: 500 });
  }
}
