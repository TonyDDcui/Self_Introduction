import Link from "next/link";
import { getServerSession } from "next-auth";

import GalleryGrid from "../../src/components/gallery/GalleryGrid";
import { authOptions } from "../../src/lib/auth/options";
import { isUploader } from "../../src/lib/auth/guards";
import { listPublicPhotos } from "../../src/lib/gallery/photos";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const [photos, session] = await Promise.all([
    listPublicPhotos(),
    getServerSession(authOptions),
  ]);

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
          {photos.length === 0 ? (
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
