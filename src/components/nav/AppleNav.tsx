import Link from "next/link";
import styles from "./AppleNav.module.css";

import ModeToggle from "../theme/ModeToggle";
import TocMenu from "./TocMenu";
import LanguageToggle from "../i18n/LanguageToggle";
import { getServerLang } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/strings";

const navItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/gallery", labelKey: "nav.gallery" },
] as const;

export default function AppleNav() {
  const lang = getServerLang();
  return (
    <nav aria-label="Primary" className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link
            className={styles.avatarLink}
            href="https://github.com/TonyDDcui"
            target="_blank"
            rel="noreferrer"
            aria-label={t(lang, "nav.openGithub")}
            title={t(lang, "nav.openGithub")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.avatar}
              src="https://github.com/TonyDDcui.png"
              alt="GitHub avatar"
              width={45}
              height={45}
            />
          </Link>
        </div>

        <ul className={styles.list}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link className={styles.link} href={item.href}>
                {t(lang, item.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.controls}>
          <TocMenu />
          <LanguageToggle
            labelToEn={t(lang, "nav.langToEn")}
            labelToZh={t(lang, "nav.langToZh")}
          />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
