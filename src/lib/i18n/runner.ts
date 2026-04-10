import { sql } from "../db";

import { updateJob } from "./jobs";
import { sha256 } from "./hash";
import { getPhotoTranslation, upsertPhotoTranslation } from "./photoTranslations";
import { translateGalleryToEn } from "./galleryTranslate";

import type { PhotoRow } from "../gallery/photos";

async function getPhotoById(id: string): Promise<PhotoRow | null> {
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
    where id = ${id}
    limit 1
  `;
  return rows[0] ?? null;
}

async function getNarrativeZh(photoId: string): Promise<string> {
  const { rows } = await sql<{ narrative_md: string }>`
    select narrative_md
    from photo_narratives
    where photo_id = ${photoId}
    limit 1
  `;
  return rows[0]?.narrative_md ?? "";
}

export async function runPhotoEnJob(jobId: string, photoId: string) {
  if (!process.env.EDGEFN_API_KEY) {
    await updateJob(jobId, {
      state: "failed",
      progress: 100,
      message: "缺少翻译密钥",
      error: "EDGEFN_API_KEY_NOT_SET",
    });
    return;
  }

  await updateJob(jobId, { state: "running", progress: 10, message: "读取照片信息…" });
  const photo = await getPhotoById(photoId);
  if (!photo) throw new Error("PHOTO_NOT_FOUND");

  const narrativeZh = (await getNarrativeZh(photoId)) || photo.caption?.trim() || "";
  const titleZh = (photo.title ?? "").trim();
  const tagsZh = (photo.tags ?? []).map((t) => String(t)).map((t) => t.trim()).filter(Boolean);
  const captionZh = (photo.caption ?? "").trim();

  const sourceHash = sha256(`${titleZh}\n${JSON.stringify(tagsZh)}\n${narrativeZh}\n${captionZh}`);

  const cached = await getPhotoTranslation(photoId, "en");
  if (
    cached?.source_hash === sourceHash &&
    (cached.title ?? "").trim() &&
    (cached.narrative_md ?? "").trim()
  ) {
    await updateJob(jobId, { state: "done", progress: 100, message: "已命中缓存" });
    return;
  }

  await updateJob(jobId, { progress: 35, message: "翻译标题与标签…" });
  await updateJob(jobId, { progress: 55, message: "翻译配文…" });

  const out = await translateGalleryToEn({ titleZh, tagsZh, narrativeZh });

  await updateJob(jobId, { progress: 90, message: "写入缓存…" });
  await upsertPhotoTranslation({
    photoId,
    lang: "en",
    title: out.title,
    tags: out.tags,
    narrativeMd: out.narrative_md,
    sourceHash,
  });

  await updateJob(jobId, { state: "done", progress: 100, message: "完成" });
}

