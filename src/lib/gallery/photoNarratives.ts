import { sql } from "../db";
import { edgefnChatComplete } from "../ai/edgefn";
import type { PhotoRow } from "./photos";
import { buildCaptionPromptV2, sanitizeCaptionV2 } from "../ai/captionV2";

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
  for (const r of rows) {
    // 旧缓存如果包含过程文/脏数据：直接删掉，走新逻辑重新生成
    const clean = sanitizeCaptionV2(r.narrative_md);
    if (!clean) {
      try {
        await sql`delete from photo_narratives where photo_id = ${r.photo_id}`;
      } catch {
        // ignore
      }
      continue;
    }
    // 若能清洗出更干净的版本，回写一次
    if (clean !== r.narrative_md) {
      try {
        await sql`
          update photo_narratives
          set narrative_md = ${clean}, updated_at = now()
          where photo_id = ${r.photo_id}
        `;
      } catch {
        // ignore
      }
    }
    map.set(r.photo_id, clean);
  }
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

function getCaptionModel() {
  // 配文固定用更“直出”的模型，避免推理模型输出过程文
  return process.env.EDGEFN_CAPTION_MODEL || "DeepSeek-V3.2";
}

async function createPhotoNarrative(input: { photo: PhotoRow; albumSlug: string }) {
  const { photo } = input;
  const tags = (photo.tags || []).map((t) => String(t).trim()).filter(Boolean);
  const desc = photo.caption?.trim() || "";
  if (!desc) throw new Error("MISSING_DESCRIPTION");
  const prompt = buildCaptionPromptV2({ tags, description: desc });

  let out1 = "";
  try {
    out1 = await edgefnChatComplete({
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      temperature: 0.35,
      maxTokens: 220,
      model: getCaptionModel(),
      allowReasoningFallback: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // 少量网关偶发空响应：允许继续走一次重试
    if (!msg.includes("EDGEFN_EMPTY_RESPONSE")) throw e;
  }

  const clean1 = sanitizeCaptionV2(out1);
  if (clean1) return clean1;

  const out2 = await edgefnChatComplete({
    messages: [
      { role: "system", content: prompt.system },
      {
        role: "user",
        content: `${prompt.user}\n\n再次强调：只输出配文正文，不要输出任何解释或过程。`,
      },
    ],
    temperature: 0.25,
    maxTokens: 220,
    model: getCaptionModel(),
    // 第二次允许从 reasoning 兜底（仅用于 content 为空的网关情况），但最终仍要过清洗
    allowReasoningFallback: true,
  });

  const clean2 = sanitizeCaptionV2(out2);
  if (clean2) return clean2;
  throw new Error("AI_CAPTION_FAILED");
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
