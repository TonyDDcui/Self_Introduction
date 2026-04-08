/* eslint-disable @next/next/no-img-element */
"use client";

import manifestJson from "../../src/generated/repo-images-manifest.json";

type RepoImageManifestItem = {
  originalPath: string;
  publicPath: string;
  name: string;
  ext: string;
};

const manifest = manifestJson as RepoImageManifestItem[];

export default function GalleryPage() {
  const copySnippet = async (originalPath: string, name: string) => {
    // IMPORTANT: MDX side should pass originalPath, and RepoImage will resolve via manifest.
    const snippet = `<RepoImage src="${originalPath}" alt="${name}" />`;

    try {
      await navigator.clipboard.writeText(snippet);
      // Minimal feedback; avoid complex UI
      alert("已复制到剪贴板");
    } catch {
      // Fallback: select text for manual copy (and try execCommand when available).
      const ta = document.createElement("textarea");
      ta.value = snippet;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "0";
      ta.style.top = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();

      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }

      if (copied) {
        alert("已复制到剪贴板");
      } else {
        alert("无法自动复制：已选中文本，请手动复制（Ctrl/Cmd + C）。");
      }

      // Remove after user closes alert (alert is blocking; this runs afterwards).
      setTimeout(() => document.body.removeChild(ta), 0);
    }
  };

  return (
    <main
      style={{
        padding: 24,
        background: "var(--bg-light)",
        color: "var(--text-on-light)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 28 }}>Gallery</h1>
      <p style={{ marginTop: 8, color: "var(--text-secondary-on-light)" }}>
        仓库图片预览（由 repo-images manifest 驱动）。
      </p>

      {manifest.length === 0 ? (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: "var(--radius-12)",
            background: "#ffffff",
            color: "var(--text-tertiary-on-light)",
          }}
        >
          当前仓库未检测到可用图片（png/jpg/jpeg/webp/gif/svg）。
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          {manifest.map((item) => (
            <div
              key={item.originalPath}
              style={{
                background: "#ffffff",
                borderRadius: "var(--radius-12)",
                padding: 12,
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  borderRadius: "var(--radius-11)",
                  overflow: "hidden",
                  background: "var(--bg-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={item.publicPath}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>

              <div style={{ marginTop: 10 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary-on-light)",
                    wordBreak: "break-all",
                    lineHeight: 1.35,
                  }}
                  title={item.originalPath}
                >
                  {item.originalPath}
                </div>

                <button
                  type="button"
                  onClick={() => copySnippet(item.originalPath, item.name)}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "var(--bg-light)",
                    color: "var(--text-on-light)",
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  复制 MDX 片段
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
