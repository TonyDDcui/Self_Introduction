"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function normalizeDelay(value: string): string {
  // Allow "120" -> "120ms", keep "0ms"/"0.2s" as-is.
  const trimmed = value.trim();
  if (!trimmed) return "0ms";
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}ms`;
  return trimmed;
}

function isInViewport(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  // Match the observer's rootMargin/threshold intent: reveal slightly before fully in view.
  const topOk = r.top < window.innerHeight * 0.9;
  const bottomOk = r.bottom > 0;
  return topOk && bottomOk;
}

export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let observer: IntersectionObserver | null = null;
    let raf1 = 0;
    let raf2 = 0;

    const run = () => {
      // Always rebuild on route changes / history restores to avoid stale observers.
      if (observer) observer.disconnect();
      observer = null;

      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]"),
      );

      if (elements.length === 0) return;

      // If the environment doesn't support IntersectionObserver, reveal immediately.
      if (!("IntersectionObserver" in window)) {
        elements.forEach((el) => el.classList.add("is-visible"));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            const el = entry.target as HTMLElement;

            const delay = el.dataset.delay;
            if (delay) el.style.setProperty("--reveal-delay", normalizeDelay(delay));

            el.classList.add("is-visible");
            observer?.unobserve(el);
          }
        },
        {
          // Trigger slightly before fully entering the viewport.
          root: null,
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.12,
        },
      );

      // Observe elements not yet revealed.
      elements.forEach((el) => {
        if (!el.classList.contains("is-visible")) observer?.observe(el);
      });

      // Root-cause fix for "back from Gallery -> Home stays hidden":
      // In some browsers (especially with bfcache), IntersectionObserver callback may not fire
      // immediately on restore. We do a single synchronous viewport evaluation to reveal items
      // already in view right now (this is not a timeout fallback; it's the correct initial pass).
      elements.forEach((el) => {
        if (el.classList.contains("is-visible")) return;
        if (!isInViewport(el)) return;
        const delay = el.dataset.delay;
        if (delay) el.style.setProperty("--reveal-delay", normalizeDelay(delay));
        el.classList.add("is-visible");
        observer?.unobserve(el);
      });
    };

    const scheduleRun = () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => run());
      });
    };

    const onPageShow = () => scheduleRun();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") scheduleRun();
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    scheduleRun();

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
