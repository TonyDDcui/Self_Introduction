import { sql } from "../db";

export type I18nJobState = "queued" | "running" | "done" | "failed";

export type I18nJobRow = {
  job_id: string;
  kind: string;
  target_id: string;
  lang: string;
  state: I18nJobState;
  progress: number;
  message: string;
  error: string | null;
  created_at: string;
  updated_at: string;
};

async function ensureTable() {
  await sql`
    create table if not exists i18n_jobs (
      job_id text primary key,
      kind text not null,
      target_id text not null,
      lang text not null,
      state text not null,
      progress int not null default 0,
      message text not null default '',
      error text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create index if not exists idx_i18n_jobs_kind_target_lang
      on i18n_jobs (kind, target_id, lang)
  `;
}

export async function getJob(jobId: string): Promise<I18nJobRow | null> {
  await ensureTable();
  const { rows } = await sql<I18nJobRow>`
    select * from i18n_jobs where job_id = ${jobId} limit 1
  `;
  return rows[0] ?? null;
}

export async function findLatestJob(input: {
  kind: string;
  targetId: string;
  lang: string;
}): Promise<I18nJobRow | null> {
  await ensureTable();
  const { rows } = await sql<I18nJobRow>`
    select * from i18n_jobs
    where kind = ${input.kind} and target_id = ${input.targetId} and lang = ${input.lang}
    order by created_at desc
    limit 1
  `;
  return rows[0] ?? null;
}

export async function createJob(input: {
  jobId: string;
  kind: string;
  targetId: string;
  lang: string;
}): Promise<void> {
  await ensureTable();
  await sql`
    insert into i18n_jobs (job_id, kind, target_id, lang, state, progress, message)
    values (${input.jobId}, ${input.kind}, ${input.targetId}, ${input.lang}, 'queued', 0, '')
    on conflict (job_id) do nothing
  `;
}

export async function updateJob(
  jobId: string,
  patch: Partial<Pick<I18nJobRow, "state" | "progress" | "message" | "error">>,
): Promise<void> {
  await ensureTable();
  const state = patch.state ?? null;
  const progress = typeof patch.progress === "number" ? patch.progress : null;
  const message = typeof patch.message === "string" ? patch.message : null;
  const error = typeof patch.error === "string" ? patch.error : null;
  await sql`
    update i18n_jobs
    set
      state = coalesce(${state}, state),
      progress = coalesce(${progress}, progress),
      message = coalesce(${message}, message),
      error = coalesce(${error}, error),
      updated_at = now()
    where job_id = ${jobId}
  `;
}

