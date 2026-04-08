import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Home hero">
      <div className={styles.inner}>
        <h1 className={styles.title}>崔喆箫</h1>
        <p className={styles.subtitle}>
          嵌入式 / 硬件 / 软件开发工程师。<br />
          科技与摄影是日常，文学与日落是背景音乐。
        </p>

        <div className={styles.ctaRow}>
          <a className={[styles.cta, styles.ctaSecondary].join(" ")} href="#about">
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
