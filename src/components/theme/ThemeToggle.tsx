"use client";

import { useEffect, useState } from "react";

import type { SiteMode, SiteTheme } from "../../lib/theme/types";
import { applyThemeToHtml, systemPrefersDark } from "../../lib/theme/dom";
import { readMode, readTheme, writeTheme } from "../../lib/theme/storage";

import styles from "./ThemeToggle.module.css";

function getCurrentMode(): SiteMode {
  if (typeof document !== "undefined") {
    const v = document.documentElement.dataset.mode;
    if (v === "light" || v === "dark") return v;
  }
  return readMode() ?? (systemPrefersDark() ? "dark" : "light");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<SiteTheme>(() => readTheme() ?? "claude");

  useEffect(() => {
    // Keep in sync with html dataset if ThemeProvider applied after hydration.
    const v = document.documentElement.dataset.theme;
    if (v === "claude" || v === "apple") setTheme(v);
  }, []);

  function onToggle() {
    const next: SiteTheme = theme === "claude" ? "apple" : "claude";
    setTheme(next);
    writeTheme(next);
    applyThemeToHtml(next, getCurrentMode());
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-label="切换站点主题（Claude / Apple）"
      aria-pressed={theme === "apple"}
      title={`Theme: ${theme}`}
    >
      {theme === "claude" ? "Claude" : "Apple"}
    </button>
  );
}

