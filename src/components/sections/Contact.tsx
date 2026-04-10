import Link from "next/link";
import styles from "./Contact.module.css";
import SectionGlass from "./SectionGlass";
import { getServerLang } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/strings";

export default function Contact() {
  const lang = getServerLang();
  return (
    <section
      id="contact"
      className={styles.section}
      aria-label="Contact section"
      data-reveal
      data-delay="240"
    >
      <SectionGlass>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h2 className={styles.title}>{t(lang, "section.contact.title")}</h2>
            <p className={styles.subtitle}>
              {t(lang, "section.contact.subtitle")}
            </p>
          </header>

          <div className={styles.body}>
            <p className={styles.paragraph}>
              Email：{" "}
              <a className={styles.link} href="mailto:someometony@outlook.com">
                someometony@outlook.com
              </a>
            </p>
            <p className={styles.paragraph}>
              {t(lang, "section.contact.p2.pre")}
              <Link className={styles.link} href="/blog">
                {t(lang, "section.contact.p2.blog")}
              </Link>{" "}
              {t(lang, "section.contact.p2.post")}
            </p>
          </div>

          <div className={styles.footer}>
            <a className={styles.pillLink} href="mailto:someometony@outlook.com">
              {t(lang, "section.contact.sendEmail")}
            </a>
          </div>
        </div>
      </SectionGlass>
    </section>
  );
}
