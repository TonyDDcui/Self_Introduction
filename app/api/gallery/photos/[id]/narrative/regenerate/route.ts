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
} from "../../../../../../../src/lib/ai/edgefn";
import { looksLikeProcessText } from "../../../../../../../src/lib/ai/captionGuard";
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
  const album = classifyAlbumFromPhoto(photo);
  const tags = (photo.tags || []).map((t) => String(t).trim()).filter(Boolean);
  const tagLine = tags.length ? `标签：${tags.join("，")}` : "标签：无";
  const titleLine = photo.title?.trim() ? `标题：${photo.title.trim()}` : "标题：无";
  const captionLine = photo.caption?.trim() ? `描述：${photo.caption.trim()}` : "描述：无";
  const isEmptyMeta =
    tagLine === "标签：无" && titleLine === "标题：无" && captionLine === "描述：无";

  const user = `请为一张照片生成配文，用于网页相册中图片下方的纯文字展示。\n\n相册主题：${album.title}\n主题词：${album.themeTags.join("，")}\n${tagLine}\n${titleLine}\n${captionLine}\n\n要求：\n1) 用中文\n2) 1 段为主，1～4 句，总字数不超过 200 字\n3) 语言：现代中文为主，尽量在每句中自然融入 4～8 字的古文/化用（如果不好生成，就用纯现代文，优先保证自然流畅）\n4) 不要 emoji，不要标题，不要列清单\n5) 不要解释你在推测/想象，直接给结果\n\n${
    isEmptyMeta
      ? "补充：如果标题/描述/标签都为空，请结合相册主题词合理想象一个常见场景来写配文。"
      : ""
  }`;

  return {
    system:
      "你是一个为摄影作品撰写中文配文的编辑。不要输出思考过程或 <think> 标签；不要输出“用户让我/我将/分析”等过程文；只输出最终配文正文。",
    user,
  };
}

function getCaptionModel() {
  return process.env.EDGEFN_CAPTION_MODEL || process.env.EDGEFN_MODEL;
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
  try {
    const out = await edgefnChatComplete({
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      temperature: 0.7,
      maxTokens: 220,
      model: getCaptionModel(),
    });
    if (!looksLikeProcessText(out)) return out;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.includes("EDGEFN_EMPTY_RESPONSE")) throw e;
    const out = await edgefnChatComplete({
      messages: [
        { role: "system", content: prompt.system },
        {
          role: "user",
          content:
            prompt.user +
            "\n\n再次强调：只输出最终配文正文，不要出现“第一句/第二句/最后/思路/计划/加入/化用”等过程说明。",
        },
      ],
      temperature: 0.7,
      maxTokens: 220,
      model: getCaptionModel(),
    });
    if (!looksLikeProcessText(out)) return out;
  }

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
