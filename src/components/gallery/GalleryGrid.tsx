import type { PhotoRow } from "../../lib/gallery/photos";
import styles from "./GalleryGrid.module.css";
import GalleryImage from "./GalleryImage";

export default function GalleryGrid(props: { photos: PhotoRow[] }) {
  const { photos } = props;

  return (
    <div className={styles.grid} role="list">
      {photos.map((photo) => {
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
