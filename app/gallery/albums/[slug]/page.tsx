import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import AlbumNarrative from "../../../../src/components/gallery/AlbumNarrative";
import GalleryGrid from "../../../../src/components/gallery/GalleryGrid";
import GalleryAuthActions from "../../../../src/components/gallery/GalleryAuthActions";
import { authOptions } from "../../../../src/lib/auth/options";
import { isUploader } from "../../../../src/lib/auth/guards";
import { buildAlbumSummaries, filterPhotosByAlbumSlug } from "../../../../src/lib/gallery/albums";
import { getOrCreateAlbumNarrative } from "../../../../src/lib/gallery/albumNarratives";
import { listPublicPhotos } from "../../../../src/lib/gallery/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AlbumPage(props: { params: { slug: string } }) {
  const slug = props.params.slug;
  const session = await getServerSession(authOptions);

  let photos: Awaited<ReturnType<typeof listPublicPhotos>> = [];
  let photosError = false;
  try {
    photos = await listPublicPhotos();
  } catch (err) {
    photosError = true;
    console.error("[gallery/albums] failed to load photos:", err);
  }

  if (photosError) {
    // 延续 gallery 页的错误提示样式
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg-page)",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 56px" }}>
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
        </div>
      </main>
    );
  }

  const albums = buildAlbumSummaries(photos);
  const album = albums.find((a) => a.slug === slug);
  if (!album) return notFound();

  const albumPhotos = filterPhotosByAlbumSlug(photos, slug);

  const canUpload = isUploader(session);
  const narrativeResult = await getOrCreateAlbumNarrative({
    slug,
    title: album.title,
    photos: albumPhotos,
    debug: canUpload,
  });
  const narrative = narrativeResult.narrative;
  const narrativeDebug = narrativeResult.debug;

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
            flexWrap: "wrap",
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
              {album.title}
            </h1>
            <p style={{ margin: "10px 0 0", color: "var(--text-secondary)" }}>
              {album.count} 张照片
            </p>

            <nav style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/gallery" style={{ color: "var(--text-secondary)" }}>
                ← 返回相册
              </Link>
              <span style={{ color: "var(--text-tertiary)" }}>·</span>
              <Link href="/gallery/all" style={{ color: "var(--text-secondary)" }}>
                全部照片
              </Link>
            </nav>
          </div>

          <GalleryAuthActions
            session={session}
            canUpload={canUpload}
            signInCallbackUrl={`/gallery/albums/${encodeURIComponent(slug)}`}
            signOutCallbackUrl={`/gallery/albums/${encodeURIComponent(slug)}`}
          />
        </header>

        {narrative ? (
          <AlbumNarrative narrative={narrative} />
        ) : canUpload && narrativeDebug ? (
          <section
            style={{
              marginTop: 14,
              padding: "14px 14px 16px",
              borderRadius: "var(--radius-12)",
              border: "1px solid var(--ring)",
              background: "color-mix(in srgb, var(--surface-1) 84%, transparent)",
              boxShadow: "var(--shadow-whisper)",
            }}
          >
            <div style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
              AI 配文未生成（仅管理员可见）
            </div>
            <div style={{ marginTop: 8, color: "var(--text-secondary)", fontSize: 13 }}>
              <code style={{ fontFamily: "var(--font-mono)" }}>{narrativeDebug}</code>
            </div>
          </section>
        ) : null}

        <div style={{ marginTop: 18 }}>
          {albumPhotos.length === 0 ? (
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
              这个相册里还没有照片。
            </div>
          ) : (
            <GalleryGrid photos={albumPhotos} canDelete={canUpload} />
          )}
        </div>
      </div>
    </main>
  );
}
