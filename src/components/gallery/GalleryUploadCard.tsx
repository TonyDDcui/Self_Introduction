import Link from "next/link";
import type { Session } from "next-auth";

import styles from "./GalleryUploadCard.module.css";

export default function GalleryUploadCard(props: { session: Session | null }) {
  const { session } = props;
  const loggedIn = Boolean(session);
  const href = loggedIn
    ? "/gallery/upload"
    : `/login?callbackUrl=${encodeURIComponent("/gallery/upload")}`;
  return (
    <section className={styles.container} aria-label="上传照片">
      <div className={styles.inner}>
        <div className={styles.icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 8.6c0-1.1.9-2 2-2h2.2l1.1-1.6c.4-.6 1-.9 1.7-.9h2c.7 0 1.3.3 1.7.9l1.1 1.6H18c1.1 0 2 .9 2 2V18c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.6Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M12 10v6m0-6l-2 2m2-2l2 2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.title}>上传照片</div>
        <div className={styles.text}>
          {loggedIn ? "打开上传页开始上传。" : "登录后可上传（登录入口已融合在这里）。"}
        </div>
        <Link className={styles.button} href={href}>
          {loggedIn ? "打开上传页" : "登录后上传"}
        </Link>
      </div>
    </section>
  );
}
