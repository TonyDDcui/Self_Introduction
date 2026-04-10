import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { timingSafeEqual } from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      // 仅用于紧急兜底：当国内无法访问 github.com 时，站点管理员仍可登录上传/管理
      name: "Password",
      credentials: {
        login: { label: "账号", type: "text", placeholder: "tonyddcui" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const adminLogin = (process.env.ADMIN_LOGIN ?? "").trim();
        const adminPassword = process.env.ADMIN_PASSWORD ?? "";

        // 未配置环境变量时：直接拒绝（避免误开放）
        if (!adminLogin || !adminPassword) return null;

        const inputLogin = (credentials?.login ?? "").trim();
        const inputPassword = credentials?.password ?? "";

        if (!inputLogin || !inputPassword) return null;

        // constant-time compare to reduce timing attacks
        const a = Buffer.from(inputPassword);
        const b = Buffer.from(adminPassword);
        const passwordOk = a.length === b.length && timingSafeEqual(a, b);
        const loginOk = inputLogin.toLowerCase() === adminLogin.toLowerCase();
        if (!loginOk || !passwordOk) return null;

        return {
          id: adminLogin,
          name: adminLogin,
          // 让现有 isUploader(session) 逻辑可用
          login: adminLogin,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile, user }) {
      // Credentials 登录：将 login 写入 token
      const userLogin =
        user && typeof (user as unknown as { login?: unknown }).login === "string"
          ? (user as unknown as { login: string }).login
          : undefined;
      if (userLogin) token.githubLogin = userLogin;

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
