"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ReadingProgress.module.css";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function ReadingProgress(props: {
  /**
   * 用于计算阅读进度的正文容器选择器（默认 blog 页的 .prose）
   */
  targetSelector?: string;
}) {
  const targetSelector = useMemo(
    () => props.targetSelector ?? ".prose",
    [props.targetSelector],
  );

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const compute = () => {
      const el = document.querySelector(targetSelector) as HTMLElement | null;
      if (!el) {
        setProgress(0);
        return;
      }

      const rect = el.getBoundingClientRect();
      const startY = rect.top + window.scrollY;
      const endY = startY + el.offsetHeight - window.innerHeight;

      if (!Number.isFinite(endY) || endY <= startY) {
        setProgress(1);
        return;
      }

      const p = clamp01((window.scrollY - startY) / (endY - startY));
      setProgress(p);
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [targetSelector]);

  return (
    <div
      className={styles.wrap}
      role="progressbar"
      aria-label="阅读进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div className={styles.track} />
      <div className={styles.bar} style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

