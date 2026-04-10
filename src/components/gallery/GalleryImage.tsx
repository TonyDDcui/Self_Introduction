/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

export default function GalleryImage(props: {
  src: string;
  alt: string;
  downloadHref: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { src, alt, downloadHref, className, priority } = props;
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 12,
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: 12,
          lineHeight: 1.35,
        }}
      >
        <div>该图片格式在当前浏览器可能无法预览（如 HEIC/HEIF）。</div>
        <a
          href={downloadHref}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "var(--link)",
            textDecoration: "none",
            border: "1px solid var(--ring)",
            borderRadius: 999,
            padding: "6px 10px",
            background:
              "color-mix(in srgb, var(--surface-1) 86%, transparent)",
          }}
        >
          下载原图
        </a>
      </div>
    );
  }

  return (
    // 关键优化（国内访问显著改善）：
    // - next/image 默认会走 /_next/image 在 Vercel 侧做图片优化
    // - 国内访问时，这一跳会导致非常高的延迟（用户反馈可达 10-20s）
    // - 这里直接使用原图 URL（Blob/CDN）以避免额外的优化跳转
    <img
      className={className}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}
