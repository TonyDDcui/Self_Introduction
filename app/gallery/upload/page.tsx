import Link from "next/link";
import { getServerSession } from "next-auth";

import UploadForm from "../../../src/components/gallery/UploadForm";
import { isUploader } from "../../../src/lib/auth/guards";
import { authOptions } from "../../../src/lib/auth/options";

export const dynamic = "force-dynamic";
export const preferredRegion = ["hkg1"];

export default async function GalleryUploadPage() {
  const session = await getServerSession(authOptions);

  const callbackUrl = "/gallery/upload";

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
        <header style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          <Link
            href="/gallery"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            ← 返回 Gallery
          </Link>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.15,
              letterSpacing: "-0.4px",
            }}
          >
            上传照片
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            仅限拥有者账号。支持 JPG/PNG/WEBP/GIF，单张 ≤ 15MB。
          </p>
        </header>

        {!session ? (
          <div
            style={{
              padding: 16,
              borderRadius: "var(--radius-12)",
              border: "1px solid var(--ring)",
              background:
                "color-mix(in srgb, var(--surface-1) 84%, transparent)",
              boxShadow: "var(--shadow-whisper)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ color: "var(--text-secondary)" }}>
              你尚未登录。请使用 GitHub 登录后继续。
            </div>
            <Link
              href={`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              style={{
                justifySelf: "start",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--ring)",
                background:
                  "linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2, var(--surface-1)) 100%)",
                color: "var(--text-primary)",
                padding: "10px 14px",
                fontSize: 14,
                lineHeight: 1,
                textDecoration: "none",
                boxShadow: "var(--shadow-whisper)",
              }}
            >
              使用 GitHub 登录
            </Link>
          </div>
        ) : !isUploader(session) ? (
          <div
            style={{
              padding: 16,
              borderRadius: "var(--radius-12)",
              border: "1px solid var(--ring)",
              background:
                "color-mix(in srgb, var(--surface-1) 84%, transparent)",
              boxShadow: "var(--shadow-whisper)",
              color: "var(--text-secondary)",
            }}
          >
            当前账号没有上传权限。
          </div>
        ) : (
          <UploadForm />
        )}
      </div>
    </main>
  );
}
