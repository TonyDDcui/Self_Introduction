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
            <div className={styles.highlightIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M6.2 12c.6-4.2 3-7 5.8-7s5.2 2.8 5.8 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M7.5 8.4c1.6 1.2 3 .9 4.5-.4 1.5 1.3 2.9 1.6 4.5.4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
            </div>
            <div className={styles.highlightTitle}>《常相会》</div>
            <div className={styles.highlightBody}>
              <p className={styles.highlightLine}>人间的面，吃一碗，少一碗</p>
              <p className={styles.highlightLine}>人间的面，见一面，少一面。</p>
              <p className={styles.highlightLine}>面要常吃，面要常见</p>
            </div>
          </aside>
        </div>

        {/* uiverse.io/drewsephski/polite-termite-5（保留原始设计） */}
        <div className={styles.terminalCard} aria-label="Hello World terminal">
          <div className={styles.termWrap}>
            <div className={styles.terminal}>
              <div className={styles.head}>
                <div className={styles.termTitle}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7h16M4 12h10M4 17h13"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  terminal
                </div>
                <button
                  type="button"
                  className={styles.copy_toggle}
                  onClick={() => navigator.clipboard?.writeText("Hello World！")}
                  aria-label="Copy"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M9 9h10v12H9V9Zm-4 6H4V4h11v1"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className={styles.body}>
                <div className={styles.pre}>
                  <code>$</code>
                  <code> Hello World！</code>
                  <span className={styles.cursor} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog / Learn more 两个按钮放在终端 UI 下面 */}
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
      </div>
    </section>
  );
}
