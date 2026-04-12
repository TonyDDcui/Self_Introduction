import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../src/styles/globals.css";
import AppleNav from "../src/components/nav/AppleNav";
import Reveal from "../src/components/motion/Reveal";
import { getServerLang } from "../src/lib/i18n/server";
import Script from "next/script";
import GalleryWarmCache from "../src/components/gallery/GalleryWarmCache";

export const metadata: Metadata = {
  title: "Self Introduction",
  description: "Next.js App Router scaffold",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const lang = getServerLang();
  return (
    <html
      lang={lang === "en" ? "en" : "zh-HK"}
      data-lang={lang}
      data-theme="claude"
      data-mode="light"
    >
      <body>
        {/* 首屏“空白时间”兜底：在 CSS 还未完全加载/水合前，先用极简内联样式显示 loader */}
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              html:not([data-boot="done"]) #boot-loader{display:grid}
              #boot-loader{display:none;position:fixed;inset:0;z-index:2147483001;place-items:center;background:#0b0b0c}
              @media (prefers-color-scheme: light){#boot-loader{background:#f6f6f7}}
              #boot-loader .p{width:min(460px,92vw);padding:18px 16px 14px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);backdrop-filter:blur(12px) saturate(1.2)}
              @media (prefers-color-scheme: light){#boot-loader .p{border-color:rgba(0,0,0,.10);background:rgba(255,255,255,.72)}}
              #boot-loader .t{margin-top:8px;font-size:13px;color:rgba(255,255,255,.70);text-align:center}
              @media (prefers-color-scheme: light){#boot-loader .t{color:rgba(0,0,0,.55)}}
              /* 统一颜色：与 app/loading.tsx 的 loader 一致 */
              #boot-loader svg{display:block;margin:0 auto;color:#c96442}
              @keyframes bl_bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
              #boot-loader #line-v1,#boot-loader #line-v2,#boot-loader #node-server,#boot-loader #particles{transform-origin:center;animation:bl_bounce 3s ease-in-out infinite alternate}
              #boot-loader #line-v2{animation-delay:.2s}
              #boot-loader #node-server,#boot-loader #particles{animation-delay:.4s}
              @keyframes bl_fade{0%,100%{opacity:1}50%{opacity:.55}}
              #boot-loader #particles{animation:bl_fade 5s infinite alternate}
              @keyframes bl_float{0%{transform:translateY(0);opacity:0}10%{opacity:1}100%{transform:translateY(-40px);opacity:0}}
              #boot-loader .particle{animation:bl_float linear infinite}
              #boot-loader .p1{animation-duration:2.2s}
              #boot-loader .p2{animation-duration:2.5s;animation-delay:.3s}
              #boot-loader .p3{animation-duration:2s;animation-delay:.6s}
            `,
          }}
        />
        <div id="boot-loader" aria-hidden="true">
          <div className="p">
            <svg
              id="svg-global"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 94 136"
              height="110"
              width="78"
            >
              <path
                stroke="currentColor"
                d="M87.3629 108.433L49.1073 85.3765C47.846 84.6163 45.8009 84.6163 44.5395 85.3765L6.28392 108.433C5.02255 109.194 5.02255 110.426 6.28392 111.187L44.5395 134.243C45.8009 135.004 47.846 135.004 49.1073 134.243L87.3629 111.187C88.6243 110.426 88.6243 109.194 87.3629 108.433Z"
                id="line-v1"
              ></path>
              <path
                stroke="currentColor"
                d="M91.0928 95.699L49.2899 70.5042C47.9116 69.6734 45.6769 69.6734 44.2986 70.5042L2.49568 95.699C1.11735 96.5298 1.11735 97.8767 2.49568 98.7074L44.2986 123.902C45.6769 124.733 47.9116 124.733 49.2899 123.902L91.0928 98.7074C92.4712 97.8767 92.4712 96.5298 91.0928 95.699Z"
                id="line-v2"
              ></path>
              <g id="node-server">
                <path
                  fill="currentColor"
                  opacity="0.32"
                  d="M2.48637 72.0059L43.8699 96.9428C45.742 98.0709 48.281 97.8084 50.9284 96.2133L91.4607 71.7833C92.1444 71.2621 92.4197 70.9139 92.5421 70.1257V86.1368C92.5421 86.9686 92.0025 87.9681 91.3123 88.3825C84.502 92.4724 51.6503 112.204 50.0363 113.215C48.2352 114.343 45.3534 114.343 43.5523 113.215C41.9261 112.197 8.55699 91.8662 2.08967 87.926C1.39197 87.5011 1.00946 86.5986 1.00946 85.4058V70.1257C1.11219 70.9289 1.49685 71.3298 2.48637 72.0059Z"
                ></path>
                <path
                  fill="currentColor"
                  opacity="0.22"
                  d="M91.0928 68.7324L49.2899 43.5375C47.9116 42.7068 45.6769 42.7068 44.2986 43.5375L2.49568 68.7324C1.11735 69.5631 1.11735 70.91 2.49568 71.7407L44.2986 96.9356C45.6769 97.7663 47.9116 97.7663 49.2899 96.9356L91.0928 71.7407C92.4712 70.91 92.4712 69.5631 91.0928 68.7324Z"
                ></path>
              </g>
              <g id="particles">
                <path
                  fill="currentColor"
                  opacity="0.7"
                  d="M43.5482 32.558C44.5429 32.558 45.3493 31.7162 45.3493 30.6778C45.3493 29.6394 44.5429 28.7976 43.5482 28.7976C42.5535 28.7976 41.7471 29.6394 41.7471 30.6778C41.7471 31.7162 42.5535 32.558 43.5482 32.558Z"
                  className="particle p1"
                ></path>
                <path
                  fill="currentColor"
                  opacity="0.65"
                  d="M50.0323 48.3519C51.027 48.3519 51.8334 47.5101 51.8334 46.4717C51.8334 45.4333 51.027 44.5915 50.0323 44.5915C49.0375 44.5915 48.2311 45.4333 48.2311 46.4717C48.2311 47.5101 49.0375 48.3519 50.0323 48.3519Z"
                  className="particle p2"
                ></path>
                <path
                  fill="currentColor"
                  opacity="0.6"
                  d="M40.3062 62.6416C41.102 62.6416 41.7471 61.9681 41.7471 61.1374C41.7471 60.3067 41.102 59.6332 40.3062 59.6332C39.5104 59.6332 38.8653 60.3067 38.8653 61.1374C38.8653 61.9681 39.5104 62.6416 40.3062 62.6416Z"
                  className="particle p3"
                ></path>
              </g>
            </svg>
            <div className="t">加载中…</div>
          </div>
        </div>
        <Script id="boot-loader-hide" strategy="afterInteractive">
          {`document.documentElement.setAttribute('data-boot','done');`}
        </Script>
        <AppleNav />
        <Reveal />
        <GalleryWarmCache count={12} />
        <div style={{ paddingTop: "var(--nav-height)" }}>{children}</div>
      </body>
    </html>
  );
}
