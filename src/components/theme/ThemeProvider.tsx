"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import type { SiteMode } from "../../lib/theme/types";
import { applyThemeToHtml, systemPrefersDark } from "../../lib/theme/dom";
import { readMode, writeMode } from "../../lib/theme/storage";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode] = useState<SiteMode>(
    () => readMode() ?? (systemPrefersDark() ? "dark" : "light"),
  );

  useEffect(() => {
    // Persist once (including defaults) so subsequent visits use localStorage.
    writeMode(mode);
    // Theme is locked to "claude" across the whole site.
    applyThemeToHtml("claude", mode);
  }, [mode]);

  return <>{children}</>;
}
