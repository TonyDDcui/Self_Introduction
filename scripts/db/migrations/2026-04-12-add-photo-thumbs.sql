-- Add thumbnail columns for Gallery photos (backward compatible).
-- Safe to run multiple times.
alter table photos
  add column if not exists thumb_url text,
  add column if not exists thumb_pathname text;

