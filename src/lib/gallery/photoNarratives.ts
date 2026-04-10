import { sql } from "../db";
import { edgefnChatComplete, edgefnSupportsImages } from "../ai/edgefn";
import type { PhotoRow } from "./photos";
import { classifyAlbumFromPhoto } from "./albumRules";
import { parseCaptionJson } from "../ai/captionJson";

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
  const album = classifyAlbumFromPhoto(photo);
  const tags = (photo.tags || []).map((t) => String(t).trim()).filter(Boolean);
  const tagLine = tags.length ? `标签：${tags.join("，")}` : "标签：无";
  const titleLine = photo.title?.trim() ? `标题：${photo.title.trim()}` : "标题：无";
  const captionLine = photo.caption?.trim() ? `描述：${photo.caption.trim()}` : "描述：无";

  const isEmptyMeta =
    tagLine === "标签：无" && titleLine === "标题：无" && captionLine === "描述：无";

  const user = `你将为网页相册中的一张照片生成“配文”（纯文字，显示在图片下方）。\n\n相册主题：${album.title}\n主题词：${album.themeTags.join("，")}\n${tagLine}\n${titleLine}\n${captionLine}\n\n写作要求：\n- 用中文\n- 1 段，1～3 句，总字数不超过 60 字\n- 语言：流畅、克制、偏文学感（但不要矫饰）\n- 不要 emoji，不要标题，不要列清单\n- 不要解释你在推测/想象\n\n输出格式要求（必须严格遵守）：\n只输出严格 JSON：{\"caption\":\"...\"}\n不要输出任何其它文字。\n\n${
    isEmptyMeta
      ? "补充：如果标题/描述/标签都为空，请根据相册主题词，合理想象一个该主题常见场景，写出具有画面感的配文。"
      : ""
  }`;

  return {
    system:
      "你是一个为摄影作品撰写中文配文的编辑。不要输出思考过程或解释，只按要求输出 JSON。",
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
  // 仅接受严格 JSON（避免 thinking/过程文污染）
  try {
    const raw1 = await runTextOnly();
    return parseCaptionJson(raw1);
  } catch {
    const raw2 = await runTextOnly(
      "再次强调：只输出 JSON，例如：{\"caption\":\"窗外的风把光轻轻推到树影上。\"}",
    );
    return parseCaptionJson(raw2);
  }
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
