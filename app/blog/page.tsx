import { getAllPostsMeta } from "../../src/lib/blog/fs";
import BlogIndexClient from "../../src/components/blog/BlogIndexClient";
import styles from "../../src/styles/blog.module.css";
import { getServerLang } from "../../src/lib/i18n/server";
import { t } from "../../src/lib/i18n/strings";

export const preferredRegion = ["hkg1"];

export default async function BlogIndexPage() {
  const lang = getServerLang();
  const posts = await getAllPostsMeta(lang);

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>{t(lang, "blog.title")}</h1>
      {posts.length === 0 ? (
        <p>{t(lang, "blog.empty")}</p>
      ) : (
        <BlogIndexClient lang={lang} initialPosts={posts} />
      )}
    </main>
  );
}
