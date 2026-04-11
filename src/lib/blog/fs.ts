import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { SiteLang } from "../i18n/types";

const BLOG_DIR_ZH = path.join(process.cwd(), "content", "blog");
const BLOG_DIR_EN = path.join(process.cwd(), "content", "blog", "en");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  source_url?: string;
};

type Frontmatter = Partial<
  Pick<PostMeta, "title" | "date" | "summary" | "tags" | "source_url">
>;

function normalizeTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t)).filter(Boolean);
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function toMeta(slug: string, data: Frontmatter): PostMeta {
  return {
    slug,
    title: data.title ? String(data.title) : slug,
    date: data.date ? String(data.date) : "",
    summary: data.summary ? String(data.summary) : "",
    tags: normalizeTags(data.tags),
    source_url: data.source_url ? String(data.source_url) : undefined,
  };
}

function getBlogDir(lang: SiteLang) {
  return lang === "en" ? BLOG_DIR_EN : BLOG_DIR_ZH;
}

function truncateByChars(input: string, maxChars: number): string {
  const s = String(input || "").trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, maxChars)}…`;
}

function normalizeForDedup(s: string): string {
  return String(s || "")
    .replace(/\s+/g, " ")
    .replace(/[，。！？、“”‘’（）()【】\[\]{}<>《》]/g, "")
    .trim()
    .toLowerCase();
}

export async function getAllPostsMetaByLang(lang: SiteLang): Promise<PostMeta[]> {
  const BLOG_DIR = getBlogDir(lang);
  let entries: Dirent[];
  try {
    entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const slugs = entries
    .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
    .map((e) => e.name.replace(/\.mdx$/, ""));

  const metas = await Promise.all(
    slugs.map(async (slug) => {
      const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = matter(raw);
      return toMeta(slug, parsed.data as Frontmatter);
    }),
  );

  // newest first（无法解析 date 的会被放到最后）
  metas.sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : Number.NEGATIVE_INFINITY;
    const db = b.date ? Date.parse(b.date) : Number.NEGATIVE_INFINITY;
    return db - da;
  });

  // CSDN 同步文章：RSS 摘要经常重复。这里做一个轻量去重，
  // 避免 Blog 列表“多篇看起来一模一样”（不抓取正文、不用外部 AI）。
  const csdn = metas.filter((m) => m.tags.includes("csdn") && m.summary);
  const countByKey = new Map<string, number>();
  for (const m of csdn) {
    const k = normalizeForDedup(m.summary);
    countByKey.set(k, (countByKey.get(k) ?? 0) + 1);
  }
  for (const m of metas) {
    if (!m.tags.includes("csdn")) continue;
    const k = normalizeForDedup(m.summary);
    if (!k || (countByKey.get(k) ?? 0) <= 1) continue;
    const titleHint = truncateByChars(m.title, 18);
    m.summary = `${truncateByChars(m.summary, 72)}（主题：${titleHint}）`;
  }

  return metas;
}

export async function getAllPostsMeta(): Promise<PostMeta[]>;
export async function getAllPostsMeta(lang: SiteLang): Promise<PostMeta[]>;
export async function getAllPostsMeta(lang: SiteLang = "zh"): Promise<PostMeta[]> {
  const metas = await getAllPostsMetaByLang(lang);
  if (lang === "en" && metas.length === 0) return getAllPostsMetaByLang("zh");
  return metas;
}

export async function getPostBySlug(slug: string, lang: SiteLang = "zh"): Promise<{
  meta: PostMeta;
  /** 原始文件内容（含 frontmatter） */
  raw: string;
  /** 去掉 frontmatter 后的 MDX body */
  content: string;
}> {
  const primaryDir = getBlogDir(lang);
  const primaryPath = path.join(primaryDir, `${slug}.mdx`);
  let raw = "";
  try {
    raw = await fs.readFile(primaryPath, "utf8");
  } catch {
    // en 缺失时兜底回中文
    const fallbackPath = path.join(BLOG_DIR_ZH, `${slug}.mdx`);
    raw = await fs.readFile(fallbackPath, "utf8");
  }
  const parsed = matter(raw);
  const meta = toMeta(slug, parsed.data as Frontmatter);

  // 兼容历史 CSDN 导入文章：正文末尾会被写入 “原文链接：https://...”
  // 统一去掉，避免重复（详情页已有 source_url 外链块）。
  const cleaned = parsed.content
    .replace(/^\s*原文链接：\s*https?:\/\/\S+\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  return { meta, raw, content: cleaned };
}
