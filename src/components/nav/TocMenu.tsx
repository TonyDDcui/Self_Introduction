"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./TocMenu.module.css";
import { readClientLang } from "../../lib/i18n/client";
import { t } from "../../lib/i18n/strings";

const SECTIONS = [
  { id: "activity", zh: "Activity", en: "Activity" },
  { id: "about", zh: "About", en: "About" },
  { id: "projects", zh: "Projects", en: "Projects" },
  { id: "writing", zh: "Writing", en: "Writing" },
  { id: "contact", zh: "Contact", en: "Contact" },
] as const;

function MenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-uiverse-icon="gagan-gv-menu"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.line1} d="M5 7.25h14" />
      <path className={styles.line2} d="M5 12h14" />
      <path className={styles.line3} d="M5 16.75h10.5" />
    </svg>
  );
}

export default function TocMenu() {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lang = readClientLang();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const jump = (id: string) => {
    const onHome = window.location.pathname === "/";
    if (!onHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.location.hash = id;
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        className={styles.button}
        type="button"
        aria-label={t(lang, "nav.toc")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.icon} aria-hidden="true">
          <MenuIcon />
        </span>
      </button>

      {open ? (
        <div className={styles.popover} id={popoverId} role="menu">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={styles.item}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                jump(s.id);
              }}
            >
              {lang === "en" ? s.en : s.zh}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
