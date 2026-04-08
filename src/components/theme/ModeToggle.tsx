"use client";

import { useEffect, useState } from "react";

import type { SiteMode, SiteTheme } from "../../lib/theme/types";
import { applyThemeToHtml, systemPrefersDark } from "../../lib/theme/dom";
import { readMode, readTheme, writeMode } from "../../lib/theme/storage";

import styles from "./ModeToggle.module.css";

function getCurrentTheme(): SiteTheme {
  if (typeof document !== "undefined") {
    const v = document.documentElement.dataset.theme;
    if (v === "claude" || v === "apple") return v;
  }
  return readTheme() ?? "claude";
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
    applyThemeToHtml(getCurrentTheme(), next);
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-label="切换亮/暗模式"
      aria-pressed={mode === "dark"}
      title={`Mode: ${mode}`}
    >
      {mode === "light" ? "浅色" : "深色"}
    </button>
  );
}

