import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
};

type Frontmatter = Partial<Pick<PostMeta, "title" | "date" | "summary" | "tags">>;

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
  };
}

export async function getAllPostsMeta(): Promise<PostMeta[]> {
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

export async function getPostBySlug(slug: string): Promise<{
  meta: PostMeta;
  /** 原始文件内容（含 frontmatter） */
  raw: string;
  /** 去掉 frontmatter 后的 MDX body */
  content: string;
}> {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const meta = toMeta(slug, parsed.data as Frontmatter);

  return { meta, raw, content: parsed.content };
}
