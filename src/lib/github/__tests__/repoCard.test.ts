import { describe, expect, it } from "vitest";

import {
  formatCommitItems,
  formatIssueItems,
  formatPullItems,
  isSnapshotFresh,
} from "../repoCard";

describe("github repo card helpers", () => {
  it("treats snapshots within maxAge as fresh", () => {
    const now = new Date("2026-04-12T00:00:00Z").getTime();
    const updatedAt = new Date(now - 1000 * 60 * 60); // 1h ago
    expect(isSnapshotFresh(updatedAt, { now, maxAgeMs: 1000 * 60 * 60 * 12 })).toBe(true);
  });

  it("treats snapshots older than maxAge as stale", () => {
    const now = new Date("2026-04-12T00:00:00Z").getTime();
    const updatedAt = new Date(now - 1000 * 60 * 60 * 13); // 13h ago
    expect(isSnapshotFresh(updatedAt, { now, maxAgeMs: 1000 * 60 * 60 * 12 })).toBe(false);
  });

  it("formats commit items with message + short sha", () => {
    const items = formatCommitItems([
      {
        sha: "abcdef0123456789",
        html_url: "https://github.com/x/y/commit/abcdef0",
        commit: { message: "feat: hello\n\nbody" },
        author: { login: "alice" },
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("feat: hello");
    expect(items[0].desc).toContain("abcdef0");
    expect(items[0].url).toContain("/commit/");
  });

  it("filters out PRs from issues endpoint results", () => {
    const items = formatIssueItems([
      { number: 1, title: "real issue", html_url: "https://github.com/x/y/issues/1" },
      {
        number: 2,
        title: "this is a PR",
        html_url: "https://github.com/x/y/pull/2",
        pull_request: { url: "https://api.github.com/..." },
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].title).toContain("#1");
    expect(items[0].url).toContain("/issues/1");
  });

  it("formats pull request items with #number prefix", () => {
    const items = formatPullItems([
      { number: 12, title: "fix: something", html_url: "https://github.com/x/y/pull/12" },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].title).toContain("#12");
    expect(items[0].url).toContain("/pull/12");
  });
});

