"use client";

import { useEffect, useRef, useState } from "react";
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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Trigger entrance animation after mount (respects prefers-reduced-motion via CSS).
    setEntered(true);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;

    const readNavHeight = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--nav-height");
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) ? n : 42;
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const trackH = track.offsetHeight;
      const vh = window.innerHeight;
      const navH = readNavHeight();
      const start = navH + 16; // keep below nav
      const denom = Math.max(1, trackH - vh);
      const p = Math.min(1, Math.max(0, (start - rect.top) / denom));
      sticky.style.setProperty("--expand-p", p.toFixed(4));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
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

        <div className={styles.heroCardRow} ref={trackRef}>
          <div className={styles.heroCardSticky} ref={stickyRef}>
            <FluffyEelCard />
          </div>
        </div>
      </div>
    </section>
  );
}
