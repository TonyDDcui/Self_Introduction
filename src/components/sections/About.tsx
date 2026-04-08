import Link from "next/link";
import styles from "./About.module.css";

export default function About() {
  return (
    <section id="about" className={styles.section} aria-label="About section">
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>About</h2>
          <p className={styles.subtitle}>
            这里将放置自我介绍内容（占位）。保持 Apple 风格的留白与弱化副文案。
          </p>
        </header>

        <div className={styles.body}>
          <p className={styles.paragraph}>
            我目前专注于：<strong>Web / UI</strong>、内容创作与工程化实践。后续会把简历、
            技能栈、经历等信息补到这里。
          </p>
          <p className={styles.paragraph}>
            你也可以先看看{" "}
            <Link className={styles.link} href="/blog">
              Blog
            </Link>{" "}
            或{" "}
            <Link className={styles.link} href="/gallery">
              Gallery
            </Link>{" "}
            （占位）。
          </p>
        </div>
      </div>
    </section>
  );
}
