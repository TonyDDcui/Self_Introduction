import Link from "next/link";
import type { Session } from "next-auth";

import styles from "./GalleryAuthActions.module.css";

export default function GalleryAuthActions(props: {
  session: Session | null;
  canUpload: boolean;
  signInCallbackUrl: string;
  signOutCallbackUrl: string;
}) {
  const { session, signOutCallbackUrl } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loginLabel = (session?.user && (session.user as any).login) || session?.user?.name || null;
  const avatarUrl = session?.user?.image || null;

  // 登录入口已融合到页面底部的上传卡中，这里只在“已登录”时显示用户信息与退出。
  if (!session) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.pill}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.avatar} src={avatarUrl} alt="GitHub avatar" />
        ) : (
          <span aria-hidden="true" className={styles.avatarFallback}>
            {loginLabel ? String(loginLabel).slice(0, 1).toUpperCase() : "U"}
          </span>
        )}

        <span className={styles.loginLabel} title={loginLabel ? String(loginLabel) : undefined}>
          {loginLabel ? String(loginLabel) : "已登录"}
        </span>

        <Link
          href={`/api/auth/signout?callbackUrl=${encodeURIComponent(signOutCallbackUrl)}`}
          className={styles.signout}
        >
          退出
        </Link>
      </div>
    </div>
  );
}
