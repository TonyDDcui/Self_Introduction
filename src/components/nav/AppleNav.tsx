import Link from "next/link";
import styles from "./AppleNav.module.css";

import ModeToggle from "../theme/ModeToggle";
import TocMenu from "./TocMenu";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
] as const;

export default function AppleNav() {
  return (
    <nav aria-label="Primary" className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link
            className={styles.avatarLink}
            href="https://github.com/TonyDDcui"
            target="_blank"
            rel="noreferrer"
            aria-label="打开 GitHub 主页"
            title="打开 GitHub 主页"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.avatar}
              src="https://github.com/TonyDDcui.png"
              alt="GitHub avatar"
              width={26}
              height={26}
            />
          </Link>

          <ul className={styles.list}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link className={styles.link} href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.controls}>
          <TocMenu />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
