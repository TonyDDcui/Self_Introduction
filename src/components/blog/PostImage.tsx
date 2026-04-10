import Image from "next/image";
import type React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  width?: number | string;
  height?: number | string;
};

function toInt(v: number | string | undefined): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.floor(v);
  if (typeof v === "string") {
    const n = Number.parseInt(v, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

export default function PostImage(props: Props) {
  const { src, alt, width, height, ...rest } = props;
  if (!src) return null;

  const w = toInt(width);
  const h = toInt(height);

  // 有尺寸 → 使用 next/image；无尺寸 → 兜底为 <img>（避免布局抖动/比例错误）
  if (w && h) {
    return (
      <Image
        src={src}
        alt={alt ?? ""}
        width={w}
        height={h}
        sizes="(max-width: 768px) 100vw, 768px"
        style={{ height: "auto" }}
        {...(rest as Omit<Props, "width" | "height">)}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" {...rest} />;
}
