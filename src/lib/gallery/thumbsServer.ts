import sharp from "sharp";

import { sql } from "../db";
import { vercelBlobProvider } from "../storage/vercelBlobProvider";

const THUMB_WIDTH = 1280;
const THUMB_QUALITY = 82;

export function thumbFilename(photoId: string): string {
  return `gallery/thumbs/${photoId}.webp`;
}

export async function generateThumbWebp(input: Buffer): Promise<Buffer> {
  return await sharp(input)
    .rotate() // respect EXIF orientation
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer();
}

async function fetchAsBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`fetch_failed:${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

export async function generateAndPersistPhotoThumb(params: {
  photoId: string;
  blobUrl: string;
}): Promise<{ thumbUrl: string; thumbPathname: string }> {
  const original = await fetchAsBuffer(params.blobUrl);
  const thumbBuf = await generateThumbWebp(original);

  const put = await vercelBlobProvider.putImage({
    file: thumbBuf,
    filename: thumbFilename(params.photoId),
    contentType: "image/webp",
  });

  try {
    await sql`
      update photos
      set thumb_url = ${put.url},
          thumb_pathname = ${put.pathname}
      where id = ${params.photoId}::uuid
    `;
  } catch (err) {
    // Provide actionable error when DB migration hasn't been applied yet.
    const msg = err instanceof Error ? err.message : String(err);
    if (/thumb_(url|pathname)/i.test(msg)) {
      throw new Error("db_missing_thumb_columns");
    }
    throw err;
  }

  return { thumbUrl: put.url, thumbPathname: put.pathname };
}

