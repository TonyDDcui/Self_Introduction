import type { SiteLang } from "./types";

export const LANG_COOKIE = "site_lang";

export function normalizeLang(v: unknown): SiteLang {
  return v === "en" ? "en" : "zh";
}

