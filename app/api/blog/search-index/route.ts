import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import matter from "gray-matter";

const BLOG_DIR_ZH = path.join(process.cwd(), "content", "blog");
const BLOG_DIR_EN = path.join(process.cwd(), "content", "blog", "en");

function getBlogDir(lang: string) {
  return lang === "en" ? BLOG_DIR_EN : BLOG_DIR_ZH;
}

function stripMdxToText(input: string): string {
  let s = String(input || "");
  // 去掉 fenced code blocks
  s = s.replace(/```[\s\S]*?```/g, " ");
  // 去掉 inline code
  s = s.replace(/`[^`]*`/g, " ");
  // 去掉 markdown 图片/链接
  s = s.replace(/!\[[^\]]*]\([^)]*\)/g, " ");
  s = s.replace(/\[[^\]]*]\([^)]*\)/g, " ");
  // 去掉常见格式标记
  s = s.replace(/[#>*_~\-]{1,}/g, " ");
  // 压缩空白
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") === "en" ? "en" : "zh";
  const dir = getBlogDir(lang);

  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    // en 目录可能不存在：兜底到 zh
    if (lang === "en") {
      return NextResponse.redirect(new URL("/api/blog/search-index?lang=zh", url), 307);
    }
    return NextResponse.json([], { status: 200 });
  }

  const mdxFiles = entries.filter((n) => n.endsWith(".mdx"));
  const items = await Promise.all(
    mdxFiles.map(async (filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = await fs.readFile(path.join(dir, filename), "utf8");
      const parsed = matter(raw);
      const data = parsed.data as {
        title?: unknown;
        date?: unknown;
        summary?: unknown;
        tags?: unknown;
        source_url?: unknown;
      };
      const title = typeof data.title === "string" ? data.title : slug;
      const date = typeof data.date === "string" ? data.date : "";
      const summary = typeof data.summary === "string" ? data.summary : "";
      const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
      const source_url = typeof data.source_url === "string" ? data.source_url : undefined;

      const contentText = stripMdxToText(parsed.content).slice(0, 20000);
      return { slug, title, date, summary, tags, source_url, contentText };
    }),
  );

  items.sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : Number.NEGATIVE_INFINITY;
    const db = b.date ? Date.parse(b.date) : Number.NEGATIVE_INFINITY;
    return db - da;
  });

  return NextResponse.json(items, {
    status: 200,
    headers: {
      // CDN 缓存：10 分钟；浏览器缓存：10 分钟；SWR：一天
      "Cache-Control": "public, s-maxage=600, max-age=600, stale-while-revalidate=86400",
    },
  });
}

