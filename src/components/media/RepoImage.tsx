/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { resolveRepoImage } from "../../lib/repoImages/resolve";

export type RepoImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

function isSvgPath(p: string) {
  const noQuery = p.split("?")[0] ?? p;
  return noQuery.toLowerCase().endsWith(".svg");
}

export default function RepoImage({ src, alt, width, height }: RepoImageProps) {
  const resolved = resolveRepoImage(src);

  if (!resolved) {
    return (
      <span
        data-repoimage-missing
        style={{
          display: "block",
          padding: "12px 14px",
          border: "1px dashed rgba(0,0,0,0.25)",
          borderRadius: 12,
          background: "rgba(0,0,0,0.03)",
          color: "rgba(0,0,0,0.65)",
          fontSize: 13,
          lineHeight: 1.4,
          wordBreak: "break-all",
        }}
      >
        <strong style={{ display: "block", marginBottom: 6 }}>
          RepoImage 未找到
        </strong>
        <span>src: {src}</span>
      </span>
    );
  }

  if (isSvgPath(resolved)) {
    return (
      <img
        src={resolved}
        alt={alt}
        width={width}
        height={height}
        style={{
          maxWidth: "100%",
          height: height ? undefined : "auto",
        }}
      />
    );
  }

  // Raster images: always use next/image
  if (typeof width === "number" && typeof height === "number") {
    return <Image src={resolved} alt={alt} width={width} height={height} />;
  }

  // Width/height unknown: provide a reasonable container so `fill` works in MDX.
  return (
    <span
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
      }}
    >
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes="100vw"
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}

