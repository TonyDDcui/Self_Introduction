import Link from "next/link";
import type { Session } from "next-auth";

import styles from "./GalleryAuthActions.module.css";

export default function GalleryAuthActions(props: {
  session: Session | null;
  canUpload: boolean;
  signInCallbackUrl: string;
  signOutCallbackUrl: string;
}) {
  const { session, canUpload, signInCallbackUrl, signOutCallbackUrl } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loginLabel = (session?.user && (session.user as any).login) || session?.user?.name || null;
  const avatarUrl = session?.user?.image || null;

  return (
    <div className={styles.wrap}>
      {session ? (
        <>
          <div className={styles.pill}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.avatar} src={avatarUrl} alt="GitHub avatar" />
            ) : (
              <span aria-hidden="true" className={styles.avatarFallback}>
                {loginLabel ? String(loginLabel).slice(0, 1).toUpperCase() : "U"}
              </span>
            )}

            <span
              className={styles.loginLabel}
              title={loginLabel ? String(loginLabel) : undefined}
            >
              {loginLabel ? String(loginLabel) : "已登录"}
            </span>

            <Link
              href={`/api/auth/signout?callbackUrl=${encodeURIComponent(signOutCallbackUrl)}`}
              className={styles.signout}
            >
              退出
            </Link>
          </div>

          {canUpload ? (
            <Link href="/gallery/upload" className={styles.button}>
              <span className={styles.labelLong}>添加照片</span>
              <span className={styles.labelShort} aria-hidden="true">
                上传
              </span>
            </Link>
          ) : null}
        </>
      ) : (
        <Link
          href={`/api/auth/signin?callbackUrl=${encodeURIComponent(signInCallbackUrl)}`}
          className={styles.button}
        >
          <span className={styles.labelLong}>使用 GitHub 登录</span>
          <span className={styles.labelShort} aria-hidden="true">
            GitHub 登录
          </span>
        </Link>
      )}
    </div>
  );
}
