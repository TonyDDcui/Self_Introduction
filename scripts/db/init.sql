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
