import Link from "next/link";
import { getServerSession } from "next-auth";

import GalleryGrid from "../../../src/components/gallery/GalleryGrid";
import { authOptions } from "../../../src/lib/auth/options";
import { isUploader } from "../../../src/lib/auth/guards";
import { listPublicPhotos } from "../../../src/lib/gallery/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GalleryAllPage() {
  const session = await getServerSession(authOptions);

  let photos: Awaited<ReturnType<typeof listPublicPhotos>> = [];
  let photosError = false;
  try {
    photos = await listPublicPhotos();
  } catch (err) {
    photosError = true;
    console.error("[gallery/all] failed to load photos:", err);
  }

  const loginLabel =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session?.user && (session.user as any).login) || session?.user?.name || null;
  const avatarUrl = session?.user?.image || null;
  const canUpload = isUploader(session);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "24px 16px 56px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.15,
                letterSpacing: "-0.4px",
              }}
            >
              Gallery
            </h1>
            <p style={{ margin: "10px 0 0", color: "var(--text-secondary)" }}>
              公开照片（Blob + Postgres）。
            </p>

            <nav style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/gallery" style={{ color: "var(--text-secondary)" }}>
                相册
              </Link>
              <span style={{ color: "var(--text-tertiary)" }}>·</span>
              <span style={{ color: "var(--text-primary)" }}>全部照片</span>
            </nav>
          </div>

          <div
            style={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {session ? (
              <>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--ring)",
                    background:
                      "linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2, var(--surface-1)) 100%)",
                    padding: "6px 10px",
                    boxShadow: "var(--shadow-whisper)",
                  }}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="GitHub avatar"
                      width={22}
                      height={22}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        border: "1px solid var(--ring)",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        border: "1px solid var(--ring)",
                        background:
                          "color-mix(in srgb, var(--surface-2, var(--surface-1)) 68%, transparent)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {loginLabel ? String(loginLabel).slice(0, 1).toUpperCase() : "U"}
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary)",
                      lineHeight: 1,
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={loginLabel ? String(loginLabel) : undefined}
                  >
                    {loginLabel ? String(loginLabel) : "已登录"}
                  </span>

                  <Link
                    href="/api/auth/signout?callbackUrl=/gallery/all"
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      padding: "4px 8px",
                      borderRadius: 999,
                    }}
                  >
                    退出
                  </Link>
                </div>

                {canUpload ? (
                  <Link
                    href="/gallery/upload"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--ring)",
                      background:
                        "linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2, var(--surface-1)) 100%)",
                      color: "var(--text-primary)",
                      padding: "8px 14px",
                      fontSize: 14,
                      lineHeight: 1,
                      textDecoration: "none",
                      boxShadow: "var(--shadow-whisper)",
                    }}
                  >
                    添加照片
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href="/api/auth/signin?callbackUrl=/gallery/all"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--ring)",
                  background:
                    "linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2, var(--surface-1)) 100%)",
                  color: "var(--text-primary)",
                  padding: "8px 14px",
                  fontSize: 14,
                  lineHeight: 1,
                  textDecoration: "none",
                  boxShadow: "var(--shadow-whisper)",
                }}
              >
                使用 GitHub 登录
              </Link>
            )}
          </div>
        </header>

        <div style={{ marginTop: 18 }}>
          {photosError ? (
            <div
              style={{
                padding: 16,
                borderRadius: "var(--radius-12)",
                border: "1px solid var(--ring)",
                background: "color-mix(in srgb, var(--surface-1) 84%, transparent)",
                boxShadow: "var(--shadow-whisper)",
                color: "var(--text-secondary)",
              }}
            >
              Gallery 数据源尚未配置完成（请确认 Vercel Postgres 已创建并执行
              <code style={{ marginLeft: 6 }}>scripts/db/init.sql</code>）。
            </div>
          ) : photos.length === 0 ? (
            <div
              style={{
                padding: 16,
                borderRadius: "var(--radius-12)",
                border: "1px solid var(--ring)",
                background: "color-mix(in srgb, var(--surface-1) 84%, transparent)",
                boxShadow: "var(--shadow-whisper)",
                color: "var(--text-secondary)",
              }}
            >
              暂无公开照片。
            </div>
          ) : (
            <GalleryGrid photos={photos} canDelete={canUpload} />
          )}
        </div>
      </div>
    </main>
  );
}
