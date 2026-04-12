import Link from "next/link";
import Image from "next/image";
import styles from "./AppleNav.module.css";

import TocMenu from "./TocMenu";
import LanguageToggle from "../i18n/LanguageToggle";
import { getServerLang } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/strings";
import { getSiteAvatarUrl } from "../../lib/profile/avatar";

const navItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/gallery", labelKey: "nav.gallery" },
] as const;

export default async function AppleNav() {
  const lang = getServerLang();
  // NOTE: Server component — 可以直接 await DB/Blob 缓存。
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
            <Image
              className={styles.avatar}
              // 优先使用“登录时同步并固化”的站点静态头像；否则回退到本地 SVG 占位。
              src={(await getSiteAvatarUrl()) ?? "/avatar.svg"}
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
        </div>
      </div>
    </nav>
  );
}
