import { NextResponse } from "next/server";
import { getGithubContributionCalendar } from "../../../../src/lib/github/contributions";

export const revalidate = 86400;

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    return NextResponse.json(
      { ok: false, reason: "missing_env" },
      { status: 200 },
    );
  }

  const result = await getGithubContributionCalendar({ token, username });
  return NextResponse.json(result, { status: 200 });
}

