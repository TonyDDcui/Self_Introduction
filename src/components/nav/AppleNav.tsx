import Link from "next/link";
import styles from "./AppleNav.module.css";

import ModeToggle from "../theme/ModeToggle";
import ThemeToggle from "../theme/ThemeToggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
] as const;

export default function AppleNav() {
  return (
    <nav aria-label="Primary" className={styles.nav}>
      <div className={styles.inner}>
        <ul className={styles.list}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link className={styles.link} href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.controls}>
          <ThemeToggle />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
