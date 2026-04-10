/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PhotoRow } from "../../lib/gallery/photos";
import GalleryImage from "./GalleryImage";
import styles from "./AlbumStoryFeed.module.css";
import { tryExtractCaption } from "../../lib/ai/captionGuard";

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

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  useEffect(() => {
    setLocalNarratives(narratives);
  }, [narratives]);

  useEffect(() => {
    setLocalDebug(debugByPhotoId);
  }, [debugByPhotoId]);

  return (
    <section className={styles.wrap} aria-label="相册图文">
      {items.map((photo, idx) => {
        const narrativeRaw = localNarratives[photo.id] || "";
        const narrative = narrativeRaw ? tryExtractCaption(narrativeRaw) ?? "" : "";
        const alt = "照片";
        const debug = localDebug?.[photo.id];

        return (
          <div key={photo.id}>
            <article className={styles.item}>
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

              {narrative ? <p className={styles.narrative}>{narrative}</p> : null}

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

              {canDelete && narrativeRaw && !narrative ? (
                <div className={styles.debug}>
                  AI 配文疑似包含过程文，已自动隐藏（仅管理员可见）。
                  <br />
                  <code>请点击「重新生成配文」</code>
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
