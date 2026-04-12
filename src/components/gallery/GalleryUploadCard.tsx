import Link from "next/link";

import styles from "./GalleryUploadCard.module.css";

export default function GalleryUploadCard() {
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
          登录后可上传；若当前账号没有权限，会在上传页提示。
        </div>
        <Link className={styles.button} href="/gallery/upload">
          打开上传页
        </Link>
      </div>
    </section>
  );
}

