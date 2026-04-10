import Link from "next/link";
import { getAllPostsMeta } from "../../src/lib/blog/fs";
import styles from "../../src/styles/blog.module.css";
import { getServerLang } from "../../src/lib/i18n/server";
import { t } from "../../src/lib/i18n/strings";

export default async function BlogIndexPage() {
  const lang = getServerLang();
  const posts = await getAllPostsMeta(lang);

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>{t(lang, "blog.title")}</h1>
      {posts.length === 0 ? (
        <p>{t(lang, "blog.empty")}</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.slug} className={styles.card}>
              <Link className={styles.cardLink} href={`/blog/${post.slug}`}>
                <h2 className={styles.cardTitle}>{post.title}</h2>
                {post.date ? (
                  <p className={styles.meta}>
                    <time dateTime={post.date}>{post.date}</time>
                  </p>
                ) : null}
                {post.summary ? <p className={styles.summary}>{post.summary}</p> : null}
                {post.tags.length ? (
                  <p className={styles.tags}>{post.tags.map((t) => `#${t}`).join(" ")}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
