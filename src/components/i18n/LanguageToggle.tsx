"use client";

import { useEffect, useState } from "react";
import styles from "./LanguageToggle.module.css";
import type { SiteLang } from "../../lib/i18n/types";
import { readClientLang, writeClientLang } from "../../lib/i18n/client";

export default function LanguageToggle(props: {
  labelToEn: string;
  labelToZh: string;
}) {
  const [lang, setLang] = useState<SiteLang>("zh");

  useEffect(() => {
    setLang(readClientLang());
  }, []);

  function onToggle() {
    const next: SiteLang = lang === "zh" ? "en" : "zh";
    writeClientLang(next);
    // server components rely on cookie → reload to re-render all text
    window.location.reload();
  }

  const label = lang === "zh" ? props.labelToEn : props.labelToZh;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      {lang === "zh" ? "EN" : "中"}
    </button>
  );
}

