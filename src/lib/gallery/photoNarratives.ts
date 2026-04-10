import { sql } from "../db";
import { edgefnChatComplete } from "../ai/edgefn";
import type { PhotoRow } from "./photos";
import { classifyAlbumFromPhoto } from "./albumRules";
import { tryExtractCaption } from "../ai/captionGuard";

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
  // 配文单独用更“直出”的模型（例如 GLM-5），避免推理模型输出过程文
  return process.env.EDGEFN_CAPTION_MODEL || process.env.EDGEFN_MODEL;
}

async function createPhotoNarrative(input: { photo: PhotoRow; albumSlug: string }) {
  const { photo } = input;
  const prompt = buildPrompt(photo);

  let out1 = "";
  try {
    out1 = await edgefnChatComplete({
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      temperature: 0.7,
      maxTokens: 260,
      model: getCaptionModel(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // 少量网关偶发空响应：允许继续走一次重试
    if (!msg.includes("EDGEFN_EMPTY_RESPONSE")) throw e;
  }

  if (out1) {
    const extracted = tryExtractCaption(out1);
    if (extracted) return extracted;
  }

  const out2 = await edgefnChatComplete({
    messages: [
      { role: "system", content: prompt.system },
      {
        role: "user",
        content:
          prompt.user +
          "\n\n再次强调：只输出最终配文正文。严禁输出写作计划/步骤/分析，例如“第一句/第二句/最后/思路/计划/加入/化用/典故”等。",
      },
    ],
    temperature: 0.55,
    maxTokens: 260,
    model: getCaptionModel(),
  });

  const extracted2 = tryExtractCaption(out2);
  if (extracted2) return extracted2;
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
