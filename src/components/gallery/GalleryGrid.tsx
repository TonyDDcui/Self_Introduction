"use client";

import type { PhotoRow } from "../../lib/gallery/photos";
import styles from "./GalleryGrid.module.css";
import GalleryImage from "./GalleryImage";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { readClientLang } from "../../lib/i18n/client";
import TranslationProgress from "../i18n/TranslationProgress";

type JobState = {
  jobId: string;
  state: "queued" | "running" | "done" | "failed";
  progress: number;
  message: string;
  error?: string;
  translation?: { title?: string | null; tags?: unknown; narrative_md?: string | null };
};

export default function GalleryGrid(props: { photos: PhotoRow[]; canDelete?: boolean }) {
  const { photos, canDelete = false } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [items, setItems] = useState<PhotoRow[]>(photos);
  const [jobsByPhotoId, setJobsByPhotoId] = useState<Record<string, JobState>>({});
  const lang = readClientLang();

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  useEffect(() => {
    if (lang !== "en") return;
    let cancelled = false;

    async function ensureJobs() {
      const next: Record<string, JobState> = {};
      const targets = items.slice(0, 36); // 首屏 + 少量预取，避免一次性刷爆

      for (const p of targets) {
        try {
          const res = await fetch(`/api/i18n/gallery/photos/${p.id}/en/ensure`, { method: "POST" });
          const data = (await res.json().catch(() => null)) as { ok?: boolean; jobId?: string } | null;
          if (!res.ok || !data?.ok || !data.jobId) continue;
          next[p.id] = { jobId: data.jobId, state: "queued", progress: 0, message: "排队中…" };
        } catch {
          // ignore
        }
      }

      if (!cancelled) {
        setJobsByPhotoId((prev) => ({ ...next, ...prev }));
      }
    }

    void ensureJobs();

    return () => {
      cancelled = true;
    };
  }, [items, lang]);

  useEffect(() => {
    if (lang !== "en") return;
    const timer = setInterval(() => {
      const entries = Object.entries(jobsByPhotoId).filter(
        ([, v]) => v && v.jobId && v.state !== "done" && v.state !== "failed",
      );
      if (!entries.length) return;

      void Promise.all(
        entries.map(async ([photoId, st]) => {
          try {
            const res = await fetch(`/api/i18n/jobs/${st.jobId}`, { method: "GET" });
            const data = (await res.json().catch(() => null)) as
              | {
                  ok?: boolean;
                  job?: { state?: string; progress?: number; message?: string; error?: string | null };
                  translation?: { title?: string | null; tags?: unknown; narrative_md?: string | null };
                }
              | null;
            if (!res.ok || !data?.ok || !data.job) return;

            const j = data.job;
            const nextState = (j.state as JobState["state"]) || st.state;
            const next: JobState = {
              ...st,
              state: nextState,
              progress: typeof j.progress === "number" ? j.progress : st.progress,
              message: typeof j.message === "string" && j.message.trim() ? j.message : st.message,
              error: typeof j.error === "string" ? j.error : st.error,
              translation: data.translation ?? st.translation,
            };
            setJobsByPhotoId((prev) => ({ ...prev, [photoId]: next }));
          } catch {
            // ignore
          }
        }),
      );
    }, 900);

    return () => clearInterval(timer);
  }, [jobsByPhotoId, lang]);

  return (
    <div className={styles.grid} role="list">
      {items.map((photo) => {
        const job = jobsByPhotoId[photo.id];
        const tTitle = job?.translation?.title?.trim();
        const alt = tTitle || photo.title?.trim() || photo.caption?.trim() || "照片";
        const tags = job?.translation?.tags;
        const tagList = Array.isArray(tags) ? tags.map((x) => String(x)).filter(Boolean) : [];

        return (
          <article key={photo.id} className={styles.card} role="listitem">
            <div className={styles.media}>
              <GalleryImage
                className={styles.img}
                src={photo.blob_url}
                alt={alt}
                downloadHref={photo.blob_url}
              />

              {canDelete ? (
                <button
                  type="button"
                  className={styles.deleteButton}
                  disabled={isPending && deletingId === photo.id}
                  onClick={() => {
                    const ok = confirm("确定要删除这张照片吗？该操作不可恢复。");
                    if (!ok) return;
                    setDeletingId(photo.id);
                    startTransition(async () => {
                      try {
                        const res = await fetch(`/api/gallery/photos/${photo.id}`, {
                          method: "DELETE",
                        });
                        if (!res.ok) {
                          const data = (await res.json().catch(() => null)) as
                            | { reason?: string }
                            | null;
                          throw new Error(data?.reason || `HTTP ${res.status}`);
                        }
                        // 乐观更新 + 再 refresh 保证与服务端一致
                        setItems((prev) => prev.filter((x) => x.id !== photo.id));
                        router.refresh();
                      } catch (e) {
                        alert(`删除失败：${(e as Error).message}`);
                      } finally {
                        setDeletingId(null);
                      }
                    });
                  }}
                  aria-label="删除照片"
                  title="删除照片"
                >
                  删除
                </button>
              ) : null}
            </div>

            {photo.title || photo.caption ? (
              <div className={styles.caption}>
                {lang === "en" ? (
                  job?.state === "done" && tTitle ? (
                    <div className={styles.title}>{tTitle}</div>
                  ) : (
                    <TranslationProgress progress={job?.progress ?? 0} message={job?.message} />
                  )
                ) : photo.title ? (
                  <div className={styles.title}>{photo.title}</div>
                ) : null}
                {photo.caption ? (
                  <div className={styles.text}>{photo.caption}</div>
                ) : null}
                {lang === "en" && tagList.length ? (
                  <div className={styles.text} style={{ color: "var(--text-tertiary)" }}>
                    {tagList.map((t) => `#${t}`).join(" ")}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
