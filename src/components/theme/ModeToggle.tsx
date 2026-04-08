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
      data-uiverse-icon="RiccardoRapelli-sun"
      aria-hidden="true"
      focusable="false"
    >
      <circle className={styles.core} cx="12" cy="12" r="3.6" />
      <path
        className={styles.rays}
        d="M12 2.4v2.2M12 19.4v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
      />
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
      data-uiverse-icon="RiccardoRapelli-moon"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className={styles.moon}
        d="M21 13.2A8.6 8.6 0 0 1 10.8 3.1a7.1 7.1 0 1 0 10.2 10.1z"
      />
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
      <span key={mode} className={styles.icon} aria-hidden="true">
        {mode === "light" ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
