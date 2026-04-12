import { describe, expect, it } from "vitest";

import { attachGithubToJwt } from "../githubJwt";

describe("attachGithubToJwt", () => {
  it("persists github login from profile", () => {
    const token: Record<string, unknown> = {};
    const next = attachGithubToJwt(token, {
      profile: { login: "TonyDDcui" },
      account: null,
    });
    expect(next.githubLogin).toBe("TonyDDcui");
  });

  it("persists access token when account has it", () => {
    const token: Record<string, unknown> = {};
    const next = attachGithubToJwt(token, {
      profile: { login: "TonyDDcui" },
      account: { provider: "github", access_token: "gho_xxx" },
    });
    expect(next.githubAccessToken).toBe("gho_xxx");
  });
});

