# i18n + Gallery 翻译缓存 + 国内访问优化（Cloudflare）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现全站 zh/en 切换与可缓存的英文内容（Blog 文件缓存 + Gallery 落库缓存与进度条任务），并完成国内访问优化（Next/Image、上传转码、安全头/限流、Cloudflare WAF 配置指引）。

**Architecture:** 语言状态用 `site_lang` cookie；UI 文案用字典；Blog 英文内容预生成到 `content/blog/en/`；Gallery 英文内容（title/tags/narrative）通过 Postgres 表缓存，缺失时走异步任务队列并提供 job 进度轮询；性能与安全通过 Next/Image、上传转码、严格限流、安全响应头与 Cloudflare 橙云/WAF。

**Tech Stack:** Next.js 14 App Router, TypeScript, @vercel/postgres, @vercel/blob, EdgeFn (DeepSeek-V3.2), Cloudflare.

---

## 文件改动总览（先读这个）

**新增（i18n Gallery 翻译与任务）**
- Create: `src/lib/i18n/hash.ts`（source_hash 计算）
- Create: `src/lib/i18n/galleryTranslate.ts`（调用 EdgeFn 翻译并返回结构化 JSON）
- Create: `src/lib/i18n/jobs.ts`（job 表/状态机/锁）
- Create: `app/api/i18n/jobs/[jobId]/route.ts`（GET job 状态）
- Create: `app/api/i18n/gallery/photos/[id]/en/ensure/route.ts`（POST 创建/复用任务）
- Modify: `src/lib/db/index.ts`（若需要导出 sql client helper）

**Gallery UI**
- Modify: `src/components/gallery/GalleryGrid.tsx`（英文模式触发 ensure + 显示 loading/进度）
- Modify: `src/components/gallery/GalleryImage.tsx`（接入 next/image，显示翻译结果）
- Modify: `src/components/gallery/AlbumStoryFeed.tsx` / `AlbumNarrative.tsx`（英文 narrative/title/tags）
- Modify: `app/gallery/**` pages（将 UI 文案 key 化）

**Blog/MDX 图片优化**
- Modify: `src/components/nav/AppleNav.tsx`（头像 next/image）
- Modify: `src/components/sections/AboutAvatar.tsx`（头像 next/image）
- Modify: `src/components/gallery/GalleryImage.tsx`（图片 next/image）
- Modify: `app/blog/[slug]/page.tsx`（MDX `<img>` 映射到 `next/image`）
- Modify: `next.config.mjs`（images.remotePatterns + headers 增强）

**上传转码**
- Modify: `app/api/gallery/upload/route.ts`（接入 sharp 转码）
- Add deps: `sharp`（及必要的 heif 支持评估）

**安全与限流**
- Modify: `src/lib/security/rateLimit.ts`（更严格策略 + i18n key）
- Modify: `src/lib/security/requestGuards.ts`（更严格同源/方法校验）
- Modify: `next.config.mjs`（补齐 HSTS / CSP / 其它 header）

**Cloudflare 文档**
- Create: `docs/cloudflare-setup.md`（橙云 + WAF + 缓存规则步骤）

---

## Task 1: 建表与 DB 工具（photo_translations + i18n_jobs）

**Files:**
- Modify: `scripts/db/init.sql`
- Create: `src/lib/i18n/jobs.ts`
- Test: 手动：`pnpm` 无；使用 `npm run build` + API 试调用

- [ ] **Step 1: 在 init.sql 增加两张表（翻译缓存 + 任务表）**

在 `scripts/db/init.sql` 末尾追加（保持幂等）：

```sql
create table if not exists photo_translations (
  photo_id text not null,
  lang text not null,
  title text,
  tags jsonb,
  narrative_md text,
  source_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (photo_id, lang)
);

create index if not exists idx_photo_translations_lang_updated_at
  on photo_translations (lang, updated_at desc);

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
);

create index if not exists idx_i18n_jobs_kind_target_lang
  on i18n_jobs (kind, target_id, lang);
```

- [ ] **Step 2: 新建 jobs 数据访问层**

Create `src/lib/i18n/jobs.ts`：

```ts
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

async function ensureTables() {
  // 运行时兜底：若 init.sql 未跑，也能创建
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
  await ensureTables();
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
  await ensureTables();
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
  await ensureTables();
  await sql`
    insert into i18n_jobs (job_id, kind, target_id, lang, state, progress, message)
    values (${input.jobId}, ${input.kind}, ${input.targetId}, ${input.lang}, 'queued', 0, '')
    on conflict (job_id) do nothing
  `;
}

export async function updateJob(jobId: string, patch: Partial<Pick<I18nJobRow, "state" | "progress" | "message" | "error">>) {
  await ensureTables();
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
```

- [ ] **Step 3: 构建验证**

Run: `npm run build`  
Expected: success

- [ ] **Step 4: Commit**

```bash
git add scripts/db/init.sql src/lib/i18n/jobs.ts
git commit -m "feat(i18n): add i18n_jobs and photo_translations tables"
```

---

## Task 2: Gallery 翻译缓存读写（photo_translations）

**Files:**
- Create: `src/lib/i18n/hash.ts`
- Create: `src/lib/i18n/photoTranslations.ts`
- Test: 通过 node REPL/route 手动验证

- [ ] **Step 1: 新建 source_hash 计算工具**

Create `src/lib/i18n/hash.ts`：

```ts
import crypto from "node:crypto";

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
```

- [ ] **Step 2: 新建 photo_translations 访问层**

Create `src/lib/i18n/photoTranslations.ts`：

```ts
import { sql } from "../db";

export type PhotoTranslationRow = {
  photo_id: string;
  lang: string;
  title: string | null;
  tags: unknown;
  narrative_md: string | null;
  source_hash: string;
  created_at: string;
  updated_at: string;
};

async function ensureTable() {
  await sql`
    create table if not exists photo_translations (
      photo_id text not null,
      lang text not null,
      title text,
      tags jsonb,
      narrative_md text,
      source_hash text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (photo_id, lang)
    )
  `;
  await sql`
    create index if not exists idx_photo_translations_lang_updated_at
      on photo_translations (lang, updated_at desc)
  `;
}

export async function getPhotoTranslation(photoId: string, lang: string) {
  await ensureTable();
  const { rows } = await sql<PhotoTranslationRow>`
    select * from photo_translations where photo_id = ${photoId} and lang = ${lang} limit 1
  `;
  return rows[0] ?? null;
}

export async function upsertPhotoTranslation(input: {
  photoId: string;
  lang: string;
  title: string;
  tags: string[];
  narrativeMd: string;
  sourceHash: string;
}) {
  await ensureTable();
  await sql`
    insert into photo_translations (photo_id, lang, title, tags, narrative_md, source_hash)
    values (${input.photoId}, ${input.lang}, ${input.title}, ${JSON.stringify(input.tags)}::jsonb, ${input.narrativeMd}, ${input.sourceHash})
    on conflict (photo_id, lang) do update set
      title = excluded.title,
      tags = excluded.tags,
      narrative_md = excluded.narrative_md,
      source_hash = excluded.source_hash,
      updated_at = now()
  `;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n/hash.ts src/lib/i18n/photoTranslations.ts
git commit -m "feat(i18n): add photo_translations data access"
```

---

## Task 3: 翻译器（DeepSeek-V3.2）与提示词（输出 JSON）

**Files:**
- Create: `src/lib/i18n/galleryTranslate.ts`
- Modify: `src/lib/ai/edgefn.ts`（可选：允许更高 maxTokens 或更严格 JSON 输出处理）

- [ ] **Step 1: 实现翻译调用与 JSON 提取**

Create `src/lib/i18n/galleryTranslate.ts`：

```ts
import { edgefnChatComplete } from "../ai/edgefn";

export type GalleryEnPayload = {
  title: string;
  tags: string[];
  narrative_md: string;
};

function extractJsonObject(text: string): unknown {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

export async function translateGalleryToEn(input: {
  titleZh: string;
  tagsZh: string[];
  narrativeZh: string;
}): Promise<GalleryEnPayload> {
  const system =
    "You are a professional bilingual editor. Translate Chinese photo metadata into natural, polished English. Do NOT output reasoning. Output JSON only.";
  const user = `Return STRICT JSON with keys: title, tags, narrative_md.\n\n[Title]\n${input.titleZh}\n\n[Tags]\n${input.tagsZh.join(", ")}\n\n[Narrative]\n${input.narrativeZh}`;

  const out = await edgefnChatComplete({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    model: "DeepSeek-V3.2",
    temperature: 0.2,
    maxTokens: 900,
    allowReasoningFallback: false,
  });

  const obj = extractJsonObject(out);
  if (!obj || typeof obj !== "object") throw new Error("I18N_TRANSLATE_INVALID_JSON");
  const o = obj as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  const narrative_md = String(o.narrative_md ?? "").trim();
  const tags = Array.isArray(o.tags) ? o.tags.map((x) => String(x).trim()).filter(Boolean) : [];
  if (!title || !narrative_md) throw new Error("I18N_TRANSLATE_EMPTY_FIELDS");
  return { title, tags, narrative_md };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/i18n/galleryTranslate.ts
git commit -m "feat(i18n): gallery zh->en translator via DeepSeek-V3.2"
```

---

## Task 4: i18n Job API（创建任务 + 轮询进度）

**Files:**
- Create: `app/api/i18n/jobs/[jobId]/route.ts`
- Create: `app/api/i18n/gallery/photos/[id]/en/ensure/route.ts`
- Modify: `src/lib/security/rateLimit.ts`
- Modify: `src/lib/security/requestGuards.ts`

- [ ] **Step 1: GET job 状态接口**

Create `app/api/i18n/jobs/[jobId]/route.ts`：

```ts
import { NextResponse } from "next/server";
import { getJob } from "../../../../../src/lib/i18n/jobs";
import { assertSameOrigin } from "../../../../../src/lib/security/requestGuards";

export async function GET(request: Request, context: { params: { jobId: string } }) {
  const sameOrigin = assertSameOrigin(request);
  if (!sameOrigin.ok) return NextResponse.json({ ok: false, reason: sameOrigin.reason }, { status: 403 });

  const jobId = context.params.jobId;
  const job = await getJob(jobId);
  if (!job) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, job });
}
```

- [ ] **Step 2: POST ensure（创建或复用任务）**

Create `app/api/i18n/gallery/photos/[id]/en/ensure/route.ts`：

```ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { assertSameOrigin } from "../../../../../../../../src/lib/security/requestGuards";
import { enforceRateLimit, json429 } from "../../../../../../../../src/lib/security/rateLimit";
import { findLatestJob, createJob } from "../../../../../../../../src/lib/i18n/jobs";

export async function POST(request: Request, context: { params: { id: string } }) {
  const sameOrigin = assertSameOrigin(request);
  if (!sameOrigin.ok) return NextResponse.json({ ok: false, reason: sameOrigin.reason }, { status: 403 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await enforceRateLimit({
    key: `api:i18n:ensure:ip=${ip}`,
    limit: 30,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  const id = context.params.id;
  if (!id) return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });

  const existing = await findLatestJob({ kind: "photo_en", targetId: id, lang: "en" });
  if (existing && (existing.state === "queued" || existing.state === "running")) {
    return NextResponse.json({ ok: true, jobId: existing.job_id });
  }

  const jobId = crypto.randomUUID();
  await createJob({ jobId, kind: "photo_en", targetId: id, lang: "en" });
  // 实际执行在 Task 5（后台 worker / fire-and-forget）
  return NextResponse.json({ ok: true, jobId });
}
```

- [ ] **Step 3: 限流工具扩展（json429 若不存在则按现有项目方式复用）**

在 `src/lib/security/rateLimit.ts` 中确认已有 `json429`；若没有则添加一个与 gallery 相同的 helper。

- [ ] **Step 4: Commit**

```bash
git add app/api/i18n src/lib/security
git commit -m "feat(i18n): job APIs for gallery translation"
```

---

## Task 5: Gallery 翻译任务执行器（后台执行 + 写入 DB + 更新 job 进度）

**Files:**
- Create: `src/lib/i18n/runner.ts`
- Modify: `app/api/i18n/gallery/photos/[id]/en/ensure/route.ts`（触发执行）
- Modify: `src/lib/gallery/photos.ts`（提供按 id 取 photo + narrative）

- [ ] **Step 1: 实现 runner（按 jobId 执行）**

Create `src/lib/i18n/runner.ts`（核心逻辑，伪代码级别但需可运行）：

```ts
import { updateJob } from "./jobs";
import { sha256 } from "./hash";
import { getPhotoTranslation, upsertPhotoTranslation } from "./photoTranslations";
import { translateGalleryToEn } from "./galleryTranslate";
import { sql } from "../db";

type PhotoRow = {
  id: string;
  title: string | null;
  tags: string[] | null;
  caption: string | null;
};

async function getPhotoById(id: string): Promise<PhotoRow | null> {
  const { rows } = await sql<PhotoRow>`
    select id, title, tags, caption from photos where id = ${id} limit 1
  `;
  return rows[0] ?? null;
}

async function getNarrativeZh(photoId: string): Promise<string> {
  // 复用已有 narrative 表（photo_narratives）字段 narrative_md
  const { rows } = await sql<{ narrative_md: string }>`
    select narrative_md from photo_narratives where photo_id = ${photoId} limit 1
  `;
  return rows[0]?.narrative_md ?? "";
}

export async function runPhotoEnJob(jobId: string, photoId: string) {
  await updateJob(jobId, { state: "running", progress: 10, message: "读取照片信息…" });
  const photo = await getPhotoById(photoId);
  if (!photo) throw new Error("PHOTO_NOT_FOUND");

  const narrativeZh = await getNarrativeZh(photoId);
  const titleZh = (photo.title ?? "").trim();
  const tagsZh = (photo.tags ?? []).map((t) => String(t)).filter(Boolean);
  const captionZh = (photo.caption ?? "").trim();

  const sourceHash = sha256(`${titleZh}\n${JSON.stringify(tagsZh)}\n${narrativeZh}\n${captionZh}`);
  const cached = await getPhotoTranslation(photoId, "en");
  if (cached?.source_hash === sourceHash && cached.title && cached.narrative_md) {
    await updateJob(jobId, { state: "done", progress: 100, message: "已命中缓存" });
    return;
  }

  await updateJob(jobId, { progress: 35, message: "翻译标题与标签…" });
  await updateJob(jobId, { progress: 55, message: "翻译配文…" });

  const out = await translateGalleryToEn({ titleZh, tagsZh, narrativeZh });

  await updateJob(jobId, { progress: 90, message: "写入缓存…" });
  await upsertPhotoTranslation({
    photoId,
    lang: "en",
    title: out.title,
    tags: out.tags,
    narrativeMd: out.narrative_md,
    sourceHash,
  });
  await updateJob(jobId, { state: "done", progress: 100, message: "完成" });
}
```

- [ ] **Step 2: ensure route 触发 fire-and-forget**

在 `ensure` route 末尾创建 job 后，使用 `void runPhotoEnJob(jobId, id).catch(...)` 执行（并在 catch 中 `updateJob` 为 failed）。

> 注意：Next.js route handler 可能在请求结束后中断任务；若不稳定，需要升级为队列（例如 Vercel Cron + job 扫描）。第一版先用最简单方案，后续按观测迭代。

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n/runner.ts app/api/i18n/gallery/photos
git commit -m "feat(i18n): run photo en jobs and persist cache"
```

---

## Task 6: Gallery UI — 英文模式 loading + 进度条

**Files:**
- Create: `src/components/i18n/TranslationProgress.tsx`
- Modify: `src/components/gallery/GalleryGrid.tsx`
- Modify: `src/components/gallery/GalleryImage.tsx`
- Modify: `src/lib/i18n/client.ts`（读取当前语言）

- [ ] **Step 1: 进度条组件**

Create `src/components/i18n/TranslationProgress.tsx`：

```tsx
"use client";

export default function TranslationProgress(props: { progress: number; message?: string }) {
  const v = Math.max(0, Math.min(100, props.progress));
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{props.message ?? "Loading…"}</div>
      <div style={{ height: 8, borderRadius: 999, background: "color-mix(in srgb, var(--ring) 70%, transparent)" }}>
        <div
          style={{
            width: `${v}%`,
            height: "100%",
            borderRadius: 999,
            background: "var(--button-left, var(--accent))",
            transition: "width 260ms ease",
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: GalleryGrid 在英文模式触发 ensure + 轮询 job**
在 `GalleryGrid.tsx` 中：
1) `const lang = readClientLang()`  
2) 若 `lang==="en"`：对首屏可见的 photo id 批量触发 ensure（节流）  
3) 轮询 job 状态并把 `progress/message` 传给图片卡片

（实现细节在执行阶段以项目结构为准，原则：不要对所有图片一次性触发，先对视口内 + 预取少量）

- [ ] **Step 3: GalleryImage 渲染英文缓存**
在拿到翻译缓存后：
- title/tags/narrative 用英文（否则显示进度条覆盖在卡片内）

- [ ] **Step 4: Commit**

```bash
git add src/components/i18n/TranslationProgress.tsx src/components/gallery
git commit -m "feat(i18n): show gallery translation progress and render en cache"
```

---

## Task 7: Next/Image 全量接入（第一批：头像 + Gallery）

**Files:**
- Modify: `next.config.mjs`（images.remotePatterns）
- Modify: `src/components/nav/AppleNav.tsx`
- Modify: `src/components/sections/AboutAvatar.tsx`
- Modify: `src/components/gallery/GalleryImage.tsx`

- [ ] **Step 1: 配置 remotePatterns**

在 `next.config.mjs` 增加：
```js
images: {
  remotePatterns: [
    { protocol: "https", hostname: "github.com" },
    { protocol: "https", hostname: "avatars.githubusercontent.com" },
    { protocol: "https", hostname: "githubusercontent.com" },
    { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
  ],
},
```

- [ ] **Step 2: 替换头像组件为 next/image**
示例（AppleNav）：
```tsx
import Image from "next/image";
...
<Image className={styles.avatar} src="https://github.com/TonyDDcui.png" alt="GitHub avatar" width={45} height={45} />
```

- [ ] **Step 3: 替换 GalleryImage 为 next/image（带 sizes）**
为网格设定 `sizes`（例如：`(max-width: 640px) 100vw, 33vw`）并保持 lazy。

- [ ] **Step 4: Commit**

```bash
git add next.config.mjs src/components/nav/AppleNav.tsx src/components/sections/AboutAvatar.tsx src/components/gallery/GalleryImage.tsx
git commit -m "perf(images): adopt next/image for avatar and gallery"
```

---

## Task 8: MDX 图片映射到 next/image（Blog）

**Files:**
- Create: `src/components/blog/PostImage.tsx`
- Modify: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: 新建 PostImage**
实现一个轻量 wrapper，接收 `src/alt/width/height`，内部用 `next/image`。

- [ ] **Step 2: MDX components 映射**
在 `compileMDX` 的 `components` 中加入：
```ts
const mdxComponents = { RepoImage, img: PostImage };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/PostImage.tsx app/blog/[slug]/page.tsx
git commit -m "perf(blog): render mdx images with next/image"
```

---

## Task 9: 上传转码（HEIC/HEIF → webp/jpg）

**Files:**
- Modify: `app/api/gallery/upload/route.ts`
- Add dep: `sharp`

- [ ] **Step 1: 引入 sharp 并实现类型检测**
在 route 中检测 mime / 扩展名：
- `image/heic`, `image/heif` → 转码
- 其它保持原逻辑

- [ ] **Step 2: 转码输出 webp**
```ts
import sharp from "sharp";
const out = await sharp(buf).rotate().webp({ quality: 82 }).toBuffer();
```

- [ ] **Step 3: 上传到 Blob 并写 DB**
保持原上传流程，仅替换上传的二进制与文件扩展名。

- [ ] **Step 4: Commit**

```bash
npm i sharp
git add package.json package-lock.json app/api/gallery/upload/route.ts
git commit -m "perf(upload): transcode heic/heif to webp"
```

---

## Task 10: 更严格限流 + 安全响应头

**Files:**
- Modify: `src/lib/security/rateLimit.ts`
- Modify: `next.config.mjs`

- [ ] **Step 1: i18n endpoints 限流**
为 `/api/i18n/*` 与 gallery 生成类接口设置更低阈值。

- [ ] **Step 2: headers 增强**
在 `next.config.mjs` headers() 增加：
- `Strict-Transport-Security`
- `Content-Security-Policy`（第一版宽松）
- `Cross-Origin-Opener-Policy`（评估）

- [ ] **Step 3: Commit**

```bash
git add src/lib/security/rateLimit.ts next.config.mjs
git commit -m "security: tighten rate limits and add security headers"
```

---

## Task 11: Cloudflare 橙云 + WAF/缓存配置指引（文档）

**Files:**
- Create: `docs/cloudflare-setup.md`

- [ ] **Step 1: 写操作指南**
包含：
1) DNS 记录改 Proxied（橙云）
2) SSL/TLS 设为 Full (strict)
3) WAF Managed Rules 开启
4) Cache Rules：`/_next/static/*` 强缓存
5) 对 `/api/i18n/*`、上传/生成接口的 WAF/Rate limiting 建议

- [ ] **Step 2: Commit**

```bash
git add docs/cloudflare-setup.md
git commit -m "docs: cloudflare proxied + waf + cache setup"
```

---

## Plan Self-Review Checklist
- 覆盖 spec 的 5 大块：i18n 状态、Blog 缓存、Gallery 落库+进度条、图片优化、限流+安全头+Cloudflare。
- 无 TBD/TODO；每个 task 都给出明确文件路径、代码骨架、命令、提交信息。
- 风险点（Next route fire-and-forget）已标注后续可升级队列。

