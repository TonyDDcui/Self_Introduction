# Gallery Story Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 调整顶栏头像尺寸；把相册详情页改为“图 + AI 文案”同一蒙版框的纵向图文流；Home Hero 标题改为“箫”。

**Architecture:** UI 侧新增一个相册详情页专用的纵向图文流组件；数据侧为每张照片生成并缓存 AI 文案（photo_id 维度），优先 tags+title/caption，并尝试附带图片 URL 进行多模态输入，失败则回退纯文本。

**Tech Stack:** Next.js App Router、NextAuth、Vercel Postgres（Neon）、fetch、CSS Modules

---

## 文件结构与改动面

**Modify**
- `src/components/nav/AppleNav.module.css`（头像尺寸）
- `src/components/nav/AppleNav.tsx`（同步 width/height）
- `src/components/sections/Hero.tsx`（标题改字）
- `scripts/db/init.sql`（新增 photo_narratives 表）
- `app/gallery/albums/[slug]/page.tsx`（用新图文流替换 GalleryGrid）
- `src/lib/ai/edgefn.ts`（支持多模态 content + 统一错误输出）

**Create**
- `src/lib/gallery/photoNarratives.ts`（按 photo_id 获取/生成/缓存文案）
- `src/components/gallery/AlbumStoryFeed.tsx`（相册详情页图文流）
- `src/components/gallery/AlbumStoryFeed.module.css`

---

## Task 1: 顶栏头像稍微变大

**Files**
- Modify: `src/components/nav/AppleNav.module.css`
- Modify: `src/components/nav/AppleNav.tsx`

- [ ] Step 1: 调整 CSS 头像尺寸（26 → 30）

```css
/* src/components/nav/AppleNav.module.css */
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  /* 其余保持不变 */
}
```

- [ ] Step 2: 同步 `<img width/height>`

```tsx
/* src/components/nav/AppleNav.tsx */
<img
  className={styles.avatar}
  src="https://github.com/TonyDDcui.png"
  alt="GitHub avatar"
  width={30}
  height={30}
/>
```

- [ ] Step 3: 本地验证

Run: `npm run build`  
Expected: build success

- [ ] Step 4: Commit

```bash
git add src/components/nav/AppleNav.module.css src/components/nav/AppleNav.tsx
git commit -m "ui(nav): enlarge avatar slightly"
```

---

## Task 2: Home Hero 标题改为“箫”

**Files**
- Modify: `src/components/sections/Hero.tsx`

- [ ] Step 1: 修改标题文案

```tsx
// src/components/sections/Hero.tsx
<h1 className={styles.title}>箫</h1>
```

- [ ] Step 2: 本地验证

Run: `npm run build`  
Expected: build success

- [ ] Step 3: Commit

```bash
git add src/components/sections/Hero.tsx
git commit -m "ui(home): update hero title"
```

---

## Task 3: DB — 新增 photo_narratives 表（按照片缓存 AI 文案）

**Files**
- Modify: `scripts/db/init.sql`

- [ ] Step 1: 在 init.sql 追加建表

```sql
-- scripts/db/init.sql
create table if not exists photo_narratives (
  photo_id text primary key,
  album_slug text,
  narrative_md text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_photo_narratives_album_slug on photo_narratives (album_slug);
```

- [ ] Step 2: Commit

```bash
git add scripts/db/init.sql
git commit -m "db: add photo_narratives cache table"
```

---

## Task 4: AI Client — 支持多模态 content（失败回退）

**Files**
- Modify: `src/lib/ai/edgefn.ts`

- [ ] Step 1: 扩展 message content 类型（支持 text + image_url）

实现策略：
- `EdgeFnChatMessage["content"]` 支持 `string | Array<{type:'text', text:string} | {type:'image_url', image_url:{url:string}}>`
- 仍请求 `${baseUrl}/chat/completions`
- `model` 必填：`process.env.EDGEFN_MODEL || "DeepSeek-R1-Distill-Qwen-14B"`

（代码以现有文件为准逐段修改）

- [ ] Step 2: 保持错误信息可读（HTTP + body 前 200 字符）

- [ ] Step 3: Commit

```bash
git add src/lib/ai/edgefn.ts
git commit -m "feat(ai): support multimodal edgefn messages"
```

---

## Task 5: 数据层 — photo_id 维度的 getOrCreate（含多模态尝试+回退）

**Files**
- Create: `src/lib/gallery/photoNarratives.ts`

- [ ] Step 1: 实现 `ensureTable()`（create table if not exists）兜底
- [ ] Step 2: 实现批量读取 `getPhotoNarratives(photoIds: string[])`
- [ ] Step 3: 实现生成函数 `createPhotoNarrative(photo: PhotoRow, albumSlug: string)`
  - prompt 输入：tags + title/caption
  - 若 photo.blob_url 存在：先走多模态（content array），如果返回 400/InvalidRequestBody 再回退纯文本
- [ ] Step 4: 实现 `getOrCreatePhotoNarratives(photos: PhotoRow[], albumSlug: string, debug?: boolean)`
  - 返回 `Map<photo_id, narrative>` + debug（仅管理员）
  - 对缺失项逐张生成并 upsert

- [ ] Step 5: Commit

```bash
git add src/lib/gallery/photoNarratives.ts
git commit -m "feat(gallery): cache ai narratives per photo"
```

---

## Task 6: UI — 相册详情页“图文同卡片”的纵向流组件

**Files**
- Create: `src/components/gallery/AlbumStoryFeed.tsx`
- Create: `src/components/gallery/AlbumStoryFeed.module.css`

- [ ] Step 1: 设计组件 API

```ts
type AlbumStoryItem = {
  id: string;
  src: string;
  alt: string;
  narrative?: string | null;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
};
```

- [ ] Step 2: 样式要点
  - 外层一个蒙版框（border/radius/background/shadow）
  - item 之间用“文案段落”形成自然间隔（无额外分割线）
  - 文案纯文本样式（Apple-ish：15px、紧字距、secondary color）

- [ ] Step 3: Commit

```bash
git add src/components/gallery/AlbumStoryFeed.tsx src/components/gallery/AlbumStoryFeed.module.css
git commit -m "ui(gallery): album story feed component"
```

---

## Task 7: 页面改造 — `/gallery/albums/[slug]` 用图文流替换网格

**Files**
- Modify: `app/gallery/albums/[slug]/page.tsx`

- [ ] Step 1: 获取相册 photos 后，调用 `getOrCreatePhotoNarratives` 得到每张图的文案
- [ ] Step 2: 移除 `GalleryGrid` 渲染，替换为 `AlbumStoryFeed`
- [ ] Step 3: 不再显示 photo.title/photo.caption/category/tags（仅用 AI narrative）
- [ ] Step 4: 管理员可见 debug：若某张图 narrative 缺失且生成失败，显示错误摘要（不对访客展示）

- [ ] Step 5: 本地验证

Run: `npm run build`  
Expected: build success

- [ ] Step 6: Commit

```bash
git add app/gallery/albums/[slug]/page.tsx
git commit -m "feat(gallery): render album as image+ai text feed"
```

---

## Task 8: 总集成检查与推送

- [ ] Step 1: 全量 build

Run: `npm run build`  
Expected: success

- [ ] Step 2: Push

```bash
git push origin main
```

---

## 自检（针对本计划）

- 覆盖 spec：
  - 头像变大 ✅ Task 1
  - Hero 改“箫” ✅ Task 2
  - 相册详情页图文同卡片 + 不显示元信息 ✅ Task 6 + Task 7
  - AI 文案按图缓存 + tags+title/caption + 多模态尝试回退 ✅ Task 4 + Task 5

- Placeholder 扫描：无 TBD/TODO；关键代码点在各 Task 中明确到文件路径与提交命令。

---

## 执行方式选择

计划已保存到：`docs/superpowers/plans/2026-04-09-gallery-storyfeed-implementation-plan.md`

两种执行方式：
1. **Subagent-Driven（推荐）**：我按 Task 派发子代理逐个实现，你逐步验收
2. **Inline Execution**：我在当前会话里直接按 Task 顺序实现并频繁提交

