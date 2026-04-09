"use client";

import { useState } from "react";

export default function GalleryImage(props: {
  src: string;
  alt: string;
  downloadHref: string;
  className?: string;
}) {
  const { src, alt, downloadHref, className } = props;
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

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

