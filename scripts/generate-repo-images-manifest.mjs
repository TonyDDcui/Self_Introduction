import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

function toPosixPath(p) {
  return p.split(path.sep).join("/");
}

function shouldIgnore(relPosixPath) {
  // Normalize to no leading "./"
  const rel = relPosixPath.replace(/^\.\//, "");

  const ignorePrefixes = [
    ".git",
    "node_modules",
    ".next",
    "out",
    "dist",
    "build",
    ".turbo",
    "coverage",
    // Prevent recursion / duplicate ingestion of generated assets
    "public/repo-images",
  ];

  return ignorePrefixes.some((prefix) => rel === prefix || rel.startsWith(prefix + "/"));
}

async function walk(rootDirAbs, dirAbs, outAbsFiles) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });

  for (const ent of entries) {
    const abs = path.join(dirAbs, ent.name);
    const rel = path.relative(rootDirAbs, abs);
    const relPosix = toPosixPath(rel);

    if (shouldIgnore(relPosix)) continue;

    if (ent.isDirectory()) {
      await walk(rootDirAbs, abs, outAbsFiles);
      continue;
    }

    if (!ent.isFile()) continue;

    const ext = path.extname(ent.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;

    outAbsFiles.push(abs);
  }
}

async function mkdirp(dirAbs) {
  await fs.mkdir(dirAbs, { recursive: true });
}

async function copyWithDirs(srcAbs, dstAbs) {
  await mkdirp(path.dirname(dstAbs));
  await fs.copyFile(srcAbs, dstAbs);
}

async function main() {
  const repoRootAbs = process.cwd();

  const manifestOutAbs = path.join(
    repoRootAbs,
    "src",
    "generated",
    "repo-images-manifest.json",
  );
  const publicRepoImagesRootAbs = path.join(repoRootAbs, "public", "repo-images");

  const absFiles = [];
  await walk(repoRootAbs, repoRootAbs, absFiles);

  absFiles.sort((a, b) =>
    toPosixPath(path.relative(repoRootAbs, a)).localeCompare(
      toPosixPath(path.relative(repoRootAbs, b)),
    ),
  );

  const manifest = [];
  let copied = 0;

  for (const fileAbs of absFiles) {
    const rel = path.relative(repoRootAbs, fileAbs);
    const originalPath = toPosixPath(rel);

    const extWithDot = path.extname(originalPath).toLowerCase();
    const ext = extWithDot.replace(/^\./, "");
    const name = path.basename(originalPath, extWithDot);

    const publicPath = `/repo-images/${originalPath}`;

    const destAbs = path.join(publicRepoImagesRootAbs, ...originalPath.split("/"));
    await copyWithDirs(fileAbs, destAbs);
    copied += 1;

    manifest.push({ originalPath, publicPath, name, ext });
  }

  await mkdirp(path.dirname(manifestOutAbs));
  await fs.writeFile(manifestOutAbs, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log("[gen:images] repo root:", repoRootAbs);
  console.log("[gen:images] images found:", manifest.length);
  console.log("[gen:images] images copied:", copied);
  console.log("[gen:images] manifest:", manifestOutAbs);
  console.log("[gen:images] public base:", publicRepoImagesRootAbs);
}

main().catch((err) => {
  console.error("[gen:images] failed:", err);
  process.exitCode = 1;
});

