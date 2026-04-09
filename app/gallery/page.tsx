import Link from "next/link";
import { getServerSession } from "next-auth";

import AlbumGrid from "../../src/components/gallery/AlbumGrid";
import GalleryAuthActions from "../../src/components/gallery/GalleryAuthActions";
import { authOptions } from "../../src/lib/auth/options";
import { isUploader } from "../../src/lib/auth/guards";
import { buildAlbumSummaries } from "../../src/lib/gallery/albums";
import { listPublicPhotos } from "../../src/lib/gallery/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const session = await getServerSession(authOptions);

  let photos: Awaited<ReturnType<typeof listPublicPhotos>> = [];
  let photosError = false;
  try {
    photos = await listPublicPhotos();
  } catch (err) {
    photosError = true;
    console.error("[gallery] failed to load photos:", err);
  }

  const canUpload = isUploader(session);
  const albums = buildAlbumSummaries(photos);

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
              <span style={{ color: "var(--text-primary)" }}>相册</span>
              <span style={{ color: "var(--text-tertiary)" }}>·</span>
              <Link href="/gallery/all" style={{ color: "var(--text-secondary)" }}>
                全部照片
              </Link>
            </nav>
          </div>

          <GalleryAuthActions
            session={session}
            canUpload={canUpload}
            signInCallbackUrl="/gallery"
            signOutCallbackUrl="/gallery"
          />
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
            <AlbumGrid albums={albums} />
          )}
        </div>
      </div>
    </main>
  );
}
