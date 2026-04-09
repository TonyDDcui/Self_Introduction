import { NextResponse } from "next/server";

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return "unknown";
}

export function assertSameOrigin(
  req: Request,
): { ok: true } | { ok: false; reason: "forbidden_origin" | "missing_origin" | "invalid_origin" } {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return { ok: true };

  const host = req.headers.get("host")?.trim() || "";
  if (!host) return { ok: false, reason: "missing_origin" };

  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (!origin) return { ok: false, reason: "missing_origin" };

  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return { ok: false, reason: "invalid_origin" };
  }

  if (originHost !== host) return { ok: false, reason: "forbidden_origin" };
  return { ok: true };
}

export function json429(input: {
  reason?: string;
  resetAt: string;
  retryAfterSeconds: number;
}) {
  return NextResponse.json(
    { ok: false, reason: input.reason ?? "rate_limited", resetAt: input.resetAt },
    {
      status: 429,
      headers: {
        "retry-after": String(input.retryAfterSeconds),
      },
    },
  );
}

