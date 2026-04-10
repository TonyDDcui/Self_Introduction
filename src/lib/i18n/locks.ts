import { sql } from "../db";

// 固定常量：用于全站全局互斥（同一时刻最多 1 个翻译任务在跑）
export const GLOBAL_TRANSLATION_LOCK_KEY = "9823471298347123";

export async function withGlobalTranslationLock<T>(
  fn: () => Promise<T>,
  opts?: { timeoutMs?: number; pollMs?: number },
): Promise<T> {
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  const pollMs = opts?.pollMs ?? 800;
  const started = Date.now();

  while (true) {
    const { rows } = await sql<{ ok: boolean }>`
      select pg_try_advisory_lock(${GLOBAL_TRANSLATION_LOCK_KEY}::bigint) as ok
    `;
    if (rows[0]?.ok) break;
    if (Date.now() - started > timeoutMs) throw new Error("TRANSLATION_LOCK_TIMEOUT");
    await new Promise((r) => setTimeout(r, pollMs));
  }

  try {
    return await fn();
  } finally {
    await sql`select pg_advisory_unlock(${GLOBAL_TRANSLATION_LOCK_KEY}::bigint)`;
  }
}
