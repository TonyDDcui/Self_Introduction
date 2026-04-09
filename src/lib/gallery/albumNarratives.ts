import { sql } from "../db";
import { edgefnChatComplete } from "../ai/edgefn";
import type { PhotoRow } from "./photos";

export type AlbumNarrativeRow = {
  slug: string;
  title: string | null;
  narrative_md: string;
  created_at: string | Date;
  updated_at: string | Date;
};

async function ensureTable() {
  // 防呆：即使忘了跑 scripts/db/init.sql，也尽量不让线上直接 500
  // 注意：这会增加一次轻量 DDL 检查请求，但只在首次调用时触发（PG 会缓存 plan）
  await sql`
    create table if not exists album_narratives (
      slug text primary key,
      title text,
      narrative_md text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
}

export async function getAlbumNarrative(slug: string): Promise<string | null> {
  await ensureTable();
  const { rows } = await sql<Pick<AlbumNarrativeRow, "narrative_md">>`
    select narrative_md
    from album_narratives
    where slug = ${slug}
    limit 1
  `;
  return rows[0]?.narrative_md ?? null;
}

async function saveAlbumNarrative(input: {
  slug: string;
  title: string;
  narrativeMd: string;
}) {
  await ensureTable();
  await sql`
    insert into album_narratives (slug, title, narrative_md)
    values (${input.slug}, ${input.title}, ${input.narrativeMd})
    on conflict (slug) do update set
      title = excluded.title,
      narrative_md = excluded.narrative_md,
      updated_at = now()
  `;
}

function buildPrompt(input: { title: string; slug: string; photos: PhotoRow[] }) {
  const samples = input.photos
    .slice(0, 12)
    .map((p, idx) => {
      const t = p.title?.trim() ? `标题：${p.title!.trim()}` : "";
      const c = p.caption?.trim() ? `描述：${p.caption!.trim()}` : "";
      const line = [t, c].filter(Boolean).join("；");
      return line ? `${idx + 1}. ${line}` : `${idx + 1}. （无文字）`;
    })
    .join("\n");

  const user = `请为一个照片相册生成一段“配文/前言”，用于网页相册页顶部展示。\n\n相册信息：\n- 相册名：${input.title}\n- 相册 slug：${input.slug}\n- 照片数：${input.photos.length}\n\n部分照片文字（可能为空）：\n${samples}\n\n要求：\n1) 用中文\n2) 2～5 段，每段 1～3 句，整体不超过 180 字\n3) 风格：克制、干净、有画面感，偏 Apple 文案气质\n4) 不要列清单，不要标题，不要 emoji，不要引用格式\n5) 只输出正文段落，用空行分段`;

  return {
    system:
      "你是一个擅长为摄影相册撰写简洁配文的中文文案编辑。你输出的文字将直接显示在网页中。",
    user,
  };
}

export async function getOrCreateAlbumNarrative(input: {
  slug: string;
  title: string;
  photos: PhotoRow[];
}): Promise<string | null> {
  const existing = await getAlbumNarrative(input.slug);
  if (existing) return existing;

  // 如果没有照片，就不生成（避免被刷无效 slug）
  if (!input.photos.length) return null;

  // 没配置 API key 时，不阻断页面，只返回 null
  if (!process.env.EDGEFN_API_KEY) return null;

  try {
    const prompt = buildPrompt(input);
    const narrative = await edgefnChatComplete({
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      temperature: 0.8,
      maxTokens: 450,
    });

    await saveAlbumNarrative({
      slug: input.slug,
      title: input.title,
      narrativeMd: narrative,
    });

    return narrative;
  } catch (err) {
    console.error("[gallery/albums] narrative generation failed:", err);
    return null;
  }
}

