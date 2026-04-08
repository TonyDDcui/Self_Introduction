import Link from "next/link";
import { getAllPostsMeta } from "../../src/lib/blog/fs";
import styles from "../../src/styles/blog.module.css";

export default async function BlogIndexPage() {
  const posts = await getAllPostsMeta();

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Blog</h1>
      {posts.length === 0 ? (
        <p>暂无文章。</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.slug} className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              {post.date ? (
                <p className={styles.meta}>
                  <time dateTime={post.date}>{post.date}</time>
                </p>
              ) : null}
              {post.summary ? (
                <p className={styles.summary}>{post.summary}</p>
              ) : null}
              {post.tags.length ? (
                <p className={styles.tags}>
                  {post.tags.map((t) => `#${t}`).join(" ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
