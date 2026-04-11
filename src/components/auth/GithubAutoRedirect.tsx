"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function GithubAutoRedirect(props: { callbackUrl: string }) {
  const { callbackUrl } = props;
  const [status, setStatus] = useState<"redirecting" | "failed">("redirecting");
  const [error, setError] = useState<string | null>(null);

  async function startRedirect() {
    setStatus("redirecting");
    setError(null);

    try {
      // 使用 next-auth/react 的 signIn：
      // - 内部会处理 csrf、cookie、provider url 生成等细节
      // - 避免某些环境下 form.submit() 被浏览器/扩展/策略拦截导致“无跳转”
      const res = await signIn("github", { callbackUrl, redirect: false });
      if (!res?.url) throw new Error(res?.error || "missing_redirect_url");
      window.location.href = res.url;
    } catch (e) {
      setStatus("failed");
      setError(e instanceof Error ? e.message : "unknown_error");
    }
  }

  useEffect(() => {
    void startRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callbackUrl]);

  if (status === "failed") {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: "var(--radius-12)",
          border: "1px solid var(--ring)",
          background: "color-mix(in srgb, var(--surface-1) 84%, transparent)",
          boxShadow: "var(--shadow-whisper)",
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ color: "var(--text-secondary)" }}>
          自动跳转失败，请点击下面按钮重试。
        </div>
        {error ? (
          <div style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
            错误：<code>{error}</code>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => void startRedirect()}
          style={{
            justifySelf: "start",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--ring)",
            background:
              "linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2, var(--surface-1)) 100%)",
            color: "var(--text-primary)",
            padding: "10px 14px",
            fontSize: 14,
            lineHeight: 1,
            boxShadow: "var(--shadow-whisper)",
          }}
        >
          继续使用 GitHub 登录
        </button>

        <div style={{ color: "var(--text-tertiary)", fontSize: 12, lineHeight: 1.5 }}>
          诊断：你也可以手动打开{" "}
          <a href={`/api/auth/signin/github?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            /api/auth/signin/github
          </a>{" "}
          看是否会 302 跳到 github.com。
        </div>
      </div>
    );
  }

  return <div style={{ color: "var(--text-secondary)" }}>如果没有自动跳转，请稍等或刷新页面。</div>;
}
