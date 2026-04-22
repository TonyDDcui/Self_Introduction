import Link from "next/link";
import styles from "./Writing.module.css";
import { getAllPostsMeta } from "../../lib/blog/fs";
import SectionGlass from "./SectionGlass";
import { getServerLang } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/strings";
import WritingClient from "./WritingClient";
import { fetchLatestBlogsFromBackend } from "../../lib/backendApi";

export default async function Writing() {
  const lang = getServerLang();
  const fallbackPosts = (await getAllPostsMeta(lang)).slice(0, 5);
  const wpPosts = await fetchLatestBlogsFromBackend(5);
  const posts =
    wpPosts.length > 0
      ? wpPosts.map((item) => ({
          slug: `wp-${item.id}`,
          title: item.title,
          date: item.date,
          summary: lang === "en" ? "Synced from WordPress" : "来自 WordPress 最新文章",
          tags: ["wordpress"],
          source_url: item.url,
        }))
      : fallbackPosts;
  const readLabel = lang === "en" ? "Read" : "阅读";

  return (
    <section
      id="writing"
      className={styles.section}
      aria-label="Latest writing section"
      data-reveal
      data-delay="160"
    >
      <SectionGlass>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h2 className={styles.title}>{t(lang, "section.writing.title")}</h2>
            <p className={styles.subtitle}>
              {t(lang, "section.writing.subtitle")}
            </p>
          </header>

          {posts.length === 0 ? (
            <p className={styles.empty}>
              {t(lang, "section.writing.empty.pre")}
              <Link className={styles.link} href="/blog">
                /blog
              </Link>{" "}
              {t(lang, "section.writing.empty.post")}
            </p>
          ) : (
            <WritingClient posts={posts} readLabel={readLabel} />
          )}

          <div className={styles.footer}>
            <Link className={styles.pillLink} href="/blog">
              {t(lang, "section.writing.viewAll")}
            </Link>
          </div>
        </div>
      </SectionGlass>
    </section>
  );
}
