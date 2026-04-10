export function isHeicLike(input: { name?: string | null; type?: string | null }): boolean {
  const type = (input.type ?? "").toLowerCase().trim();
  if (type === "image/heic" || type === "image/heif") return true;

  const name = (input.name ?? "").toLowerCase().trim();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

export function isHeicUrl(url: string): boolean {
  const u = (url || "").toLowerCase();
  // Vercel Blob 通常会保留扩展名；如果没有扩展名，这里也允许 query 中带 .heic/.heif 的情况
  return u.includes(".heic") || u.includes(".heif");
}

export function toJpegFilename(originalName: string): string {
  const n = (originalName || "upload").trim();
  const base = n.replace(/\.(heic|heif|avif|webp|png|jpe?g|gif)$/i, "");
  return `${base || "upload"}.jpg`;
}
