import { sql } from "../db";

type Row = { value: string };
type RowWithMeta = { value: string; updated_at: string };

async function ensureTable() {
  // 兼容未执行 init.sql 的环境：首次写入时尝试创建表。
  // 如果数据库权限不足，后续读写会静默失败并回退到本地静态资源。
  await sql`
    create table if not exists site_kv (
      key text primary key,
      value text not null,
      updated_at timestamptz not null default now()
    )
  `;
}

export async function getSiteKv(key: string): Promise<string | null> {
  try {
    const { rows } = await sql<Row>`select value from site_kv where key = ${key} limit 1`;
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function getSiteKvRecord(
  key: string,
): Promise<{ value: string; updatedAt: Date } | null> {
  try {
    const { rows } =
      await sql<RowWithMeta>`select value, updated_at from site_kv where key = ${key} limit 1`;
    const r = rows[0];
    if (!r?.value) return null;
    return { value: r.value, updatedAt: new Date(r.updated_at) };
  } catch {
    return null;
  }
}

export async function setSiteKv(key: string, value: string): Promise<void> {
  try {
    await ensureTable();
    await sql`
      insert into site_kv (key, value)
      values (${key}, ${value})
      on conflict (key) do update
      set value = excluded.value,
          updated_at = now()
    `;
  } catch {
    // ignore
  }
}
