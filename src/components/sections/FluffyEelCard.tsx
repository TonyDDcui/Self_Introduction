"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./FluffyEelCard.module.css";

type TabKey = "code" | "issues" | "pulls";
type Repo = { owner: string; name: string; fullName: string; url: string };
type Item = { title: string; desc: string; url: string };

export default function FluffyEelCard() {
  const [active, setActive] = useState<TabKey>("pulls");
  const [repo, setRepo] = useState<Repo>({
    owner: "TonyDDcui",
    name: "Self_Introduction",
    fullName: "TonyDDcui/Self_Introduction",
    url: "https://github.com/TonyDDcui/Self_Introduction",
  });
  const [itemsByTab, setItemsByTab] = useState<Record<TabKey, Item[]>>({
    code: [],
    issues: [],
    pulls: [],
  });
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const inflight = useRef<AbortController | null>(null);

  const items = itemsByTab[active] || [];

  const tabs = useMemo(
    () =>
      [
        { key: "code" as const, label: "Code" },
        { key: "issues" as const, label: "Issues" },
        { key: "pulls" as const, label: "Pull Requests" },
      ] as const,
    [],
  );

  useEffect(() => {
    // Abort any previous request (tab spam)
    inflight.current?.abort();
    const ac = new AbortController();
    inflight.current = ac;

    setLoading(true);
    setFailed(false);

    fetch(`/api/github/repo-card?tab=${active}`, { signal: ac.signal, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("bad_status");
        const json = (await res.json()) as { repo: Repo; items: Item[] };
        setRepo(json.repo);
        setItemsByTab((prev) => ({ ...prev, [active]: json.items || [] }));
      })
      .catch((err) => {
        if (String(err?.name) === "AbortError") return;
        setFailed(true);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [active]);

  return (
    <div className={styles.scope} aria-label="GitHub Huly Card">
      <div className="card-container">
        <div className="card-border">
          <div className="card">
            <div className="header">
              <div className="top-header">
                <div className="icon">
                  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path>
                  </svg>
                </div>
                <a className="gh-icon" href={repo.url} target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"></path>
                  </svg>
                </a>
                <div className="repo">
                  <a className="repo-owner" href={repo.url} target="_blank" rel="noreferrer">
                    {repo.owner}
                  </a>
                  <span className="repo-slash">/</span>
                  <a className="repo-name" href={repo.url} target="_blank" rel="noreferrer">
                    {repo.name}
                  </a>
                </div>
                <div className="space"></div>
                <div className="icon">
                  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
                  </svg>
                </div>
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path d="M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Zm10.09 7h-2.875l-1.275 1.7a.75.75 0 0 1-.6.3h-3.5a.75.75 0 0 1-.6-.3L4.375 9.5H1.5v3.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25Z"></path>
                  </svg>
                </div>
                <div className="pfp"></div>
              </div>
              <div className="btm-header">
                {tabs.map((t) => (
                  <div
                    key={t.key}
                    className={`tab ${active === t.key ? "active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActive(t.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActive(t.key);
                    }}
                    aria-pressed={active === t.key}
                  >
                    <div className="tab-icon">
                      {t.key === "code" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                          <path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"></path>
                        </svg>
                      ) : t.key === "issues" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                          <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
                        </svg>
                      )}
                    </div>
                    <div className="tab-text">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="content">
              <div className="prs">
                {loading && items.length === 0 ? (
                  <div className="pr">
                    <div className="pr-text">
                      <div className="pr-title">Loading…</div>
                      <div className="pr-desc">正在获取 GitHub 数据</div>
                    </div>
                  </div>
                ) : failed && items.length === 0 ? (
                  <div className="pr">
                    <div className="pr-text">
                      <div className="pr-title">暂时不可用</div>
                      <div className="pr-desc">GitHub 数据获取失败（将自动重试/缓存更新）</div>
                    </div>
                  </div>
                ) : items.length === 0 ? (
                  <div className="pr">
                    <div className="pr-text">
                      <div className="pr-title">暂无数据</div>
                      <div className="pr-desc">该 Tab 当前没有条目</div>
                    </div>
                  </div>
                ) : (
                  items.map((it) => (
                    <div className="pr" key={it.url}>
                      <label>
                        <input type="checkbox" disabled />
                        <div className="checkbox"></div>
                      </label>
                      <div className="pr-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                          <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
                        </svg>
                      </div>
                      <div className="pr-text">
                        <a
                          className="pr-title"
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {it.title}
                        </a>
                        <div className="pr-desc">{it.desc}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
