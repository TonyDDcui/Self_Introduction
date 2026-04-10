-- Gallery photos schema (Vercel Postgres)
-- Run this in your Postgres database (e.g. Vercel Postgres "Query" console).

create extension if not exists "uuid-ossp";

create table if not exists photos (
  id uuid primary key default uuid_generate_v4(),
  blob_url text not null,
  blob_pathname text not null,
  title text,
  caption text,
  category text,
  tags text[] not null default '{}',
  visibility text not null default 'public',
  sort_order int,
  created_at timestamptz not null default now(),
  published_at timestamptz not null default now()
);

create index if not exists idx_photos_published_at on photos (published_at desc);
create index if not exists idx_photos_visibility on photos (visibility);
create index if not exists idx_photos_tags on photos using gin (tags);

-- Album narratives (AI-generated captions) for /gallery/albums/[slug]
create table if not exists album_narratives (
  slug text primary key,
  title text,
  narrative_md text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Photo narratives (AI-generated captions) for album story feed
create table if not exists photo_narratives (
  photo_id text primary key,
  album_slug text,
  narrative_md text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_photo_narratives_album_slug on photo_narratives (album_slug);

-- Rate limit counters (for abuse protection)
create table if not exists rate_limits (
  key text primary key,
  count int not null,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

-- Photo translations (zh/en cache) for Gallery
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
);

create index if not exists idx_photo_translations_lang_updated_at
  on photo_translations (lang, updated_at desc);

-- i18n job queue (progress polling for translation tasks)
create table if not exists i18n_jobs (
  job_id text primary key,
  kind text not null,
  target_id text not null,
  lang text not null,
  state text not null,
  progress int not null default 0,
  message text not null default '',
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_i18n_jobs_kind_target_lang
  on i18n_jobs (kind, target_id, lang);
