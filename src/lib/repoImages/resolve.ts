import manifestJson from "../../generated/repo-images-manifest.json";

export type RepoImageManifestItem = {
  originalPath: string;
  publicPath: string;
  name: string;
  ext: string;
};

const manifest = (manifestJson as RepoImageManifestItem[]) ?? [];

const originalToPublicPath = new Map<string, string>();
const publicPathSet = new Set<string>();

for (const item of manifest) {
  originalToPublicPath.set(item.originalPath, item.publicPath);
  publicPathSet.add(item.publicPath);
}

function normalizeInputSrc(src: string) {
  // Keep '/repo-images/...' as-is (public path)
  const s = src.trim().replace(/\\/g, "/");
  if (s.startsWith("/repo-images/")) return s;

  // Treat everything else as repo-relative "originalPath"
  return s.replace(/^\.\//, "").replace(/^\/+/, "");
}

/**
 * Resolve an "originalPath" (repo-relative) to its publicPath under /public/repo-images.
 * Returns null if manifest doesn't contain the image.
 */
export function resolveRepoImage(src: string): string | null {
  if (!src) return null;
  const normalized = normalizeInputSrc(src);

  if (normalized.startsWith("/repo-images/")) {
    return publicPathSet.has(normalized) ? normalized : null;
  }

  return originalToPublicPath.get(normalized) ?? null;
}

