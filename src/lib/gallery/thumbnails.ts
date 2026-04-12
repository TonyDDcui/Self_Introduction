export function pickPhotoSrc(p: { blob_url: string; thumb_url?: string | null }): string {
  return p.thumb_url || p.blob_url;
}

