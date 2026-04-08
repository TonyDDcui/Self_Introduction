"use client";

import { useEffect, useState } from "react";

import type { SiteMode } from "../../lib/theme/types";
import { applyThemeToHtml, systemPrefersDark } from "../../lib/theme/dom";
import { readMode, writeMode } from "../../lib/theme/storage";

import styles from "./ModeToggle.module.css";

function SunIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
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
      <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8z" />
    </svg>
  );
}

export default function ModeToggle() {
  const [mode, setMode] = useState<SiteMode>(() => readMode() ?? (systemPrefersDark() ? "dark" : "light"));

  useEffect(() => {
    const v = document.documentElement.dataset.mode;
    if (v === "light" || v === "dark") setMode(v);
  }, []);

  function onToggle() {
    const next: SiteMode = mode === "light" ? "dark" : "light";
    setMode(next);
    writeMode(next);
    applyThemeToHtml("claude", next);
  }

  const label =
    mode === "light" ? "浅色模式（切换到深色）" : "深色模式（切换到浅色）";

  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={mode === "dark"}
      title={label}
    >
      <span className={styles.icon} aria-hidden="true">
        {mode === "light" ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
