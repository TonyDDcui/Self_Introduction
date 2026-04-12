/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PhotoRow } from "../../lib/gallery/photos";
import GalleryImage from "./GalleryImage";
import styles from "./AlbumStoryFeed.module.css";
import { readClientLang } from "../../lib/i18n/client";
import TranslationProgress from "../i18n/TranslationProgress";
import { pickPhotoSrc } from "../../lib/gallery/thumbnails";

type JobState = {
  jobId: string;
  state: "queued" | "running" | "done" | "failed";
  progress: number;
  message: string;
  error?: string;
  translation?: { title?: string | null; tags?: unknown; narrative_md?: string | null };
};

export default function AlbumStoryFeed(props: {
  photos: PhotoRow[];
  narratives: Record<string, string>;
  canDelete?: boolean;
  debugByPhotoId?: Record<string, string>;
}) {
  const { photos, narratives, canDelete = false, debugByPhotoId } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [regenId, setRegenId] = useState<string | null>(null);
  const [items, setItems] = useState<PhotoRow[]>(photos);
  const [localNarratives, setLocalNarratives] = useState<Record<string, string>>(narratives);
  const [localDebug, setLocalDebug] = useState<Record<string, string> | undefined>(debugByPhotoId);
  const [jobsByPhotoId, setJobsByPhotoId] = useState<Record<string, JobState>>({});
  const lang = readClientLang();

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  useEffect(() => {
    setLocalNarratives(narratives);
  }, [narratives]);

  useEffect(() => {
    setLocalDebug(debugByPhotoId);
  }, [debugByPhotoId]);

  useEffect(() => {
    if (lang !== "en") return;
    // 英文模式：不展示中文配文，等待翻译任务完成
    setLocalNarratives({});
  }, [lang]);

  useEffect(() => {
    if (lang !== "en") return;
    let cancelled = false;

    async function ensureJobs() {
      const next: Record<string, JobState> = {};
      const targets = items.slice(0, 60);
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
      if (!cancelled) setJobsByPhotoId((prev) => ({ ...next, ...prev }));
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

            if (nextState === "done" && next.translation?.narrative_md) {
              setLocalNarratives((prev) => ({ ...prev, [photoId]: String(next.translation!.narrative_md) }));
            }
          } catch {
            // ignore
          }
        }),
      );
    }, 900);

    return () => clearInterval(timer);
  }, [jobsByPhotoId, lang]);

  return (
    <section className={styles.wrap} aria-label="相册图文">
      {items.map((photo, idx) => {
        const narrative = localNarratives[photo.id] || "";
        const alt = "照片";
        const debug = localDebug?.[photo.id];
        const job = jobsByPhotoId[photo.id];
        const tTitle = job?.translation?.title?.trim();
        const tags = job?.translation?.tags;
        const tagList = Array.isArray(tags) ? tags.map((x) => String(x)).filter(Boolean) : [];

        return (
          <div key={photo.id}>
            <article className={styles.item}>
              <div className={styles.media}>
                <GalleryImage
                  className={styles.img}
                  src={pickPhotoSrc(photo)}
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
                          setItems((prev) => {
                            const next = prev.filter((x) => x.id !== photo.id);
                            // 如果相册里已经没有照片了：相册本身也会“消失”
                            // 直接回到相册列表，避免 refresh 后 slug 404
                            if (next.length === 0) {
                              router.replace("/gallery");
                            } else {
                              router.refresh();
                            }
                            return next;
                          });
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

              {lang === "en" ? (
                narrative ? (
                  <>
                    {tTitle ? <p className={styles.narrative} style={{ fontWeight: 650 }}>{tTitle}</p> : null}
                    <p className={styles.narrative}>{narrative}</p>
                    {tagList.length ? (
                      <p className={styles.narrative} style={{ color: "var(--text-tertiary)" }}>
                        {tagList.map((t) => `#${t}`).join(" ")}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <TranslationProgress progress={job?.progress ?? 0} message={job?.message} />
                )
              ) : narrative ? (
                <p className={styles.narrative}>{narrative}</p>
              ) : null}

              {canDelete ? (
                <div className={styles.actionsRow}>
                  <button
                    type="button"
                    className={styles.regenButton}
                    disabled={isPending && regenId === photo.id}
                    onClick={() => {
                      const ok = confirm("重新生成这张照片的 AI 配文？将覆盖旧内容。");
                      if (!ok) return;
                      setRegenId(photo.id);
                      startTransition(async () => {
                        try {
                          const res = await fetch(
                            `/api/gallery/photos/${photo.id}/narrative/regenerate`,
                            { method: "POST" },
                          );
                          const data = (await res.json().catch(() => null)) as
                            | { ok?: boolean; narrative?: string; reason?: string }
                            | null;
                          if (!res.ok || !data?.ok || !data?.narrative) {
                            throw new Error(data?.reason || `HTTP ${res.status}`);
                          }
                          setLocalNarratives((prev) => ({ ...prev, [photo.id]: data.narrative! }));
                          setLocalDebug((prev) => {
                            if (!prev) return prev;
                            const next = { ...prev };
                            delete next[photo.id];
                            return next;
                          });
                        } catch (e) {
                          alert(`重新生成失败：${(e as Error).message}`);
                        } finally {
                          setRegenId(null);
                        }
                      });
                    }}
                    aria-label="重新生成配文"
                    title="重新生成配文"
                  >
                    重新生成配文
                  </button>
                </div>
              ) : null}

              {debug ? (
                <div className={styles.debug}>
                  AI 配文未生成（仅管理员可见）：
                  <br />
                  <code>{debug}</code>
                </div>
              ) : null}
            </article>

            {idx < items.length - 1 ? <div className={styles.divider} /> : null}
          </div>
        );
      })}
    </section>
  );
}
