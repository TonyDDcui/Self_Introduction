import Link from "next/link";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <section
      id="contact"
      className={styles.section}
      aria-label="Contact section"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>Contact</h2>
          <p className={styles.subtitle}>
            联系方式占位：后续可替换为 Email、社交账号、以及可选的表单/Calendly 等。
          </p>
        </header>

        <div className={styles.body}>
          <p className={styles.paragraph}>
            Email：{" "}
            <a className={styles.link} href="mailto:hello@example.com">
              hello@example.com
            </a>
          </p>
          <p className={styles.paragraph}>
            也可以从{" "}
            <Link className={styles.link} href="/blog">
              Blog
            </Link>{" "}
            了解更多内容更新。
          </p>
        </div>

        <div className={styles.footer}>
          <a className={styles.pillLink} href="mailto:hello@example.com">
            Send email
          </a>
        </div>
      </div>
    </section>
  );
}
