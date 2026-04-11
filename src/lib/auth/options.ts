import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  pages: {
    // 默认登录页改为自动跳转 GitHub OAuth（避免 /api/auth/signin 按钮无法提交的问题）
    signIn: "/login",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      // GitHub OAuth profile includes `login` (username). Persist it in JWT so
      // server components / API routes can do stable authorization checks.
      const githubLogin =
        profile && typeof (profile as { login?: unknown }).login === "string"
          ? (profile as { login: string }).login
          : undefined;

      if (githubLogin) token.githubLogin = githubLogin;
      return token;
    },
    async session({ session, token }) {
      const githubLogin =
        typeof token.githubLogin === "string" ? token.githubLogin : undefined;

      if (session.user) {
        session.user.login = githubLogin ?? null;
        // Keep `name` useful in UI even if GitHub name isn't set.
        if (!session.user.name && githubLogin) session.user.name = githubLogin;
      }

      return session;
    },
  },
};
