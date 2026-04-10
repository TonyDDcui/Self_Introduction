import Link from "next/link";
import styles from "./Writing.module.css";
import { getAllPostsMeta } from "../../lib/blog/fs";
import SectionGlass from "./SectionGlass";
import { getServerLang } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/strings";

export default async function Writing() {
  const lang = getServerLang();
  const posts = (await getAllPostsMeta(lang)).slice(0, 3);

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
            <ul className={styles.list}>
              {posts.map((p) => (
                <li key={p.slug} className={styles.item}>
                  <Link className={styles.itemLinkWrap} href={`/blog/${p.slug}`}>
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
                  </Link>
                </li>
              ))}
            </ul>
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
