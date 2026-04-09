import { sql } from "../db";

export type RateLimitConfig = {
  key: string;
  limit: number;
  windowSeconds: number; // e.g. 60
};

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: string }
  | { ok: false; retryAfterSeconds: number; resetAt: string };

let ensurePromise: Promise<void> | null = null;
async function ensureTable() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await sql`
        create table if not exists rate_limits (
          key text primary key,
          count int not null,
          reset_at timestamptz not null,
          updated_at timestamptz not null default now()
        )
      `;
    })();
  }
  return ensurePromise;
}

export async function enforceRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  await ensureTable();

  const key = config.key;
  const windowSeconds = Math.max(1, Math.floor(config.windowSeconds));
  const limit = Math.max(1, Math.floor(config.limit));

  const { rows } = await sql<{ count: number; reset_at: string; retry_after: number }>`
    insert into rate_limits (key, count, reset_at)
    values (
      ${key},
      1,
      now() + (${windowSeconds} || ' seconds')::interval
    )
    on conflict (key) do update set
      count = case
        when now() > rate_limits.reset_at then 1
        else rate_limits.count + 1
      end,
      reset_at = case
        when now() > rate_limits.reset_at then now() + (${windowSeconds} || ' seconds')::interval
        else rate_limits.reset_at
      end,
      updated_at = now()
    returning
      count,
      reset_at,
      greatest(0, ceil(extract(epoch from reset_at - now())))::int as retry_after
  `;

  const row = rows[0];
  const resetAt = row?.reset_at ?? new Date(Date.now() + windowSeconds * 1000).toISOString();
  const count = row?.count ?? 1;
  const retryAfterSeconds = row?.retry_after ?? windowSeconds;

  if (count <= limit) {
    return { ok: true, remaining: Math.max(0, limit - count), resetAt };
  }
  return { ok: false, retryAfterSeconds, resetAt };
}

