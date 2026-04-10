import { sql } from "../db";
import { edgefnChatComplete, edgefnSupportsImages } from "../ai/edgefn";
import { extractUserVisibleCaption, isCaptionLikelyValid } from "../ai/caption";
import type { PhotoRow } from "./photos";

type PhotoNarrativeRow = {
  photo_id: string;
  album_slug: string | null;
  narrative_md: string;
  created_at: string | Date;
  updated_at: string | Date;
};

export type PhotoNarrativesResult = {
  narratives: Map<string, string>;
  debugByPhotoId?: Map<string, string>;
};

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

async function getPhotoNarratives(photoIds: string[]) {
  await ensureTable();
  if (!photoIds.length) return new Map<string, string>();

  // @vercel/postgres 的 tagged template 类型不接受 string[]，这里用底层 pg 的 query 走数组参数
  const pool = sql as unknown as {
    query: <T = unknown>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>;
  };
  const { rows } = await pool.query<Pick<PhotoNarrativeRow, "photo_id" | "narrative_md">>(
    `select photo_id, narrative_md
     from photo_narratives
     where photo_id = any($1::text[])`,
    [photoIds],
  );

  const map = new Map<string, string>();
  for (const r of rows) map.set(r.photo_id, r.narrative_md);
  return map;
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

async function createPhotoNarrative(input: { photo: PhotoRow; albumSlug: string }) {
  const { photo } = input;
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

  // 第二次：强制 JSON 输出（便于稳定抽取最终结果）
  const attempt2 = await runTextOnly(
    "请只输出严格 JSON：{\"caption\":\"...\"}，不要输出任何其它文字。",
  );
  const c2 = extractUserVisibleCaption(attempt2);
  if (isCaptionLikelyValid(c2)) return c2;

  // 最后一次：再强调一次“只输出正文”
  const attempt3 = await runTextOnly(
    "如果你刚才输出了任何解释/推理/过程，请丢弃它们。现在只输出 1 段配文正文（<=60字）。",
  );
  const c3 = extractUserVisibleCaption(attempt3);
  if (isCaptionLikelyValid(c3)) return c3;

  throw new Error("AI_CAPTION_INVALID_OUTPUT");
}

export async function getOrCreatePhotoNarratives(input: {
  photos: PhotoRow[];
  albumSlug: string;
  debug?: boolean;
}): Promise<PhotoNarrativesResult> {
  const { photos, albumSlug, debug = false } = input;

  const photoIds = photos.map((p) => p.id);
  const existing = await getPhotoNarratives(photoIds);
  const debugByPhotoId = debug ? new Map<string, string>() : undefined;

  // 无 key 则直接返回已有缓存
  if (!process.env.EDGEFN_API_KEY) {
    if (debugByPhotoId) {
      for (const p of photos) {
        if (!existing.get(p.id)) debugByPhotoId.set(p.id, "EDGEFN_API_KEY_NOT_SET");
      }
    }
    return { narratives: existing, debugByPhotoId };
  }

  for (const p of photos) {
    if (existing.has(p.id)) continue;
    try {
      const narrative = await createPhotoNarrative({ photo: p, albumSlug });
      await upsertPhotoNarrative({ photoId: p.id, albumSlug, narrative });
      existing.set(p.id, narrative);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[gallery/albums] photo narrative generation failed:", p.id, msg);
      if (debugByPhotoId) debugByPhotoId.set(p.id, msg);
    }
  }

  return { narratives: existing, debugByPhotoId };
}
