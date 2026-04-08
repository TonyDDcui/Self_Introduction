"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import type { SiteMode, SiteTheme } from "../../lib/theme/types";
import { applyThemeToHtml, systemPrefersDark } from "../../lib/theme/dom";
import { readMode, readTheme, writeMode, writeTheme } from "../../lib/theme/storage";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<SiteTheme>(() => readTheme() ?? "claude");
  const [mode] = useState<SiteMode>(
    () => readMode() ?? (systemPrefersDark() ? "dark" : "light"),
  );

  useEffect(() => {
    // Persist once (including defaults) so subsequent visits use localStorage.
    writeTheme(theme);
    writeMode(mode);
    applyThemeToHtml(theme, mode);
  }, [theme, mode]);

  return <>{children}</>;
}

