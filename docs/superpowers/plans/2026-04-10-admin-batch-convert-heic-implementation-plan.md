# Admin Batch Convert HEIC/HEIF → JPG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增一个管理员后台 API：支持 dryRun 预演与执行模式，将历史 HEIC/HEIF 图片批量转为 JPG 上传到 Vercel Blob，并更新 Postgres `photos` 的 `blob_url/blob_pathname` 指向新 JPG。

**Architecture:**  
API 路由 `POST /api/admin/gallery/convert-heic`：鉴权（next-auth uploader）+ 同源校验 + 限流 + 全局互斥锁；dryRun 返回候选清单；执行模式串行下载→sharp 转码→blob 上传→DB 更新。旧 blob 不删除，便于回滚。

**Tech Stack:** Next.js Route Handlers、Vercel Blob（server SDK）、Vercel Postgres、sharp、Vitest

---

## 文件改动总览

**新增**
- `app/api/admin/gallery/convert-heic/route.ts`
- `src/lib/gallery/heicBatch.ts`
- `src/lib/gallery/__tests__/heicBatch.test.ts`
- `src/lib/admin/locks.ts`

**修改**
- `package.json`（如需新增依赖：`@vercel/blob` server SDK 已有；sharp 已有）

---

## Task 1: 提取“候选筛选”逻辑（可单测）

**Files:**
- Create: `src/lib/gallery/heicBatch.ts`
- Create: `src/lib/gallery/__tests__/heicBatch.test.ts`

- [ ] **Step 1: 写 failing test：只匹配 HEIC/HEIF**

Create `src/lib/gallery/__tests__/heicBatch.test.ts`：
```ts
import { describe, expect, it } from "vitest";
import { isHeicCandidate } from "../heicBatch";

describe("heic batch", () => {
  it("matches heic/heif urls", () => {
    expect(isHeicCandidate({ blob_url: "https://x/a.heic", blob_pathname: "" })).toBe(true);
    expect(isHeicCandidate({ blob_url: "https://x/a.HEIF", blob_pathname: "" })).toBe(true);
    expect(isHeicCandidate({ blob_url: "https://x/a.jpg", blob_pathname: "" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- --run src/lib/gallery/__tests__/heicBatch.test.ts
```
Expected: FAIL（module not found）

- [ ] **Step 3: 实现 isHeicCandidate**

Create `src/lib/gallery/heicBatch.ts`：
```ts
export type HeicCandidateRow = {
  id?: string;
  blob_url?: string | null;
  blob_pathname?: string | null;
};

export function isHeicCandidate(row: HeicCandidateRow): boolean {
  const u = (row.blob_url ?? "").toLowerCase();
  const p = (row.blob_pathname ?? "").toLowerCase();
  return u.includes(".heic") || u.includes(".heif") || p.includes(".heic") || p.includes(".heif");
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npm test -- --run src/lib/gallery/__tests__/heicBatch.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/gallery/heicBatch.ts src/lib/gallery/__tests__/heicBatch.test.ts
git commit -m "test: add heic candidate matcher for batch conversion"
```

---

## Task 2: 增加批处理互斥锁（避免重复执行）

**Files:**
- Create: `src/lib/admin/locks.ts`

- [ ] **Step 1: Create admin locks helper**

Create `src/lib/admin/locks.ts`：
```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/admin/locks.ts
git commit -m "feat(admin): add advisory lock for heic batch job"
```

---

## Task 3: 实现 API 路由（dryRun + 执行）

**Files:**
- Create: `app/api/admin/gallery/convert-heic/route.ts`
- Modify: `src/lib/security/rateLimit.ts`（如需新 key 规范可不改）

- [ ] **Step 1: Create route skeleton（鉴权/同源/限流/入参校验）**

Create `app/api/admin/gallery/convert-heic/route.ts`：
```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../src/lib/auth/options";
import { isUploader } from "../../../../../src/lib/auth/guards";
import { sql } from "../../../../../src/lib/db";
import { getClientIp, assertSameOrigin, json429 } from "../../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../../src/lib/security/rateLimit";
import { withAdminHeicBatchLock } from "../../../../../src/lib/admin/locks";
import { isHeicCandidate } from "../../../../../src/lib/gallery/heicBatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = ["hkg1"];

type Body = { dryRun?: boolean; limit?: number };

export async function POST(request: Request) {
  const sameOrigin = assertSameOrigin(request);
  if (!sameOrigin.ok) return NextResponse.json({ ok: false, reason: sameOrigin.reason }, { status: 403 });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  if (!isUploader(session)) return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });

  const ip = getClientIp(request);
  const rl = await enforceRateLimit({ key: `api:admin:heic:ip=${ip}:actor=uploader`, limit: 5, windowSeconds: 60 });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  const body = (await request.json().catch(() => ({}))) as Body;
  const dryRun = Boolean(body.dryRun);
  const limit = Math.min(500, Math.max(1, Math.floor(body.limit ?? 50)));

  return await withAdminHeicBatchLock(async () => {
    const { rows } = await sql<{ id: string; blob_url: string | null; blob_pathname: string | null }>`
      select id, blob_url, blob_pathname
      from photos
      order by published_at desc nulls last, created_at desc
      limit ${limit}
    `;

    const candidates = rows.filter((r) => isHeicCandidate(r));

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        total: candidates.length,
        items: candidates.map((r) => ({
          photoId: r.id,
          from: r.blob_url,
          to: `gallery/converted/${r.id}.jpg`,
        })),
      });
    }

    // execute implementation in next steps
    return NextResponse.json({ ok: false, reason: "NOT_IMPLEMENTED" }, { status: 501 });
  });
}
```

- [ ] **Step 2: Run build to ensure typecheck passes**

Run:
```bash
npm run build
```
Expected: build 成功（执行部分暂未实现会返回 501 但不影响 build）

- [ ] **Step 3: 实现执行逻辑（sharp 转码 + blob 上传 + DB 更新）**

在同文件中将 `NOT_IMPLEMENTED` 替换为串行执行：
1) `import { put } from "@vercel/blob";`
2) 对每个 candidate：
   - `fetch(blob_url)` 下载
   - `sharp(buffer).jpeg({ quality: 88 }).toBuffer()`
   - `put(pathname, buffer, { access: "public", contentType: "image/jpeg" })`
   - `update photos set blob_url=?, blob_pathname=? where id=?`
3) 收集失败列表并返回 summary

- [ ] **Step 4: Run tests + build**

Run:
```bash
npm test -- --run && npm run build
```
Expected: PASS + build 成功

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/gallery/convert-heic/route.ts
git commit -m "feat(admin): add batch api to convert heic/heif to jpg"
```

---

## Task 4: 上线与运行手册

- [ ] **Step 1: Push**
```bash
git push origin main
```

- [ ] **Step 2: 使用方法**
1) DryRun：
```bash
curl -X POST https://cuizhexiao.xyz/api/admin/gallery/convert-heic \
  -H 'content-type: application/json' \
  -d '{"dryRun":true,"limit":200}'
```
2) 执行：
```bash
curl -X POST https://cuizhexiao.xyz/api/admin/gallery/convert-heic \
  -H 'content-type: application/json' \
  -d '{"dryRun":false,"limit":200}'
```

> 由于需要登录态 cookie，实际建议在浏览器控制台 fetch（或我后续补一个 /admin 页面按钮）。

