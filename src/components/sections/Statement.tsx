import styles from "./Statement.module.css";
import GlasswingExpand from "./GlasswingExpand";

export default function Statement() {
  return (
    <section
      aria-label="Statement section"
      className={styles.section}
      data-reveal
      data-delay="20"
    >
      <GlasswingExpand>
        <div className={styles.inner}>
          <p className={styles.text}>做工程，也写日常；爱拆解，也爱抬头看天色。</p>
        </div>
      </GlasswingExpand>
    </section>
  );
}

