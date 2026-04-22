"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./Writing.module.css";

type PostMetaClient = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  source_url?: string;
};

export default function WritingClient(props: {
  posts: PostMetaClient[];
  readLabel: string;
}) {
  const { posts, readLabel } = props;
  const router = useRouter();

  return (
    <ul className={styles.list}>
      {posts.map((p) => {
        const targetHref = p.source_url || `/blog/${p.slug}`;
        const itemKey = p.slug || p.source_url || `${p.title}-${p.date}`;
        return (
          <li key={itemKey} className={styles.itemWrap}>
            <article
              className={styles.item}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (p.source_url) {
                  window.open(p.source_url, "_blank", "noopener,noreferrer");
                } else {
                  router.push(`/blog/${p.slug}`);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (p.source_url) {
                    window.open(p.source_url, "_blank", "noopener,noreferrer");
                  } else {
                    router.push(`/blog/${p.slug}`);
                  }
                }
              }}
            >
              <h3 className={styles.itemTitle}>{p.title}</h3>

              {p.date ? (
                <p className={styles.meta}>
                  <time dateTime={p.date}>{p.date}</time>
                </p>
              ) : null}

              {p.summary ? <p className={styles.summary}>{p.summary}</p> : null}

              {p.tags.length ? (
                <div className={styles.tags} aria-label="Post tags">
                  {p.tags.map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className={styles.cardCtas}>
                <Link
                  className={styles.pillLinkOutline}
                  href={targetHref}
                  target={p.source_url ? "_blank" : undefined}
                  rel={p.source_url ? "noreferrer" : undefined}
                  onClick={(e) => e.stopPropagation()}
                >
                  {readLabel}
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

