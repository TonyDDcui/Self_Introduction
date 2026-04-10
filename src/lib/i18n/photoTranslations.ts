import { sql } from "../db";

export type PhotoTranslationRow = {
  photo_id: string;
  lang: string;
  title: string | null;
  tags: unknown;
  narrative_md: string | null;
  source_hash: string;
  created_at: string;
  updated_at: string;
};

async function ensureTable() {
  await sql`
    create table if not exists photo_translations (
      photo_id text not null,
      lang text not null,
      title text,
      tags jsonb,
      narrative_md text,
      source_hash text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (photo_id, lang)
    )
  `;
  await sql`
    create index if not exists idx_photo_translations_lang_updated_at
      on photo_translations (lang, updated_at desc)
  `;
}

export async function getPhotoTranslation(photoId: string, lang: string) {
  await ensureTable();
  const { rows } = await sql<PhotoTranslationRow>`
    select * from photo_translations where photo_id = ${photoId} and lang = ${lang} limit 1
  `;
  return rows[0] ?? null;
}

export async function upsertPhotoTranslation(input: {
  photoId: string;
  lang: string;
  title: string;
  tags: string[];
  narrativeMd: string;
  sourceHash: string;
}) {
  await ensureTable();
  await sql`
    insert into photo_translations (photo_id, lang, title, tags, narrative_md, source_hash)
    values (
      ${input.photoId},
      ${input.lang},
      ${input.title},
      ${JSON.stringify(input.tags)}::jsonb,
      ${input.narrativeMd},
      ${input.sourceHash}
    )
    on conflict (photo_id, lang) do update set
      title = excluded.title,
      tags = excluded.tags,
      narrative_md = excluded.narrative_md,
      source_hash = excluded.source_hash,
      updated_at = now()
  `;
}

