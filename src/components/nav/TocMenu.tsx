"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./TocMenu.module.css";

const SECTIONS = [
  { id: "activity", label: "Activity" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
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
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 7h16M4 12h16M4 17h12" />
    </svg>
  );
}

export default function TocMenu() {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

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
        aria-label="目录"
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
              {s.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

