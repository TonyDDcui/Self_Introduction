import { sql } from "../db";

const ADMIN_HEIC_BATCH_LOCK_KEY = "9823471298348001";

export async function withAdminHeicBatchLock<T>(fn: () => Promise<T>): Promise<T> {
  const { rows } = await sql<{ ok: boolean }>`
    select pg_try_advisory_lock(${ADMIN_HEIC_BATCH_LOCK_KEY}::bigint) as ok
  `;
  if (!rows[0]?.ok) throw new Error("HEIC_BATCH_ALREADY_RUNNING");
  try {
    return await fn();
  } finally {
    await sql`select pg_advisory_unlock(${ADMIN_HEIC_BATCH_LOCK_KEY}::bigint)`;
  }
}

