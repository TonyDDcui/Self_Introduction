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

export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (elements.length === 0) return;

    // If the environment doesn't support IntersectionObserver, reveal immediately.
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const el = entry.target as HTMLElement;

          const delay = el.dataset.delay;
          if (delay) {
            el.style.setProperty("--reveal-delay", normalizeDelay(delay));
          }

          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      {
        // Trigger slightly before fully entering the viewport.
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      }
    );

    elements.forEach((el) => {
      // Avoid re-observing items already revealed (e.g. back/forward cache).
      if (!el.classList.contains("is-visible")) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

