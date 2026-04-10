import Link from "next/link";
import styles from "./About.module.css";
import AboutAvatar from "./AboutAvatar";
import SectionGlass from "./SectionGlass";
import { getServerLang } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/strings";

export default function About() {
  const lang = getServerLang();
  return (
    <section
      id="about"
      className={styles.section}
      aria-label="About section"
      data-reveal
      data-delay="0"
    >
      <SectionGlass>
        <div className={styles.inner}>
          <header className={styles.header}>
            <div className={styles.headerText}>
              <h2 className={styles.title}>{t(lang, "section.about.title")}</h2>
              <p className={styles.subtitle}>
                {t(lang, "section.about.subtitle")}
              </p>
            </div>
            <AboutAvatar />
          </header>

          <div className={styles.body}>
            <p className={styles.paragraph}>
              {t(lang, "section.about.p1").split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx === 0 ? <br /> : null}
                </span>
              ))}
            </p>
            <p className={styles.paragraph}>
              {t(lang, "section.about.p2.pre")}
              <Link className={styles.link} href="/blog">
                {t(lang, "section.about.p2.blog")}
              </Link>{" "}
              {t(lang, "section.about.p2.mid")}
              <Link className={styles.link} href="/gallery">
                {t(lang, "section.about.p2.gallery")}
              </Link>{" "}
              {t(lang, "section.about.p2.post")}
            </p>

            <div className={styles.highlights} aria-label="Highlights">
              <div className={styles.highlightItem}>
                <div className={styles.highlightLabel}>竞赛奖项</div>
                <div className={styles.highlightValue}>（待补充）</div>
              </div>
              <div className={styles.highlightItem}>
                <div className={styles.highlightLabel}>公开项目</div>
                <div className={styles.highlightValue}>3</div>
              </div>
              <div className={styles.highlightItem}>
                <div className={styles.highlightLabel}>兴趣</div>
                <div className={styles.highlightValue}>科技 / 摄影 / 文学 / 日落</div>
              </div>
            </div>
          </div>
        </div>
      </SectionGlass>
    </section>
  );
}
