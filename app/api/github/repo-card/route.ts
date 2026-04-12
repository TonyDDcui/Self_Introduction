import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getRepoCardSnapshot } from "../../../../src/lib/github/repoCardSnapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TABS = new Set(["code", "issues", "pulls"]);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tab = VALID_TABS.has(url.searchParams.get("tab") || "")
    ? (url.searchParams.get("tab") as "code" | "issues" | "pulls")
    : "pulls";

  const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken =
    jwt && typeof (jwt as { githubAccessToken?: unknown }).githubAccessToken === "string"
      ? (jwt as { githubAccessToken: string }).githubAccessToken
      : undefined;

  const { snapshot, updatedAt } = await getRepoCardSnapshot({
    token: accessToken || process.env.GITHUB_TOKEN,
  });

  return NextResponse.json(
    {
      ok: true,
      tab,
      updatedAt: updatedAt.toISOString(),
      repo: snapshot.repo,
      items: snapshot.tabs[tab],
    },
    { status: 200 },
  );
}

