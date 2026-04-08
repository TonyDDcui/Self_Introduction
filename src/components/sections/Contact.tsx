import Link from "next/link";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <section
      id="contact"
      className={styles.section}
      aria-label="Contact section"
      data-reveal
      data-delay="240"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>Contact</h2>
          <p className={styles.subtitle}>
            如果你也在做硬件、软件，或只是想聊聊日落与相机，都欢迎来信。
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
            也可以从{" "}
            <Link className={styles.link} href="/blog">
              Blog
            </Link>{" "}
            了解更多内容更新。
          </p>
        </div>

        <div className={styles.footer}>
          <a className={styles.pillLink} href="mailto:someometony@outlook.com">
            Send email
          </a>
        </div>
      </div>
    </section>
  );
}
