import type { SiteMode, SiteTheme } from "./types";

export function applyThemeToHtml(theme: SiteTheme, mode: SiteMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.mode = mode;
}

export function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}
