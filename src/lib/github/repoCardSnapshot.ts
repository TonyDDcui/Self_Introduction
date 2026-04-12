import { getSiteKvRecord, setSiteKv } from "../profile/siteKv";
import { formatCommitItems, RepoCardItem } from "./repoCard";

const DEFAULT_OWNER = "TonyDDcui";
const DEFAULT_REPO = "Self_Introduction";
const DEFAULT_FULL = `${DEFAULT_OWNER}/${DEFAULT_REPO}`;
const DEFAULT_URL = `https://github.com/${DEFAULT_FULL}`;

const MENU_KEY = "repo_card_menu_recent_v1";
const COMMITS_KEY_PREFIX = "repo_card_commits_v1:";
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12h
const MENU_LIMIT = 5;

export type RepoMenuItem = {
  fullName: string; // owner/name
  url: string;
  pushedAt: string;
};

export type RepoCardData = {
  menu: RepoMenuItem[];
  activeRepo: {
    owner: string;
    name: string;
    fullName: string;
    url: string;
  };
  items: RepoCardItem[];
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

function splitFullName(fullName: string): { owner: string; name: string } | null {
  const [owner, name] = String(fullName || "").split("/");
  if (!owner || !name) return null;
  return { owner, name };
}

function commitsKey(fullName: string): string {
  // site_kv key: keep it stable & safe
  return `${COMMITS_KEY_PREFIX}${String(fullName).replaceAll("/", "__")}`;
}

async function refreshMenu(owner: string, token?: string): Promise<RepoMenuItem[]> {
  const repos = await fetchGithubJson<
    Array<{ full_name: string; html_url: string; pushed_at: string; fork?: boolean }>
  >(
    `https://api.github.com/users/${owner}/repos?per_page=${MENU_LIMIT}&sort=pushed&direction=desc&type=owner`,
    token,
  );

  return (repos || [])
    .filter((r) => !r.fork)
    .slice(0, MENU_LIMIT)
    .map((r) => ({
      fullName: String(r.full_name),
      url: String(r.html_url),
      pushedAt: String(r.pushed_at),
    }));
}

async function getMenu(owner: string, token?: string): Promise<{ menu: RepoMenuItem[]; updatedAt: Date }> {
  const record = await getSiteKvRecord(MENU_KEY);
  const now = Date.now();

  if (record) {
    const parsed = safeJsonParse<RepoMenuItem[]>(record.value);
    if (parsed && now - record.updatedAt.getTime() <= MAX_AGE_MS) {
      return { menu: parsed, updatedAt: record.updatedAt };
    }
  }

  try {
    const menu = await refreshMenu(owner, token);
    await setSiteKv(MENU_KEY, JSON.stringify(menu));
    return { menu, updatedAt: new Date() };
  } catch {
    const parsed = record ? safeJsonParse<RepoMenuItem[]>(record.value) : null;
    if (parsed && record) return { menu: parsed, updatedAt: record.updatedAt };
    return {
      menu: [{ fullName: DEFAULT_FULL, url: DEFAULT_URL, pushedAt: new Date(0).toISOString() }],
      updatedAt: new Date(0),
    };
  }
}

async function refreshCommits(fullName: string, token?: string): Promise<RepoCardItem[]> {
  const commitsRaw = await fetchGithubJson<unknown[]>(
    `https://api.github.com/repos/${fullName}/commits?per_page=7`,
    token,
  );
  return formatCommitItems(commitsRaw as never);
}

async function getCommits(fullName: string, token?: string): Promise<{ items: RepoCardItem[]; updatedAt: Date }> {
  const key = commitsKey(fullName);
  const record = await getSiteKvRecord(key);
  const now = Date.now();

  if (record) {
    const parsed = safeJsonParse<RepoCardItem[]>(record.value);
    if (parsed && now - record.updatedAt.getTime() <= MAX_AGE_MS) {
      return { items: parsed, updatedAt: record.updatedAt };
    }
  }

  try {
    const items = await refreshCommits(fullName, token);
    await setSiteKv(key, JSON.stringify(items));
    return { items, updatedAt: new Date() };
  } catch {
    const parsed = record ? safeJsonParse<RepoCardItem[]>(record.value) : null;
    if (parsed && record) return { items: parsed, updatedAt: record.updatedAt };
    return { items: [], updatedAt: new Date(0) };
  }
}

export async function getRepoCardData(opts?: {
  owner?: string;
  repoFullName?: string | null;
  token?: string;
}): Promise<RepoCardData> {
  const owner = opts?.owner || DEFAULT_OWNER;
  const token = opts?.token;

  const { menu } = await getMenu(owner, token);

  const preferred = opts?.repoFullName ? splitFullName(opts.repoFullName) : null;
  const menuHasPreferred = opts?.repoFullName
    ? menu.some((m) => m.fullName === opts.repoFullName)
    : false;

  const activeFullName =
    (menuHasPreferred && opts?.repoFullName) || menu[0]?.fullName || DEFAULT_FULL;

  const activeParsed = splitFullName(activeFullName) ?? { owner: DEFAULT_OWNER, name: DEFAULT_REPO };

  // If user passed an explicit repoFullName that is not in menu, still allow it (manual deep link)
  const finalFullName = preferred && !menuHasPreferred ? opts?.repoFullName || activeFullName : activeFullName;

  const { items } = await getCommits(finalFullName, token);

  const finalParsed = splitFullName(finalFullName) ?? activeParsed;

  return {
    menu: menu.slice(0, MENU_LIMIT),
    activeRepo: {
      owner: finalParsed.owner,
      name: finalParsed.name,
      fullName: finalFullName,
      url: `https://github.com/${finalFullName}`,
    },
    items,
  };
}
