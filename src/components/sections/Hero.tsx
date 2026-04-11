"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";
import Button from "../ui/Button";
import { readClientLang } from "../../lib/i18n/client";
import { t } from "../../lib/i18n/strings";

export default function Hero() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const lang = readClientLang();

  useEffect(() => {
    // Trigger entrance animation after mount (respects prefers-reduced-motion via CSS).
    setEntered(true);
  }, []);

  return (
    <section className={styles.hero} aria-label="Home hero">
      <div className={`${styles.inner} ${entered ? styles.entered : ""}`}>
        <div className={styles.heroTop}>
          <div className={styles.heroCopy}>
            <h1 className={styles.title}>箫</h1>
            <p className={styles.subtitle}>
              {t(lang, "hero.subtitle").split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx === 0 ? <br /> : null}
                </span>
              ))}
            </p>
          </div>

          {/* uiverse.io/Kemboi-Dun/slimy-chicken-73（做了 A2 主题适配，作为个人亮点卡） */}
          <aside className={styles.highlightCard} aria-label="个人亮点">
            <div className={styles.highlightTitle}>《常相会》</div>
            <div className={styles.highlightBody}>
              <p className={styles.highlightLine}>人间的面，吃一碗，少一碗</p>
              <p className={styles.highlightLine}>人间的面，见一面，少一面。</p>
              <p className={styles.highlightLine}>面要常吃，面要常见</p>
            </div>
          </aside>
        </div>

        <div className={styles.ctaRow}>
          <Button
            variant="applePill"
            className={styles.cta}
            onClick={() => router.push("/blog")}
          >
            {t(lang, "hero.blog")}
          </Button>
          <Button
            variant="applePill"
            className={styles.cta}
            onClick={() => {
              const el = document.getElementById("about");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              window.location.hash = "about";
            }}
          >
            {t(lang, "hero.learnMore")}
          </Button>
        </div>

        {/* uiverse.io/drewsephski/polite-termite-5（终端卡片变体，文字固定） */}
        <div className={styles.terminalCard} aria-label="Hello World terminal">
          <div className={styles.terminalWrap}>
            <div className={styles.terminalHead}>
              <div className={styles.terminalTitle}>terminal</div>
              <div className={styles.terminalDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className={styles.terminalBody}>
              <div className={styles.pre}>
                <code>$</code>
                <code> Hello World！</code>
                <span className={styles.cursor} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
