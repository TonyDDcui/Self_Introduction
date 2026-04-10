"use client";

import type { SiteLang } from "./types";
import { LANG_COOKIE, normalizeLang } from "./shared";

export function readClientLang(): SiteLang {
  if (typeof document === "undefined") return "zh";

  const ds = document.documentElement.dataset.lang;
  if (ds === "en" || ds === "zh") return ds;

  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]+)`));
  return normalizeLang(m?.[1]);
}

export function writeClientLang(lang: SiteLang) {
  if (typeof document === "undefined") return;
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang === "en" ? "en" : "zh-HK";
}
