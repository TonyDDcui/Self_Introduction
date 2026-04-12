import { getSiteKvRecord, setSiteKv } from "../profile/siteKv";
import { formatCommitItems, formatIssueItems, formatPullItems, RepoCardItem } from "./repoCard";

const OWNER = "TonyDDcui";
const REPO = "Self_Introduction";
const REPO_FULL = `${OWNER}/${REPO}`;
const REPO_URL = `https://github.com/${REPO_FULL}`;

const SNAPSHOT_KEY = "repo_card_snapshot_v1";
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12h

export type RepoCardSnapshot = {
  repo: {
    owner: string;
    name: string;
    fullName: string;
    url: string;
    stars: number;
    forks: number;
    openIssues: number;
  };
  tabs: {
    code: RepoCardItem[];
    issues: RepoCardItem[];
    pulls: RepoCardItem[];
  };
};

function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

async function fetchGithubJson<T>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) throw new Error(`github_fetch_failed:${res.status}`);
  return (await res.json()) as T;
}

async function refreshSnapshot(token?: string): Promise<RepoCardSnapshot> {
  // repo
  const repo = await fetchGithubJson<{
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
  }>(`https://api.github.com/repos/${REPO_FULL}`, token);

  // tabs
  const [commitsRaw, pullsRaw, issuesRaw] = await Promise.all([
    fetchGithubJson<unknown[]>(
      `https://api.github.com/repos/${REPO_FULL}/commits?per_page=7`,
      token,
    ),
    fetchGithubJson<unknown[]>(
      `https://api.github.com/repos/${REPO_FULL}/pulls?state=open&per_page=7`,
      token,
    ),
    fetchGithubJson<unknown[]>(
      `https://api.github.com/repos/${REPO_FULL}/issues?state=open&per_page=15`,
      token,
    ),
  ]);

  return {
    repo: {
      owner: OWNER,
      name: REPO,
      fullName: REPO_FULL,
      url: REPO_URL,
      stars: Number(repo.stargazers_count || 0),
      forks: Number(repo.forks_count || 0),
      openIssues: Number(repo.open_issues_count || 0),
    },
    tabs: {
      code: formatCommitItems(commitsRaw as never),
      pulls: formatPullItems(pullsRaw as never),
      // issues endpoint includes PRs; helper will filter. We fetch a bit more to keep 7 real issues.
      issues: formatIssueItems(issuesRaw as never),
    },
  };
}

export async function getRepoCardSnapshot(opts?: {
  token?: string;
}): Promise<{ snapshot: RepoCardSnapshot; updatedAt: Date; fromCache: boolean }> {
  const record = await getSiteKvRecord(SNAPSHOT_KEY);
  const now = Date.now();

  if (record) {
    const parsed = safeJsonParse<RepoCardSnapshot>(record.value);
    if (parsed && now - record.updatedAt.getTime() <= MAX_AGE_MS) {
      return { snapshot: parsed, updatedAt: record.updatedAt, fromCache: true };
    }
  }

  // stale/missing: refresh, but if refresh fails, fallback to last known snapshot.
  try {
    const snapshot = await refreshSnapshot(opts?.token);
    await setSiteKv(SNAPSHOT_KEY, JSON.stringify(snapshot));
    return { snapshot, updatedAt: new Date(), fromCache: false };
  } catch {
    const parsed = record ? safeJsonParse<RepoCardSnapshot>(record.value) : null;
    if (parsed && record) return { snapshot: parsed, updatedAt: record.updatedAt, fromCache: true };

    // absolute fallback: keep UI alive
    const fallback: RepoCardSnapshot = {
      repo: { owner: OWNER, name: REPO, fullName: REPO_FULL, url: REPO_URL, stars: 0, forks: 0, openIssues: 0 },
      tabs: { code: [], issues: [], pulls: [] },
    };
    return { snapshot: fallback, updatedAt: new Date(0), fromCache: true };
  }
}

