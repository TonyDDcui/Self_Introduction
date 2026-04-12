export type RepoCardItem = {
  title: string;
  desc: string;
  url: string;
};

export function isSnapshotFresh(
  updatedAt: Date,
  opts?: { now?: number; maxAgeMs?: number },
): boolean {
  const now = opts?.now ?? Date.now();
  const maxAgeMs = opts?.maxAgeMs ?? 1000 * 60 * 60 * 12;
  return now - updatedAt.getTime() <= maxAgeMs;
}

function firstLine(s: string): string {
  return String(s || "").split("\n")[0]?.trim() || "";
}

function shortSha(sha: string): string {
  const s = String(sha || "");
  return s.length > 7 ? s.slice(0, 7) : s;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatCommitItems(commits: any[]): RepoCardItem[] {
  return (commits || []).slice(0, 7).map((c) => {
    const sha = shortSha(c?.sha);
    const msg = firstLine(c?.commit?.message || "");
    const author = c?.author?.login || c?.commit?.author?.name || "unknown";
    return {
      title: msg || "(no message)",
      desc: `${sha} · ${author}`,
      url: String(c?.html_url || "#"),
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatIssueItems(issues: any[]): RepoCardItem[] {
  return (issues || [])
    .filter((it) => !it?.pull_request) // filter PRs from /issues endpoint
    .slice(0, 7)
    .map((it) => {
      const n = it?.number;
      const title = String(it?.title || "");
      const author = it?.user?.login || "unknown";
      return {
        title: `#${n} ${title}`.trim(),
        desc: `opened by ${author}`,
        url: String(it?.html_url || "#"),
      };
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatPullItems(pulls: any[]): RepoCardItem[] {
  return (pulls || []).slice(0, 7).map((it) => {
    const n = it?.number;
    const title = String(it?.title || "");
    const author = it?.user?.login || "unknown";
    return {
      title: `#${n} ${title}`.trim(),
      desc: `opened by ${author}`,
      url: String(it?.html_url || "#"),
    };
  });
}

