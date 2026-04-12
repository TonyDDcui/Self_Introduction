"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";
import Button from "../ui/Button";
import FluffyEelCard from "./FluffyEelCard";
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
        <h1 className={styles.title}>箫</h1>
        <p className={styles.subtitle}>
          {t(lang, "hero.subtitle").split("\n").map((line, idx) => (
            <span key={idx}>
              {line}
              {idx === 0 ? <br /> : null}
            </span>
          ))}
        </p>

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

        <div className={styles.heroCardRow}>
          <FluffyEelCard />
        </div>
      </div>
    </section>
  );
}
