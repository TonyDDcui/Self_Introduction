import type { PhotoRow } from "./photos";
import { classifyAlbumFromPhoto } from "./albumRules";

export type AlbumSummary = {
  slug: string;
  title: string;
  count: number;
  coverUrl: string | null;
  coverAlt: string;
};

export function buildAlbumSummaries(photos: PhotoRow[]): AlbumSummary[] {
  const map = new Map<
    string,
    { title: string; count: number; coverUrl: string | null; coverAlt: string }
  >();

  for (const p of photos) {
    const a = classifyAlbumFromPhoto(p);
    const existing = map.get(a.slug);
    if (!existing) {
      map.set(a.slug, {
        title: a.title,
        count: 1,
        // listPublicPhotos() 已按 published_at desc 排序：第一个命中的就是“最新/封面”
        coverUrl: p.blob_url ?? null,
        coverAlt: p.title?.trim() || p.caption?.trim() || a.title,
      });
    } else {
      existing.count += 1;
    }
  }

  const albums: AlbumSummary[] = Array.from(map.entries()).map(([slug, v]) => ({
    slug,
    title: v.title,
    count: v.count,
    coverUrl: v.coverUrl,
    coverAlt: v.coverAlt,
  }));

  // “未分类”固定置底，其余按数量 desc 再按标题
  albums.sort((a, b) => {
    if (a.slug === "uncategorized" && b.slug !== "uncategorized") return 1;
    if (b.slug === "uncategorized" && a.slug !== "uncategorized") return -1;
    if (b.count !== a.count) return b.count - a.count;
    return a.title.localeCompare(b.title, "zh-Hans-CN");
  });

  return albums;
}

export function filterPhotosByAlbumSlug(photos: PhotoRow[], slug: string): PhotoRow[] {
  return photos.filter((p) => classifyAlbumFromPhoto(p).slug === slug);
}

