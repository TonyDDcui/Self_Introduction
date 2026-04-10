import { cookies } from "next/headers";
import type { SiteLang } from "./types";

import { LANG_COOKIE, normalizeLang } from "./shared";

export function getServerLang(): SiteLang {
  try {
    const v = cookies().get(LANG_COOKIE)?.value;
    return normalizeLang(v);
  } catch {
    return "zh";
  }
}
