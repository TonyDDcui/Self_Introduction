import type { SiteMode, SiteTheme } from "./types";

const THEME_KEY = "site.theme";
const MODE_KEY = "site.mode";

export function readTheme(): SiteTheme | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(THEME_KEY);
  return v === "claude" || v === "apple" ? v : null;
}

export function writeTheme(theme: SiteTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function readMode(): SiteMode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(MODE_KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function writeMode(mode: SiteMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
}

