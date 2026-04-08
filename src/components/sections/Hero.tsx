import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Home hero">
      <div className={styles.inner}>
        <h1 className={styles.title}>Self Introduction</h1>
        <p className={styles.subtitle}>
          一个极简的 Apple 风格主页 Hero，包含关于我锚点入口与 Blog 主 CTA。
        </p>

        <div className={styles.ctaRow}>
          <a className={[styles.cta, styles.ctaOutline].join(" ")} href="#about">
            Learn more
          </a>
          <Link className={[styles.cta, styles.ctaPrimary].join(" ")} href="/blog">
            Blog
          </Link>
        </div>
      </div>
    </section>
  );
}

