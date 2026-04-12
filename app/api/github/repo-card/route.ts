import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getRepoCardData } from "../../../../src/lib/github/repoCardSnapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const repo = url.searchParams.get("repo"); // owner/name

  const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken =
    jwt && typeof (jwt as { githubAccessToken?: unknown }).githubAccessToken === "string"
      ? (jwt as { githubAccessToken: string }).githubAccessToken
      : undefined;

  const data = await getRepoCardData({
    owner: "TonyDDcui",
    repoFullName: repo,
    token: accessToken || process.env.GITHUB_TOKEN,
  });

  return NextResponse.json(
    {
      ok: true,
      menu: data.menu,
      activeRepo: data.activeRepo,
      items: data.items,
    },
    { status: 200 },
  );
}
