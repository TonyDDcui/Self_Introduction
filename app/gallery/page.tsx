import Link from "next/link";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import GalleryGrid from "../../src/components/gallery/GalleryGrid";
import { authOptions } from "../../src/lib/auth/options";
import { isUploader } from "../../src/lib/auth/guards";
import { listPublicPhotos } from "../../src/lib/gallery/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let session: Session | null = null;
  let sessionError = false;
  try {
    session = (await getServerSession(authOptions)) as Session | null;
  } catch (err) {
    sessionError = true;
    console.error("[gallery] getServerSession failed:", err);
  }

  let photos: Awaited<ReturnType<typeof listPublicPhotos>> = [];
  let photosError = false;
  try {
    photos = await listPublicPhotos();
  } catch (err) {
    photosError = true;
    console.error("[gallery] failed to load photos:", err);
  }

  const canUpload = !sessionError && isUploader(session);

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
          </div>

          {canUpload ? (
            <Link
              href="/gallery/upload"
              style={{
                flex: "0 0 auto",
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
        </header>

        <div style={{ marginTop: 18 }}>
          {sessionError ? (
            <div
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: "var(--radius-12)",
                border: "1px solid var(--ring)",
                background:
                  "color-mix(in srgb, var(--surface-1) 84%, transparent)",
                boxShadow: "var(--shadow-whisper)",
                color: "var(--text-secondary)",
              }}
            >
              登录状态获取失败（通常是 NEXTAUTH_SECRET / NEXTAUTH_URL 未在 Production
              环境配置）。不影响公开浏览，但会隐藏“添加照片”入口。
            </div>
          ) : null}
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
            <GalleryGrid photos={photos} />
          )}
        </div>
      </div>
    </main>
  );
}
