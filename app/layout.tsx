import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../src/styles/globals.css";
import AppleNav from "../src/components/nav/AppleNav";
import Reveal from "../src/components/motion/Reveal";
import ThemeProvider from "../src/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Self Introduction",
  description: "Next.js App Router scaffold",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body>
        <ThemeProvider>
          <AppleNav />
          <Reveal />
          <div style={{ paddingTop: "var(--nav-height)" }}>{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
