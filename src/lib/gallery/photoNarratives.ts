import { sql } from "../db";
import { edgefnChatComplete } from "../ai/edgefn";
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
    system: "你是一个为摄影作品撰写极简中文配文的编辑。",
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

  // 先尝试多模态（如果接口支持）
  if (photo.blob_url) {
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
      // 若多模态不支持，或多模态返回空响应，则回退纯文本重试一次
      if (!looksLikeUnsupportedMultimodal(msg) && !msg.includes("EDGEFN_EMPTY_RESPONSE")) throw e;
      // 回退纯文本（不带图片）
    }
  }

  return await edgefnChatComplete({
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    temperature: 0.7,
    maxTokens: 220,
  });
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
