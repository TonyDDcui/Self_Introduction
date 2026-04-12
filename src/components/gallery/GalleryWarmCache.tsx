"use client";

import { useEffect } from "react";

type Photo = { thumb_url: string | null; blob_url: string };

function canWarmCache(): boolean {
  if (typeof navigator === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (navigator as any).connection as
    | { saveData?: boolean; effectiveType?: string }
    | undefined;
  if (c?.saveData) return false;
  const et = String(c?.effectiveType || "");
  if (et === "slow-2g" || et === "2g") return false;
  return true;
}

function prefetchImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

async function runQueue(urls: string[], concurrency: number) {
  const queue = urls.slice();
  const workers = Array.from({ length: concurrency }).map(async () => {
    while (queue.length) {
      const url = queue.shift();
      if (!url) break;
      // eslint-disable-next-line no-await-in-loop
      await prefetchImage(url);
    }
  });
  await Promise.all(workers);
}

export default function GalleryWarmCache(props: { count?: number }) {
  const count = typeof props.count === "number" ? props.count : 12;

  useEffect(() => {
    if (!canWarmCache()) return;
    if (typeof window === "undefined") return;

    const key = "gallery:warm_cache:thumbs:v1";
    try {
      if (sessionStorage.getItem(key) === "done") return;
      sessionStorage.setItem(key, "done");
    } catch {
      // ignore
    }

    const schedule = (fn: () => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ric = (window as any).requestIdleCallback as
        | ((cb: () => void, opts?: { timeout?: number }) => void)
        | undefined;
      if (ric) return ric(fn, { timeout: 1500 });
      return window.setTimeout(fn, 650);
    };

    const cancelSchedule = (id: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cic = (window as any).cancelIdleCallback as ((id: unknown) => void) | undefined;
      if (cic) return cic(id);
      if (typeof id === "number") window.clearTimeout(id);
    };

    let cancelled = false;
    const id = schedule(() => {
      void (async () => {
        try {
          const res = await fetch("/api/gallery/photos", {
            method: "GET",
            headers: { accept: "application/json" },
          });
          if (!res.ok) return;
          const json = (await res.json().catch(() => null)) as Photo[] | null;
          if (!json || !Array.isArray(json)) return;
          if (cancelled) return;

          const urls = json
            .slice(0, Math.max(1, Math.min(200, count)))
            .map((p) => p.thumb_url || null)
            .filter((u): u is string => Boolean(u));

          // Low concurrency to avoid saturating bandwidth
          await runQueue(urls, 3);
        } catch {
          // ignore
        }
      })();
    });

    return () => {
      cancelled = true;
      cancelSchedule(id);
    };
  }, [count]);

  return null;
}

