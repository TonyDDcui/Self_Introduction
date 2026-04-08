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
  | { ok: false; reason: "missing_env" | "github_error" | "unknown_error" };

type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: ContributionCalendar;
      };
    };
  };
  errors?: Array<{ message?: string }>;
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

    if (!res.ok) return { ok: false, reason: "github_error" };
    const json = (await res.json()) as GraphQLResponse;
    const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return { ok: false, reason: "github_error" };
    return { ok: true, calendar: cal as ContributionCalendar };
  } catch {
    return { ok: false, reason: "unknown_error" };
  }
}
