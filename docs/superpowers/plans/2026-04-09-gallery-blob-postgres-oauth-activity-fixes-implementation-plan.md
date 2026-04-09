# Gallery (Blob + Postgres + GitHub OAuth Upload) & Activity Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复生产 Activity（GitHub 贡献日历）可诊断性与稳定性；将 Gallery 从仓库图片扫描升级为 Blob+Postgres 数据源，并新增仅 `TonyDDcui`（GitHub OAuth）可用的移动端上传入口。

**Architecture:** Activity 仍走 server route handler + GitHub GraphQL，但把错误分类细化并在 UI 呈现；Gallery 使用 Postgres 存元数据 + Vercel Blob 存图片，上传通过 GitHub OAuth 鉴权后进行。通过 `StorageProvider` 抽象为未来迁移 R2 预留接口。

**Tech Stack:** Next.js 14 (App Router), TypeScript, React, next-auth (Auth.js), @vercel/blob, Vercel Postgres

---

## File map (what we will touch)

**Modify (Activity):**
- `src/lib/github/contributions.ts`
- `app/api/github/contributions/route.ts`
- `src/components/sections/Activity.tsx`

**Modify / Replace (Gallery UI):**
- `app/gallery/page.tsx` (currently repo manifest based; rewrite)

**Create (Auth):**
- `app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth/options.ts`
- `src/lib/auth/guards.ts`

**Create (Gallery data + storage abstraction):**
- `src/lib/storage/provider.ts`
- `src/lib/storage/vercelBlobProvider.ts`
- `src/lib/db/index.ts` (Postgres client helper, if absent)
- `src/lib/gallery/photos.ts` (DB queries)
- `app/api/gallery/photos/route.ts` (create/list photos)
- `app/gallery/upload/page.tsx`
- `src/components/gallery/UploadForm.tsx`
- `src/components/gallery/UploadForm.module.css`
- `src/components/gallery/GalleryGrid.tsx`
- `src/components/gallery/GalleryGrid.module.css`

**Create (DB init docs/scripts):**
- `scripts/db/init.sql`
- Update `DEPLOYMENT.md` (or `README.md`) with env var checklist and setup steps

---

## Preflight: environment prerequisites (must be ready before testing end-to-end)

Vercel Env (Production + Preview):
- `GITHUB_USERNAME=TonyDDcui`
- `GITHUB_TOKEN=...` (GraphQL contributions)
- `GITHUB_CLIENT_ID=...`
- `GITHUB_CLIENT_SECRET=...`
- `NEXTAUTH_SECRET=...`
- `NEXTAUTH_URL=https://cuizhexiao.xyz`
- `BLOB_READ_WRITE_TOKEN=...` (or use Vercel-provided env)
- Postgres env vars (provided by Vercel Postgres integration)

Local dev (optional):
- same variables in `.env.local` (never commit)

---

### Task 1: Improve Activity API error diagnostics

**Files:**
- Modify: `src/lib/github/contributions.ts`
- Modify: `app/api/github/contributions/route.ts`

- [ ] **Step 1: Expand response type to include detailed reasons**

Update `ContributionsResponse`:

```ts
export type ContributionsResponse =
  | { ok: true; calendar: ContributionCalendar }
  | {
      ok: false;
      reason:
        | "missing_env"
        | "github_401"
        | "github_403"
        | "github_rate_limit"
        | "github_error"
        | "unknown_error";
    };
```

- [ ] **Step 2: Return reason based on status + GraphQL errors**

In `getGithubContributionCalendar`, after fetch:

```ts
if (res.status === 401) return { ok: false, reason: "github_401" };
if (res.status === 403) {
  const rl = res.headers.get("x-ratelimit-remaining");
  if (rl === "0") return { ok: false, reason: "github_rate_limit" };
  return { ok: false, reason: "github_403" };
}
if (!res.ok) return { ok: false, reason: "github_error" };

const json = (await res.json()) as GraphQLResponse;
if (json.errors?.length) {
  console.error("[github] graphql errors:", json.errors);
  return { ok: false, reason: "github_error" };
}
```

Also log status when failing (no secrets):

```ts
if (!res.ok) console.error("[github] status:", res.status);
```

- [ ] **Step 3: Keep route handler behavior but pass through new reasons**

No API contract changes besides reason string; keep `status: 200` for UI fallback.

- [ ] **Step 4: Run build**

Run: `npm run build`  
Expected: success

- [ ] **Step 5: Commit**

```bash
git add src/lib/github/contributions.ts app/api/github/contributions/route.ts
git commit -m "fix: improve github contributions error diagnostics"
```

---

### Task 2: Improve Activity UI messages

**Files:**
- Modify: `src/components/sections/Activity.tsx`

- [ ] **Step 1: Map reasons to actionable copy**

Add a small helper:

```ts
function explain(reason: string) {
  switch (reason) {
    case "missing_env":
      return "未配置 GitHub 环境变量（GITHUB_USERNAME / GITHUB_TOKEN）。";
    case "github_401":
      return "GitHub Token 已失效（401）。请在 Vercel 更新 GITHUB_TOKEN。";
    case "github_403":
      return "GitHub Token 权限不足（403）。请检查 token 权限或仓库访问范围。";
    case "github_rate_limit":
      return "GitHub 接口触发限流（rate limit）。稍后再试。";
    default:
      return "暂时无法获取 GitHub 贡献数据。";
  }
}
```

Use it in fallback UI.

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Activity.tsx
git commit -m "feat: show clearer activity error messages"
```

---

### Task 3: Add GitHub OAuth (next-auth) and admin guard

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth/options.ts`
- Create: `src/lib/auth/guards.ts`

- [ ] **Step 1: Install deps**

Run:
```bash
npm i next-auth
```

- [ ] **Step 2: Create auth options**

`src/lib/auth/options.ts`:

```ts
import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
};
```

- [ ] **Step 3: Create route handler**

`app/api/auth/[...nextauth]/route.ts`:

```ts
import NextAuth from "next-auth";
import { authOptions } from "../../../../src/lib/auth/options";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 4: Add guard helper**

`src/lib/auth/guards.ts`:

```ts
import type { Session } from "next-auth";

export function isUploader(session: Session | null) {
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  return name.toLowerCase() === "tonyddcui" || email.toLowerCase().includes("tony");
}
```

Note: refine after seeing actual session shape on prod.

- [ ] **Step 5: Run tests**

Run: `npm test`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/api/auth src/lib/auth package.json package-lock.json
git commit -m "feat: add github oauth via next-auth"
```

---

### Task 4: Create Postgres schema + DB helper

**Files:**
- Create: `scripts/db/init.sql`
- Create: `src/lib/db/index.ts` (if not present)

- [ ] **Step 1: Add init SQL**

`scripts/db/init.sql`:

```sql
create extension if not exists "uuid-ossp";

create table if not exists photos (
  id uuid primary key default uuid_generate_v4(),
  blob_url text not null,
  blob_pathname text not null,
  title text,
  caption text,
  category text,
  tags text[] not null default '{}',
  visibility text not null default 'public',
  sort_order int,
  created_at timestamptz not null default now(),
  published_at timestamptz not null default now()
);

create index if not exists idx_photos_published_at on photos (published_at desc);
create index if not exists idx_photos_visibility on photos (visibility);
create index if not exists idx_photos_tags on photos using gin (tags);
```

- [ ] **Step 2: Add Postgres client helper**

If you already use `@vercel/postgres`, reuse it; otherwise add it.

`src/lib/db/index.ts` (example using `@vercel/postgres`):

```ts
import { sql } from "@vercel/postgres";
export { sql };
```

- [ ] **Step 3: Commit**

```bash
git add scripts/db/init.sql src/lib/db/index.ts
git commit -m "chore: add postgres schema for gallery photos"
```

---

### Task 5: StorageProvider abstraction + Vercel Blob implementation

**Files:**
- Create: `src/lib/storage/provider.ts`
- Create: `src/lib/storage/vercelBlobProvider.ts`

- [ ] **Step 1: Add provider interface**

`src/lib/storage/provider.ts`:

```ts
export type PutResult = { url: string; pathname: string };

export interface StorageProvider {
  putImage(params: {
    file: Blob;
    filename: string;
    contentType: string;
  }): Promise<PutResult>;

  delImage(pathname: string): Promise<void>;
}
```

- [ ] **Step 2: Implement VercelBlobProvider**

`src/lib/storage/vercelBlobProvider.ts`:

```ts
import { del, put } from "@vercel/blob";
import type { StorageProvider } from "./provider";

export const vercelBlobProvider: StorageProvider = {
  async putImage({ file, filename, contentType }) {
    const res = await put(filename, file, {
      access: "public",
      contentType,
    });
    return { url: res.url, pathname: res.pathname };
  },
  async delImage(pathname) {
    await del(pathname);
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/storage
git commit -m "feat: add storage provider abstraction for gallery"
```

---

### Task 6: Gallery DB queries + API routes

**Files:**
- Create: `src/lib/gallery/photos.ts`
- Create: `app/api/gallery/photos/route.ts`

- [ ] **Step 1: DB query helpers**

`src/lib/gallery/photos.ts`:

```ts
import { sql } from "../db";

export type PhotoRow = {
  id: string;
  blob_url: string;
  blob_pathname: string;
  title: string | null;
  caption: string | null;
  category: string | null;
  tags: string[];
  visibility: "public" | "private";
  published_at: string;
};

export async function listPublicPhotos() {
  const { rows } = await sql<PhotoRow>`
    select id, blob_url, blob_pathname, title, caption, category, tags, visibility, published_at
    from photos
    where visibility = 'public'
    order by coalesce(sort_order, 2147483647), published_at desc
    limit 200
  `;
  return rows;
}
```

- [ ] **Step 2: API route for create/list**

`app/api/gallery/photos/route.ts`:
- `GET` returns list public
- `POST` requires session + isUploader guard, writes row

Pseudo:

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../src/lib/auth/options";
import { isUploader } from "../../../../src/lib/auth/guards";
import { sql } from "../../../../src/lib/db";

export async function GET() { ... }
export async function POST(req: Request) { ... }
```

Validate payload fields; tags parse by comma.

- [ ] **Step 3: Commit**

```bash
git add src/lib/gallery app/api/gallery/photos/route.ts
git commit -m "feat: add gallery photos api backed by postgres"
```

---

### Task 7: Rewrite Gallery page to use DB + show upload entry for TonyDDcui

**Files:**
- Modify: `app/gallery/page.tsx`
- Create: `src/components/gallery/GalleryGrid.tsx`
- Create: `src/components/gallery/GalleryGrid.module.css`

- [ ] **Step 1: Server component page**

`app/gallery/page.tsx` should:
- fetch via `listPublicPhotos()` (server-side)
- render `GalleryGrid` with items
- render "添加照片" link only when `isUploader(session)`

- [ ] **Step 2: Implement grid component**

Simple responsive grid using existing Claude tokens.

- [ ] **Step 3: Commit**

```bash
git add app/gallery/page.tsx src/components/gallery
git commit -m "feat: rewrite gallery to use blob+postgres photos"
```

---

### Task 8: Implement Upload page (mobile-friendly) using Vercel Blob + Postgres

**Files:**
- Create: `app/gallery/upload/page.tsx`
- Create: `src/components/gallery/UploadForm.tsx`
- Create: `src/components/gallery/UploadForm.module.css`

- [ ] **Step 1: Upload page auth gate**

If not uploader:
- show sign-in button (GitHub)
- if signed in but not TonyDDcui: show "无权限"

- [ ] **Step 2: Upload form**

Fields:
- file input accept="image/*"
- title, caption
- category select (free text allowed)
- tags input (comma-separated)

Upload steps:
1) Upload to Blob using server route (start with server upload via API to keep logic simple)
2) Call POST `/api/gallery/photos` to insert row

Note: For initial MVP, server-upload is ok; later can switch to Client Uploads.

- [ ] **Step 3: Commit**

```bash
git add app/gallery/upload src/components/gallery/UploadForm*
git commit -m "feat: add gallery upload page for owner"
```

---

### Task 9: Docs + final verification + deploy

**Files:**
- Modify: `DEPLOYMENT.md` (or `README.md`)

- [ ] **Step 1: Add deployment checklist**

Include:
- SQL init instructions
- Vercel env var list
- Blob/Postgres setup steps in Vercel dashboard

- [ ] **Step 2: Run tests + build**

Run:
```bash
npm test
npm run build
```

- [ ] **Step 3: Merge & push**

```bash
git checkout -b feat/gallery-blob-postgres-oauth
# ... merge to main after review
git push origin main
```

---

## Self-review (spec coverage)
- [x] Activity: reason 细化 + UI 提示 → Tasks 1-2
- [x] Gallery: Blob+Postgres 数据源 → Tasks 4-7
- [x] Upload: GitHub OAuth + 仅本人 → Tasks 3 & 8
- [x] 未来 R2 预留：StorageProvider → Task 5

