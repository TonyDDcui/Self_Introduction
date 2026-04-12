export function attachGithubToJwt(
  token: Record<string, unknown>,
  opts: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account: any | null;
  },
): Record<string, unknown> {
  const next = { ...token };

  const githubLogin =
    opts.profile && typeof opts.profile.login === "string" ? opts.profile.login : undefined;
  if (githubLogin) next.githubLogin = githubLogin;

  const accessToken =
    opts.account &&
    opts.account.provider === "github" &&
    typeof opts.account.access_token === "string"
      ? opts.account.access_token
      : undefined;
  if (accessToken) next.githubAccessToken = accessToken;

  return next;
}

