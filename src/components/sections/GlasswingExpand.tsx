"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import styles from "./GlasswingExpand.module.css";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function GlasswingExpand(props: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) {
      el.style.setProperty("--gw-p", "0");
      return;
    }

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;

        // Start expanding when the section enters the lower part of the viewport,
        // finish when it reaches near the top. (reversible on scroll-up)
        const start = vh * 0.72;
        const end = vh * 0.12;
        const p = clamp01((start - r.top) / (start - end));
        el.style.setProperty("--gw-p", String(p));
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} className={styles.wrap}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}

