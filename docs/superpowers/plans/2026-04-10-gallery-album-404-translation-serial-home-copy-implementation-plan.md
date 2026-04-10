# Gallery 相册 404 / 翻译全站串行 / Home 文案 i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 Gallery 中文相册 slug 404、将 Gallery 英文翻译改为全站全局串行、并完成 Home/About/Featured Projects 文案调整与英文翻译。

**Architecture:**  
相册路由使用 `encodeURIComponent` 生成安全路径，并在服务端对 `params.slug` 做安全解码。翻译串行使用 Postgres advisory lock（全局互斥）包裹模型调用阶段，保证同一时刻最多 1 个翻译任务在跑。Home 文案统一收敛到 `src/lib/i18n/strings.ts`，Featured Projects 改为 i18n 驱动，确保英文模式能翻译。

**Tech Stack:** Next.js App Router、Vercel Postgres、Vitest + Testing Library、Cloudflare（已在控制台配置）

---

## 文件改动总览

**新增**
- `src/lib/i18n/locks.ts`：全局 advisory lock 工具（用于翻译串行）
- `src/lib/i18n/__tests__/locks.test.ts`：锁 key 计算的单测（不依赖 DB）
- `src/components/gallery/__tests__/AlbumGridHref.test.tsx`：相册 href 编码的单测

**修改**
- `src/components/gallery/AlbumGrid.tsx`：相册链接 slug encode
- `app/gallery/albums/[slug]/page.tsx`：slug 安全 decode 后再匹配
- `src/lib/i18n/runner.ts`：photo_en 翻译执行加全局锁 + job 状态推进顺序调整
- `src/lib/i18n/strings.ts`：新增 About/Projects 文案 key（中英文）
- `src/components/sections/About.tsx`：高亮区文案改为 i18n key，奖项显示 9+
- `src/components/sections/Projects.tsx`：标题/副标题/卡片内容/CTA 全部改为 i18n

---

## Task 1: 修复相册（迎春）点击 404

**Files:**
- Modify: `src/components/gallery/AlbumGrid.tsx`
- Modify: `app/gallery/albums/[slug]/page.tsx`
- Create: `src/components/gallery/__tests__/AlbumGridHref.test.tsx`

- [ ] **Step 1: 写一个 failing test（AlbumGrid 的 href 必须 encode slug）**

Create `src/components/gallery/__tests__/AlbumGridHref.test.tsx`：
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import AlbumGrid from "../AlbumGrid";

describe("AlbumGrid href encoding", () => {
  it("encodes non-ascii slugs (e.g. 迎春)", () => {
    render(
      <AlbumGrid
        albums={[
          {
            slug: "迎春",
            title: "迎春",
            count: 3,
            coverUrl: null,
            coverAlt: "迎春",
          },
        ]}
      />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(`/gallery/albums/${encodeURIComponent("迎春")}`);
  });
});
```

- [ ] **Step 2: 运行测试，确认 fail**

Run:
```bash
npm test -- --run src/components/gallery/__tests__/AlbumGridHref.test.tsx
```
Expected: FAIL（href 仍是未编码的 `/gallery/albums/迎春`）

- [ ] **Step 3: 最小实现：AlbumGrid 对 slug 做 encodeURIComponent**

Modify `src/components/gallery/AlbumGrid.tsx`：
```tsx
href={`/gallery/albums/${encodeURIComponent(a.slug)}`}
```

- [ ] **Step 4: 服务端对 params.slug 安全 decode 后再匹配**

Modify `app/gallery/albums/[slug]/page.tsx`（在读取 `slug` 后插入）：
```ts
let slug = props.params.slug;
try {
  slug = decodeURIComponent(slug);
} catch {
  // keep as-is
}
```

- [ ] **Step 5: 运行测试与构建**

Run:
```bash
npm test -- --run && npm run build
```
Expected: PASS + build 成功

- [ ] **Step 6: Commit**

```bash
git add src/components/gallery/AlbumGrid.tsx app/gallery/albums/[slug]/page.tsx src/components/gallery/__tests__/AlbumGridHref.test.tsx
git commit -m "fix(gallery): encode album slug to avoid 404"
```

---

## Task 2: Gallery 英文翻译全站全局串行（避免并发翻译卡顿）

**Files:**
- Create: `src/lib/i18n/locks.ts`
- Create: `src/lib/i18n/__tests__/locks.test.ts`
- Modify: `src/lib/i18n/runner.ts`

### 设计说明（实现要点）
使用 Postgres advisory lock 实现全局互斥：
- `select pg_try_advisory_lock(bigint)` 获取锁
- 获取失败：短暂 sleep + 重试（带超时）
- `finally`：`select pg_advisory_unlock(bigint)` 释放锁

> 锁 key 固定（全站一个），确保所有 photo_en 都互斥。

- [ ] **Step 1: 写一个 failing test：锁 key 恒定且可复用**

Create `src/lib/i18n/__tests__/locks.test.ts`：
```ts
import { describe, expect, it } from "vitest";
import { GLOBAL_TRANSLATION_LOCK_KEY } from "../locks";

describe("i18n locks", () => {
  it("uses a stable global lock key", () => {
    expect(typeof GLOBAL_TRANSLATION_LOCK_KEY).toBe("bigint");
    expect(GLOBAL_TRANSLATION_LOCK_KEY > 0n).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试，确认 fail（文件不存在）**

Run:
```bash
npm test -- --run src/lib/i18n/__tests__/locks.test.ts
```
Expected: FAIL（Cannot resolve ../locks）

- [ ] **Step 3: 实现 locks.ts（含 withGlobalTranslationLock）**

Create `src/lib/i18n/locks.ts`：
```ts
import { sql } from "../db";

export const GLOBAL_TRANSLATION_LOCK_KEY = 9823471298347123n;

export async function withGlobalTranslationLock<T>(
  fn: () => Promise<T>,
  opts?: { timeoutMs?: number; pollMs?: number },
): Promise<T> {
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  const pollMs = opts?.pollMs ?? 800;
  const started = Date.now();

  // acquire
  while (true) {
    const { rows } = await sql<{ ok: boolean }>`
      select pg_try_advisory_lock(${GLOBAL_TRANSLATION_LOCK_KEY}) as ok
    `;
    if (rows[0]?.ok) break;
    if (Date.now() - started > timeoutMs) throw new Error("TRANSLATION_LOCK_TIMEOUT");
    await new Promise((r) => setTimeout(r, pollMs));
  }

  try {
    return await fn();
  } finally {
    await sql`select pg_advisory_unlock(${GLOBAL_TRANSLATION_LOCK_KEY})`;
  }
}
```

- [ ] **Step 4: runner.ts 接入全局锁并调整 job 状态推进**

Modify `src/lib/i18n/runner.ts`：
1) import：
```ts
import { withGlobalTranslationLock } from "./locks";
```
2) 将模型调用（`translateGalleryToEn(...)`）包进锁内，并确保：
   - 获取锁之前：job 维持 `queued` 或提示“等待队列”
   - 拿到锁后：`state=running` + progress 推进

示例结构（关键是把 translate 放在锁内）：
```ts
await updateJob(jobId, { state: "queued", progress: 5, message: "等待翻译队列…" });

await withGlobalTranslationLock(async () => {
  await updateJob(jobId, { state: "running", progress: 35, message: "翻译标题与标签…" });
  const out = await translateGalleryToEn({ titleZh, tagsZh, narrativeZh });
  // ...写入缓存、job done
});
```

- [ ] **Step 5: 运行测试与构建**

Run:
```bash
npm test -- --run && npm run build
```
Expected: PASS + build 成功

- [ ] **Step 6: 手工验收（本地/线上）**

打开线上：
- `/gallery/all` 切到 EN
- 观察：翻译会排队，进度条可能显示“等待翻译队列…”，但不会同时多张进入“running 翻译中”

- [ ] **Step 7: Commit**

```bash
git add src/lib/i18n/locks.ts src/lib/i18n/__tests__/locks.test.ts src/lib/i18n/runner.ts
git commit -m "perf(i18n): serialize photo_en translation with pg advisory lock"
```

---

## Task 3: Home 文案修改 + Featured Projects 英文翻译

**Files:**
- Modify: `src/lib/i18n/strings.ts`
- Modify: `src/components/sections/About.tsx`
- Modify: `src/components/sections/Projects.tsx`

- [ ] **Step 1: strings.ts 添加 About 高亮区 keys（中英文）**

在 `src/lib/i18n/strings.ts` 增加 keys（两套字典都要）：
- `section.about.stats.awards.label`
- `section.about.stats.awards.value`（值为 `9+`）
- `section.about.stats.projects.label`
- `section.about.stats.projects.value`（保持 `3`）
- `section.about.stats.interests.label`
- `section.about.stats.interests.value`（中英文各自一条）

- [ ] **Step 2: About.tsx 将硬编码文案改为 t(lang, key)**

Modify `src/components/sections/About.tsx`：
把 `竞赛奖项/（待补充）/公开项目/兴趣` 替换成 `t(lang, ...)`。

- [ ] **Step 3: strings.ts 添加 Projects/Featured Projects 文案 keys（中英文）**

新增 keys：
- `section.projects.title`
- `section.projects.subtitle`（删掉“后续可以补充…”那段，只保留简短描述）
- `section.projects.cta.learnMore`
- `section.projects.cta.viewCode`
- 三个项目条目（title/desc）：
  - `section.projects.items.selfintro.title/desc`
  - `section.projects.items.logistics.title/desc`
  - `section.projects.items.firecar.title/desc`

- [ ] **Step 4: Projects.tsx 接入 i18n（确保英文可翻译）**

Modify `src/components/sections/Projects.tsx`：
- 读取语言（推荐复用现有 client 方案）：
```ts
import { readClientLang } from "../../lib/i18n/client";
import { t } from "../../lib/i18n/strings";
```
- 标题/副标题改用 `t(lang, ...)`
- `FEATURED_PROJECTS` 内的 `title/description/cta label` 改为使用 key（或在 render 时拼装）

> 注意：保留现有交互（卡片点击跳转 + 两个 CTA Link）。

- [ ] **Step 5: 构建并手工验收中英文**

Run:
```bash
npm run build
```
手动检查：
- 首页 About：奖项显示 `9+`
- Featured Projects：中文无占位语；切到英文时标题/副标题/卡片文案均为英文

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n/strings.ts src/components/sections/About.tsx src/components/sections/Projects.tsx
git commit -m "feat(home): update about stats and i18n featured projects copy"
```

---

## Task 4: 推送部署与回归检查

- [ ] **Step 1: 推送 main**
```bash
git push origin main
```

- [ ] **Step 2: 线上回归清单**
1. `/gallery` 点击“迎春”相册不 404  
2. `/gallery/all` 英文模式翻译排队串行（不会同时多张进入 running 翻译阶段）  
3. 首页 About 奖项为 `9+`；Featured Projects 中英文均正确，无占位语  

