"use client";

import { useEffect, useState } from "react";

type CsrfResponse = { csrfToken?: string };

export default function GithubAutoRedirect(props: { callbackUrl: string }) {
  const { callbackUrl } = props;
  const [status, setStatus] = useState<"redirecting" | "failed">("redirecting");
  const [error, setError] = useState<string | null>(null);

  async function startRedirect() {
    setStatus("redirecting");
    setError(null);

    try {
      const res = await fetch("/api/auth/csrf", { credentials: "same-origin" });
      if (!res.ok) throw new Error(`csrf_http_${res.status}`);
      const data = (await res.json().catch(() => ({}))) as CsrfResponse;
      const csrfToken = typeof data.csrfToken === "string" ? data.csrfToken : "";
      if (!csrfToken) throw new Error("missing_csrf_token");

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/signin/github";

      const add = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      add("csrfToken", csrfToken);
      add("callbackUrl", callbackUrl);

      document.body.appendChild(form);
      form.submit();
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
      </div>
    );
  }

  return <div style={{ color: "var(--text-secondary)" }}>如果没有自动跳转，请稍等或刷新页面。</div>;
}

