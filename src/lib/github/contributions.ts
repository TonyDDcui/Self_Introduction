export type ContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
};

export type ContributionWeek = {
  contributionDays: ContributionDay[];
};

export type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

export type ContributionsResponse =
  | { ok: true; calendar: ContributionCalendar }
  | {
      ok: false;
      reason:
        | "missing_env"
        | "github_401"
        | "github_403"
        | "github_rate_limit"
        | "github_error"
        | "unknown_error";
    };

type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: ContributionCalendar;
      };
    };
  };
  errors?: Array<{ message?: string; [key: string]: unknown }>;
};

const CONTRIBUTIONS_QUERY = /* GraphQL */ `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

export async function getGithubContributionCalendar(params: {
  token: string;
  username: string;
}): Promise<ContributionsResponse> {
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${params.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: params.username },
      }),
      // Next.js fetch cache (server-side)
      next: { revalidate: 86400 },
    });

    if (!res.ok) console.error("[github] contributions graphql status:", res.status);

    if (res.status === 401) return { ok: false, reason: "github_401" };
    if (res.status === 403) {
      const rl = res.headers.get("x-ratelimit-remaining");
      if (rl === "0") return { ok: false, reason: "github_rate_limit" };
      return { ok: false, reason: "github_403" };
    }
    if (!res.ok) return { ok: false, reason: "github_error" };

    const json = (await res.json()) as GraphQLResponse;
    if (json.errors?.length) {
      console.error("[github] contributions graphql errors:", json.errors);
      return { ok: false, reason: "github_error" };
    }
    const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) {
      console.error("[github] contributions graphql missing contributionCalendar");
      return { ok: false, reason: "github_error" };
    }
    return { ok: true, calendar: cal as ContributionCalendar };
  } catch {
    return { ok: false, reason: "unknown_error" };
  }
}
