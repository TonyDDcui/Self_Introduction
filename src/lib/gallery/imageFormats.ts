export function isHeicLike(input: { name?: string | null; type?: string | null }): boolean {
  const type = (input.type ?? "").toLowerCase().trim();
  if (type === "image/heic" || type === "image/heif") return true;

  const name = (input.name ?? "").toLowerCase().trim();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

export function toJpegFilename(originalName: string): string {
  const n = (originalName || "upload").trim();
  const base = n.replace(/\.(heic|heif|avif|webp|png|jpe?g|gif)$/i, "");
  return `${base || "upload"}.jpg`;
}

