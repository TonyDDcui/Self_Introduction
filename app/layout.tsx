import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../src/styles/globals.css";
import AppleNav from "../src/components/nav/AppleNav";

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
        <AppleNav />
        {children}
      </body>
    </html>
  );
}
