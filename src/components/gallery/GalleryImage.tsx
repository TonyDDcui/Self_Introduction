"use client";

import { useState } from "react";
import Image from "next/image";

export default function GalleryImage(props: {
  src: string;
  alt: string;
  downloadHref: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { src, alt, downloadHref, className, sizes, priority } = props;
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
    <Image
      className={className}
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 920px) 50vw, 25vw"}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
