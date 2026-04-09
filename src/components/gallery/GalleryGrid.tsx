"use client";

import type { PhotoRow } from "../../lib/gallery/photos";
import styles from "./GalleryGrid.module.css";
import GalleryImage from "./GalleryImage";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function GalleryGrid(props: { photos: PhotoRow[]; canDelete?: boolean }) {
  const { photos, canDelete = false } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [items, setItems] = useState<PhotoRow[]>(photos);

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  return (
    <div className={styles.grid} role="list">
      {items.map((photo) => {
        const alt = photo.title?.trim() || photo.caption?.trim() || "照片";
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
                {photo.title ? (
                  <div className={styles.title}>{photo.title}</div>
                ) : null}
                {photo.caption ? (
                  <div className={styles.text}>{photo.caption}</div>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
