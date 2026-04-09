import Link from "next/link";

import type { AlbumSummary } from "../../lib/gallery/albums";
import GalleryImage from "./GalleryImage";
import styles from "./AlbumGrid.module.css";

export default function AlbumGrid(props: { albums: AlbumSummary[] }) {
  const { albums } = props;

  return (
    <div className={styles.grid} role="list" aria-label="相册列表">
      {albums.map((a) => (
        <Link
          key={a.slug}
          href={`/gallery/albums/${a.slug}`}
          className={styles.cardLink}
        >
          <article className={styles.card} role="listitem">
            <div className={styles.media}>
              {a.coverUrl ? (
                <GalleryImage
                  className={styles.img}
                  src={a.coverUrl}
                  alt={a.coverAlt}
                  downloadHref={a.coverUrl}
                />
              ) : null}
            </div>
            <div className={styles.body}>
              <h3 className={styles.title}>{a.title}</h3>
              <span className={styles.count}>{a.count} 张</span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

