import Link from "next/link";
import styles from "./Writing.module.css";
import { getAllPostsMeta } from "../../lib/blog/fs";

export default async function Writing() {
  const posts = (await getAllPostsMeta()).slice(0, 3);

  return (
    <section
      id="writing"
      className={styles.section}
      aria-label="Latest writing section"
      data-reveal
      data-delay="160"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>Writing</h2>
          <p className={styles.subtitle}>
            从 Blog 元信息读取最新 3 篇（不足则展示现有）。保持卡片化排版与轻量标签。
          </p>
        </header>

        {posts.length === 0 ? (
          <p className={styles.empty}>
            暂无文章。你可以先访问{" "}
            <Link className={styles.link} href="/blog">
              /blog
            </Link>{" "}
            查看占位页面。
          </p>
        ) : (
          <ul className={styles.list}>
            {posts.map((p) => (
              <li key={p.slug} className={styles.item}>
                <h3 className={styles.itemTitle}>
                  <Link className={styles.itemLink} href={`/blog/${p.slug}`}>
                    {p.title}
                  </Link>
                </h3>

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
              </li>
            ))}
          </ul>
        )}

        <div className={styles.footer}>
          <Link className={styles.pillLink} href="/blog">
            View all writing
          </Link>
        </div>
      </div>
    </section>
  );
}
