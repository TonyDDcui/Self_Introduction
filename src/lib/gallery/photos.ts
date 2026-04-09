import { sql } from "../db";
import { unstable_cache } from "next/cache";

export type PhotoRow = {
  id: string;
  blob_url: string;
  blob_pathname: string;
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
  const { rows } = await sql<PhotoRow>`
    select
      id,
      blob_url,
      blob_pathname,
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

/**
 * Cached variant to reduce DB load for SSR pages.
 * Note: write paths (upload/delete) currently rely on short revalidate window rather than explicit invalidation.
 */
export const listPublicPhotosCached = unstable_cache(
  async () => listPublicPhotos(),
  ["gallery:publicPhotos:v1"],
  { revalidate: 60 },
);
