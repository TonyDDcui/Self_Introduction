"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";

import styles from "../../styles/blog.module.css";

type PostMetaClient = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  source_url?: string;
};

type SearchIndexItem = PostMetaClient & {
  contentText: string;
};

function yearOf(date: string): string {
  const m = String(date || "").match(/^(\d{4})-/);
  return m ? m[1] : "未知";
}

function groupByYear(posts: PostMetaClient[]) {
  const map = new Map<string, PostMetaClient[]>();
  for (const p of posts) {
    const y = yearOf(p.date);
    const arr = map.get(y) ?? [];
    arr.push(p);
    map.set(y, arr);
  }
  // 年份倒序（未知放最后）
  const years = Array.from(map.keys()).sort((a, b) => {
    if (a === "未知") return 1;
    if (b === "未知") return -1;
    return Number(b) - Number(a);
  });
  return { years, map };
}

export default function BlogIndexClient(props: {
  lang: "zh" | "en";
  initialPosts: PostMetaClient[];
}) {
  const { lang, initialPosts } = props;
  const [query, setQuery] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [indexItems, setIndexItems] = useState<SearchIndexItem[] | null>(null);

  const { years, map } = useMemo(() => groupByYear(initialPosts), [initialPosts]);
  const defaultOpenYear = years[0] ?? "未知";

  const fuse = useMemo(() => {
    if (!indexItems) return null;
    return new Fuse(indexItems, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: ["title", "summary", "tags", "contentText"],
    });
  }, [indexItems]);

  async function ensureIndexLoaded() {
    if (indexItems || loadingIndex) return;
    setLoadingIndex(true);
    setIndexError(null);
    try {
      const res = await fetch(`/api/blog/search-index?lang=${lang}`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`http_${res.status}`);
      const json = (await res.json()) as SearchIndexItem[];
      setIndexItems(Array.isArray(json) ? json : []);
    } catch (e) {
      setIndexError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setLoadingIndex(false);
    }
  }

  useEffect(() => {
    const q = query.trim();
    if (q.length >= 2) void ensureIndexLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const searching = query.trim().length > 0;

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q || !fuse) return [];
    return fuse.search(q, { limit: 80 }).map((r) => r.item);
  }, [query, fuse]);

  return (
    <section className={styles.blogIndex}>
      <div className={styles.toolbar} role="search">
        <input
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章（支持全文模糊匹配）…"
          aria-label="搜索文章"
          onFocus={() => void ensureIndexLoaded()}
        />
        {loadingIndex ? <div className={styles.searchHint}>加载索引中…</div> : null}
        {indexError ? (
          <div className={styles.searchHint}>索引加载失败：{indexError}</div>
        ) : null}
        {searching && fuse ? (
          <div className={styles.searchHint}>结果：{searchResults.length}</div>
        ) : null}
      </div>

      {searching ? (
        <ul className={styles.grid} aria-label="搜索结果">
          {searchResults.map((post) => (
            <li key={post.slug} className={styles.card}>
              <Link className={styles.cardLink} href={`/blog/${post.slug}`}>
                <h2 className={styles.cardTitle}>{post.title}</h2>
                {post.date ? (
                  <p className={styles.meta}>
                    <time dateTime={post.date}>{post.date}</time>
                  </p>
                ) : null}
                {post.summary ? <p className={styles.summary}>{post.summary}</p> : null}
                {post.tags.length ? (
                  <p className={styles.tags}>{post.tags.map((t) => `#${t}`).join(" ")}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.yearGroups} aria-label="按年份浏览">
          {years.map((y) => {
            const posts = map.get(y) ?? [];
            return (
              <details key={y} className={styles.yearGroup} open={y === defaultOpenYear}>
                <summary className={styles.yearSummary}>
                  <span className={styles.yearLabel}>{y}</span>
                  <span className={styles.yearCount}>{posts.length}</span>
                </summary>
                <ul className={styles.grid}>
                  {posts.map((post) => (
                    <li key={post.slug} className={styles.card}>
                      <Link className={styles.cardLink} href={`/blog/${post.slug}`}>
                        <h2 className={styles.cardTitle}>{post.title}</h2>
                        {post.date ? (
                          <p className={styles.meta}>
                            <time dateTime={post.date}>{post.date}</time>
                          </p>
                        ) : null}
                        {post.summary ? <p className={styles.summary}>{post.summary}</p> : null}
                        {post.tags.length ? (
                          <p className={styles.tags}>
                            {post.tags.map((t) => `#${t}`).join(" ")}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}

