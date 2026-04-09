# Security + Performance Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为站点增加“偏严格”的防攻击能力（API 限流 + 同源校验 + 安全响应头），并通过缓存减少数据库压力提升加载速度，同时将顶栏头像调整到约 45px。

**Architecture:** 以 Node.js runtime 的 API route 为核心入口做限流（存储在 Neon Postgres，保证多实例一致），对写请求增加同源校验；性能侧用 `unstable_cache` 缓存公共照片列表/相册汇总，避免每次 SSR 打 DB。Hobby 计划下不依赖 Vercel WAF/Rate Limiting 产品能力。

**Tech Stack:** Next.js App Router、NextAuth、Neon Postgres（@vercel/postgres）、Vercel Blob、`next/cache`、Next.js `headers()` 配置

---

## 文件结构与职责

**Create**
- `src/lib/security/requestGuards.ts`：获取客户端 IP、同源校验、通用 4xx 响应 helper
- `src/lib/security/rateLimit.ts`：Postgres 滑动窗口（固定 60s）限流实现（返回剩余时间/是否超限）

**Modify**
- `next.config.mjs`：全站安全响应头
- `src/components/nav/AppleNav.module.css`：头像尺寸 45px + 间距微调
- `src/components/nav/AppleNav.tsx`：同步 img width/height
- `app/api/gallery/upload/route.ts`：上传限流 + 同源校验
- `app/api/gallery/photos/[id]/route.ts`：删除限流 + 同源校验
- `app/api/gallery/photos/route.ts`：POST 写库限流 + 同源校验（GET 不限流）
- `app/api/gallery/blob/route.ts`：client upload token 接口限流 + 同源校验
- `src/lib/gallery/photos.ts`：提供缓存版 `listPublicPhotosCached`
- `app/gallery/page.tsx`、`app/gallery/all/page.tsx`、`app/gallery/albums/[slug]/page.tsx`：改用缓存函数（仍保留 session 读取）

**DB**
- 修改 `scripts/db/init.sql`：新增 `rate_limits` 表（以及可选索引）

---

## Task 1: DB — 新增 rate_limits 表

**Files**
- Modify: `scripts/db/init.sql`

- [ ] Step 1: 追加建表 SQL

```sql
-- scripts/db/init.sql
create table if not exists rate_limits (
  key text primary key,
  count int not null,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);
```

- [ ] Step 2: Commit

```bash
git add scripts/db/init.sql
git commit -m "db: add rate_limits table"
```

---

## Task 2: 安全基础设施 — requestGuards（IP + 同源校验）

**Files**
- Create: `src/lib/security/requestGuards.ts`

- [ ] Step 1: 实现 `getClientIp(req: Request): string`

规则：
- 读取 `x-forwarded-for`，取第一个 IP（逗号分隔）
- 兜底 `x-real-ip`
- 否则 `unknown`

- [ ] Step 2: 实现 `assertSameOrigin(req: Request): { ok: true } | { ok:false; reason:string }`

规则：
- `GET/HEAD` 直接 ok
- 其它方法：读取 `origin`，没有则读 `referer`
- 解析 URL 的 host，与 `req.headers.get("host")` 必须一致
- 不一致返回 reason：`forbidden_origin`

- [ ] Step 3: Commit

```bash
git add src/lib/security/requestGuards.ts
git commit -m "feat(security): request ip and same-origin guards"
```

---

## Task 3: 安全基础设施 — Postgres 滑窗限流模块

**Files**
- Create: `src/lib/security/rateLimit.ts`

- [ ] Step 1: 定义限流参数与结果类型

```ts
export type RateLimitConfig = {
  key: string;        // e.g. "api:gallery:upload:ip=1.2.3.4:actor=uploader"
  limit: number;      // e.g. 6
  windowSeconds: number; // fixed 60
};

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: string }
  | { ok: false; retryAfterSeconds: number; resetAt: string };
```

- [ ] Step 2: 实现 `enforceRateLimit(config: RateLimitConfig): Promise<RateLimitResult>`

SQL（单条 upsert）核心思路：
- `now() > reset_at` 则 reset `count=1`、`reset_at=now()+interval`
- 否则 `count=count+1`
- 返回 `count/reset_at`，若 count > limit 则 ok:false

示例 SQL（可按实际写法微调）：

```ts
const { rows } = await sql<{ count: number; reset_at: string }>`
  insert into rate_limits (key, count, reset_at)
  values (${key}, 1, now() + (${windowSeconds} || ' seconds')::interval)
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
  returning count, reset_at
`;
```

- [ ] Step 3: Commit

```bash
git add src/lib/security/rateLimit.ts
git commit -m "feat(security): postgres rate limiter"
```

---

## Task 4: API 保护落地（偏严格 A + 管理员豁免）

**阈值（A）**
- 通用 API：20/min；Uploader：60/min
- 上传/删除：6/min；Uploader：60/min

**Files**
- Modify: `app/api/gallery/upload/route.ts`
- Modify: `app/api/gallery/photos/[id]/route.ts`
- Modify: `app/api/gallery/photos/route.ts`
- Modify: `app/api/gallery/blob/route.ts`

- [ ] Step 1: 在每个 route 的入口加同源校验

```ts
import { assertSameOrigin } from "../../../../src/lib/security/requestGuards";
// ...
const sameOrigin = assertSameOrigin(req);
if (!sameOrigin.ok) return NextResponse.json({ ok:false, reason: sameOrigin.reason }, { status: 403 });
```

- [ ] Step 2: 在入口加限流（在鉴权之后，避免匿名刷导致 DB 写放大；但对未登录的敏感接口仍可加“更低阈值”）

示例（上传）：

```ts
import { getClientIp } from "../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../src/lib/security/rateLimit";

const ip = getClientIp(req);
const actor = isUploader(session) ? "uploader" : "user";
const limit = actor === "uploader" ? 60 : 6;
const key = `api:gallery:upload:ip=${ip}:actor=${actor}`;
const rl = await enforceRateLimit({ key, limit, windowSeconds: 60 });
if (!rl.ok) {
  return NextResponse.json(
    { ok: false, reason: "rate_limited", resetAt: rl.resetAt },
    { status: 429, headers: { "retry-after": String(rl.retryAfterSeconds) } },
  );
}
```

- [ ] Step 3: 对 `/api/gallery/photos` 的 GET 不做限流（避免影响正常浏览），POST 做通用 API 限流（20/min）

- [ ] Step 4: Commit（可拆成 2 次 commit：同源校验/限流）

```bash
git add app/api/gallery/upload/route.ts app/api/gallery/photos/[id]/route.ts app/api/gallery/photos/route.ts app/api/gallery/blob/route.ts
git commit -m "feat(security): rate limit and same-origin for gallery apis"
```

---

## Task 5: 安全响应头（next.config.mjs）

**Files**
- Modify: `next.config.mjs`

- [ ] Step 1: 增加 headers()

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] Step 2: Commit

```bash
git add next.config.mjs
git commit -m "chore(security): add baseline security headers"
```

---

## Task 6: 性能 — 缓存公共照片列表（降低 DB 压力）

**Files**
- Modify: `src/lib/gallery/photos.ts`
- Modify: `app/gallery/page.tsx`
- Modify: `app/gallery/all/page.tsx`
- Modify: `app/gallery/albums/[slug]/page.tsx`

- [ ] Step 1: 在 `photos.ts` 增加缓存函数

```ts
import { unstable_cache } from "next/cache";

export const listPublicPhotosCached = unstable_cache(
  async () => listPublicPhotos(),
  ["gallery:publicPhotos:v1"],
  { revalidate: 60 },
);
```

- [ ] Step 2: 3 个 gallery 页面改用 `listPublicPhotosCached()`

- [ ] Step 3: Commit

```bash
git add src/lib/gallery/photos.ts app/gallery/page.tsx app/gallery/all/page.tsx app/gallery/albums/[slug]/page.tsx
git commit -m "perf(gallery): cache public photos query"
```

---

## Task 7: UI — 顶栏头像调到 45px

**Files**
- Modify: `src/components/nav/AppleNav.module.css`
- Modify: `src/components/nav/AppleNav.tsx`

- [ ] Step 1: 将头像尺寸改为 45px（并将 left gap 从 12 适当调小，例如 10）

- [ ] Step 2: 同步 img width/height

- [ ] Step 3: Commit

```bash
git add src/components/nav/AppleNav.module.css src/components/nav/AppleNav.tsx
git commit -m "ui(nav): enlarge avatar to 45px"
```

---

## Task 8: 全量验证与发布

- [ ] Step 1: 本地构建

Run: `npm run build`  
Expected: success

- [ ] Step 2: 手动快速验收（线上）
1. 不登录访问 /gallery，应该正常且更快
2. 登录 uploader 批量上传，基本不触发 429
3. 用脚本/刷新模拟高频调用上传/删除接口，应返回 429 + Retry-After
4. 从非本站域名发起 POST/DELETE（无同源），应 403

- [ ] Step 3: Push

```bash
git push origin main
```

---

## 自检（对照 Spec）

- 防攻击：API 速率限制（A 档）+ uploader 豁免 ✅ Tasks 3-4
- CSRF 同源校验 ✅ Task 2 + Task 4
- 安全响应头 ✅ Task 5
- 提速（缓存公共照片列表）✅ Task 6
- 头像 45px ✅ Task 7

