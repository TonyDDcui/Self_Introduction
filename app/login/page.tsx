import Link from "next/link";

import GithubAutoRedirect from "../../src/components/auth/GithubAutoRedirect";

function normalizeCallbackUrl(url: string | null): string {
  const u = (url ?? "").trim();
  if (!u) return "/gallery";
  // 仅允许站内路径，避免开放重定向
  if (u.startsWith("/")) return u;
  return "/gallery";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function LoginPage(props: {
  searchParams?: { callbackUrl?: string };
}) {
  const callbackUrl = normalizeCallbackUrl(props.searchParams?.callbackUrl ?? null);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 56px" }}>
        <header style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          <Link
            href={callbackUrl}
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            ← 返回
          </Link>
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.4px" }}>
            正在跳转到 GitHub…
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            登录完成后将自动回到：<code>{callbackUrl}</code>
          </p>
        </header>

        <GithubAutoRedirect callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}

