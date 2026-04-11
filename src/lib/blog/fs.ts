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

  return { meta, raw, content: parsed.content };
}
