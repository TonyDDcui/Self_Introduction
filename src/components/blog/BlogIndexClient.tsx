"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [indexItems, setIndexItems] = useState<SearchIndexItem[] | null>(null);

  const { years, map } = useMemo(() => groupByYear(initialPosts), [initialPosts]);
  const defaultOpenYear = years[0] ?? "未知";
  const [openYear, setOpenYear] = useState<string>(defaultOpenYear);

  const storageKey = useMemo(() => `blog:index:state:${lang}`, [lang]);

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

  function rememberListState() {
    try {
      const payload = {
        ts: Date.now(),
        scrollY: typeof window !== "undefined" ? window.scrollY : 0,
        openYear,
        query,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

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

  // 仅在“浏览器后退/前进”时恢复位置，避免用户每次打开 /blog 都被强制跳到旧位置
  useEffect(() => {
    let navType: string | null = null;
    try {
      const nav = performance.getEntriesByType("navigation")?.[0] as
        | PerformanceNavigationTiming
        | undefined;
      navType = nav?.type ?? null;
    } catch {
      navType = null;
    }
    if (navType !== "back_forward") return;

    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        ts?: number;
        scrollY?: number;
        openYear?: string;
        query?: string;
      };
      // 只保留 2 小时内的状态
      if (!parsed.ts || Date.now() - parsed.ts > 2 * 60 * 60 * 1000) return;
      if (typeof parsed.openYear === "string" && parsed.openYear) {
        setOpenYear(parsed.openYear);
      }
      if (typeof parsed.query === "string") {
        setQuery(parsed.query);
      }

      const y = typeof parsed.scrollY === "number" ? parsed.scrollY : 0;
      // 等 DOM/折叠面板渲染后再滚动
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
          });
        });
      }, 0);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const searching = query.trim().length > 0;

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q || !fuse) return [];
    return fuse.search(q, { limit: 80 }).map((r) => r.item);
  }, [query, fuse]);

  return (
    <section className={styles.blogIndex}>
      <div className={styles.toolbar} role="search">
        {/* 搜索框样式参考：uiverse.io/Anasmalik57/great-grasshopper-29（已转为 CSS Modules + 主题适配） */}
        <div className={styles.searchBar}>
          <input
            ref={inputRef}
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章（支持全文模糊匹配）…"
            aria-label="搜索文章"
            onFocus={() => void ensureIndexLoaded()}
          />
          <button
            type="button"
            className={styles.searchIconButton}
            aria-label="聚焦搜索框"
            onClick={() => inputRef.current?.focus()}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.2 16.2 21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
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
              <Link
                className={styles.cardLink}
                href={`/blog/${post.slug}`}
                onClick={() => rememberListState()}
              >
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
              <details key={y} className={styles.yearGroup} open={openYear === y}>
                <summary
                  className={styles.yearSummary}
                  onClick={(e) => {
                    e.preventDefault();
                    const next = openYear === y ? "" : y;
                    setOpenYear(next);
                    // 只记住折叠状态即可（避免滚动干扰）
                    try {
                      sessionStorage.setItem(
                        storageKey,
                        JSON.stringify({
                          ts: Date.now(),
                          scrollY: typeof window !== "undefined" ? window.scrollY : 0,
                          openYear: next,
                          query,
                        }),
                      );
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <span className={styles.yearLabel}>{y}</span>
                  <span className={styles.yearCount}>{posts.length}</span>
                </summary>
                <ul className={styles.grid}>
                  {posts.map((post) => (
                    <li key={post.slug} className={styles.card}>
                      <Link
                        className={styles.cardLink}
                        href={`/blog/${post.slug}`}
                        onClick={() => rememberListState()}
                      >
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
