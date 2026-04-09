/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PhotoRow } from "../../lib/gallery/photos";
import GalleryImage from "./GalleryImage";
import styles from "./AlbumStoryFeed.module.css";

export default function AlbumStoryFeed(props: {
  photos: PhotoRow[];
  narratives: Map<string, string>;
  canDelete?: boolean;
  debugByPhotoId?: Map<string, string>;
}) {
  const { photos, narratives, canDelete = false, debugByPhotoId } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [items, setItems] = useState<PhotoRow[]>(photos);

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  return (
    <section className={styles.wrap} aria-label="相册图文">
      {items.map((photo, idx) => {
        const narrative = narratives.get(photo.id) || "";
        const alt = "照片";
        const debug = debugByPhotoId?.get(photo.id);

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

              {narrative ? <p className={styles.narrative}>{narrative}</p> : null}
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

