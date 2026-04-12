import { sql } from "../db";
import { unstable_cache } from "next/cache";

export type PhotoRow = {
  id: string;
  blob_url: string;
  blob_pathname: string;
  thumb_url: string | null;
  thumb_pathname: string | null;
  title: string | null;
  caption: string | null;
  category: string | null;
  tags: string[];
  visibility: string;
  sort_order: number | null;
  created_at: string | Date;
  published_at: string | Date;
};

/**
 * List most recent public photos for the gallery.
 *
 * Ordering rule:
 * 1) sort_order (nulls last via coalesce to int32 max)
 * 2) published_at desc
 */
export async function listPublicPhotos(): Promise<PhotoRow[]> {
  // Backward compatible query:
  // - Older databases may not have thumb_url/thumb_pathname columns yet.
  // - We try the new schema first, and fallback to the legacy schema with null thumbs.
  try {
    const { rows } = await sql<PhotoRow>`
      select
        id,
        blob_url,
        blob_pathname,
        thumb_url,
        thumb_pathname,
        title,
        caption,
        category,
        tags,
        visibility,
        sort_order,
        created_at,
        published_at
      from photos
      where visibility = 'public'
      order by coalesce(sort_order, 2147483647), published_at desc
      limit 200
    `;
    return rows;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Postgres error: column "thumb_url" does not exist
    if (!/thumb_(url|pathname)/i.test(msg)) throw err;

    const { rows } = await sql<PhotoRow>`
      select
        id,
        blob_url,
        blob_pathname,
        null::text as thumb_url,
        null::text as thumb_pathname,
        title,
        caption,
        category,
        tags,
        visibility,
        sort_order,
        created_at,
        published_at
      from photos
      where visibility = 'public'
      order by coalesce(sort_order, 2147483647), published_at desc
      limit 200
    `;
    return rows;
  }
}

/**
 * Cached variant to reduce DB load for SSR pages.
 * Note: write paths (upload/delete) currently rely on short revalidate window rather than explicit invalidation.
 */
export const listPublicPhotosCached = unstable_cache(
  async () => listPublicPhotos(),
  ["gallery:publicPhotos:v1"],
  { revalidate: 60, tags: ["gallery:publicPhotos"] },
);
