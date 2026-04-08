import Link from "next/link";
import styles from "./About.module.css";

export default function About() {
  return (
    <section id="about" className={styles.section} aria-label="About section">
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>About</h2>
          <p className={styles.subtitle}>
            做工程，也写日常；爱拆解，也爱抬头看天色。
          </p>
        </header>

        <div className={styles.body}>
          <p className={styles.paragraph}>
            我是崔喆箫，做嵌入式 / 硬件 / 软件开发。性格偏 ENTP：好奇心有点“骨折眉”——
            总想把世界拆开看看，再认真装回去。
            <br />
            白天和电路、日志打交道；傍晚追一段日落；夜里翻几页苏轼或李白，
            让脑子在诗里散个步。
          </p>
          <p className={styles.paragraph}>
            你可以先看看{" "}
            <Link className={styles.link} href="/blog">
              Blog
            </Link>{" "}
            的项目记录与随笔，或去{" "}
            <Link className={styles.link} href="/gallery">
              Gallery
            </Link>{" "}
            找找我留下的素材与片段（如果仓库里有图片，它会自动出现）。
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
    </section>
  );
}
