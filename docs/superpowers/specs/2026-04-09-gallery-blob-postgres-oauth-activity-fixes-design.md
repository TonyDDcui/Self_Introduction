# Gallery：Blob + Postgres + GitHub OAuth 上传（仅本人） & Activity 修复 — 设计稿

日期：2026-04-09  
项目：Self_Introduction（Next.js 14 App Router，部署 Vercel）  
范围：线上问题修复（Activity / Gallery）+ 新功能（移动端上传入口 + 管理）  

## 0. 结论（本轮决策）

1) Gallery 展示：**公开**  
2) 上传权限：**仅 `TonyDDcui`**，通过 **GitHub OAuth 登录**后可见上传入口  
3) 图片存储：**Vercel Blob**（先落地最快）  
4) 元数据存储：**Vercel Postgres**  
5) 预留未来迁移：抽象 `StorageProvider`，后续可换 Cloudflare R2（仅替换存储适配层）  

## 1. 当前线上问题（cuizhexiao.xyz）

### 1.1 Activity 贡献日历无法获取数据

现象：
- 首页 Activity 提示“暂时无法获取 GitHub 贡献数据”
- 生产接口 `/api/github/contributions` 返回：`{"ok":false,"reason":"github_error"}`

最可能原因：
- `GITHUB_TOKEN` 在 Vercel 环境变量中失效/撤销/权限不足（401/403）
- 或 `GITHUB_USERNAME` 未配置/错误
- 当前服务端错误返回信息不够可诊断（只返回 github_error）

### 1.2 Gallery 无图片

现象：
- `/gallery` 显示“当前仓库未检测到可用图片（png/jpg/jpeg/webp/gif/svg）”

原因：
- 目前 Gallery 数据源是 `repo-images-manifest.json`（仓库扫描），仓库无图片 → manifest 为空 → 必然空

结论：
- 若要支持“手机上传照片”，Gallery 必须从“仓库扫描”升级为“对象存储 + 数据库”。

## 2. 目标与非目标

### 2.1 目标

1) **修复 Activity**：让贡献日历在生产恢复，并在失败时给出可诊断原因  
2) **Gallery 上线可用内容系统**：
   - 公开展示照片流
   - 支持标题/配文（可选）、分类与标签
   - 支持排序（默认最新优先；预留手动排序）
3) **移动端上传入口**：
   - 在手机上能上传照片到 Gallery
   - 仅 `TonyDDcui` 登录后可见
   - 上传流程包含：选择图片 + 填标题/配文 + 选分类/填标签
4) **为未来 R2 迁移预留接口**（不在本轮真正接入 R2）

### 2.2 非目标（本轮不做）

- 不开放“任何人都可上传”（避免垃圾内容、成本、风控复杂度）
- 不做复杂的图片编辑器（裁剪/滤镜）与 EXIF 解析（可作为后续增强）
- 不做复杂的审核队列（因为上传仅本人）
- 不做多用户权限系统（只识别一个 GitHub 用户）

## 3. 架构概览

### 3.1 数据流（Gallery）

**展示：**
1) `/gallery` 页面从 Postgres 读取 `photos` 列表（只取 `visibility='public'`）
2) 以 grid 瀑布流/网格展示缩略图（图片 URL 来自 Blob）

**上传：**
1) 用户在 `/gallery` 点击“添加照片”（仅登录且为 TonyDDcui 才显示）
2) 前端跳转到 `/gallery/upload`
3) 页面先校验会话（GitHub OAuth），失败则引导登录
4) 选择文件 → 走 Vercel Blob 的 Client Upload 流程上传图片
5) 上传成功后，写入 Postgres `photos` 记录（含 title/caption/category/tags/blobUrl 等）
6) 返回 Gallery 并看到新照片

### 3.2 认证（GitHub OAuth）

采用 `next-auth`（Auth.js）在 Next.js App Router 下实现 GitHub Provider：
- session 策略：JWT（默认即可）
- 上传入口校验：
  - 需要 `session.user.name` 或 `session.user.login`（取决于 provider 回传）匹配 `TonyDDcui`
  - 兼容：通过 `session.user.email` 做兜底判断（如果 GitHub email 可用）

> 备注：只允许单账号的好处是：逻辑极简、风险可控、无需后台复杂权限。

### 3.3 存储抽象（为 R2 迁移预留）

定义接口：

```ts
export type PutResult = { url: string; pathname: string };

export interface StorageProvider {
  putImage(params: { file: File | Blob; filename: string; contentType: string }): Promise<PutResult>;
  delImage(pathname: string): Promise<void>;
}
```

本轮实现：
- `VercelBlobProvider`：基于 `@vercel/blob` 实现

未来实现（不在本轮）：
- `R2Provider`：S3 兼容客户端（AWS SDK / Cloudflare Workers）实现

## 4. 数据库设计（Vercel Postgres）

### 4.1 photos 表

字段（建议）：
- `id` UUID PRIMARY KEY
- `blob_url` TEXT NOT NULL
- `blob_pathname` TEXT NOT NULL（用于删除/替换）
- `title` TEXT NULL
- `caption` TEXT NULL
- `category` TEXT NULL
- `tags` TEXT[] NOT NULL DEFAULT '{}'
- `visibility` TEXT NOT NULL DEFAULT 'public'  （public/private）
- `sort_order` INT NULL（手动排序用，NULL 时按时间）
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `published_at` TIMESTAMPTZ NOT NULL DEFAULT now()

索引建议：
- `idx_photos_published_at` on `(published_at desc)`
- `idx_photos_visibility` on `(visibility)`
- 可选：`GIN(tags)` 以支持标签检索

### 4.2 初始化方式

提供一个 SQL 初始化脚本（例如 `scripts/db/init.sql`），并在 README/DEPLOYMENT 说明如何在 Vercel Postgres 执行。

## 5. 路由与页面/组件

### 5.1 Activity 修复

现有文件：
- `app/api/github/contributions/route.ts`
- `src/lib/github/contributions.ts`

改动：
1) `getGithubContributionCalendar()` 返回更细的 reason：
   - `missing_env`
   - `github_401`（token 无效/撤销）
   - `github_403`（权限不足）
   - `github_rate_limit`
   - `github_error`（其他）
2) 在服务端打印可诊断信息（不返回 token）：
   - GitHub status code
   - GraphQL errors（message）
3) Activity UI 文案按 reason 给出更友好提示（例如“请检查 Vercel 环境变量 GITHUB_TOKEN 是否有效”）

### 5.2 Gallery 展示页

现有文件：
- `app/gallery/page.tsx`（当前是 client + manifest 扫描，且仍在用旧 token `--bg-light`）

改动：
- 重写为 server-first（优先 server component）：
  - 使用 Claude tokens（`--bg-page / --surface-1 / --text-primary` 等）
  - 从 Postgres 查询 photo 列表
  - grid 展示 + 轻量 hover
- “添加照片”入口：
  - 只在 `session.user` 为 `TonyDDcui` 时显示
  - 移动端也要显示（按钮固定在右下角或顶部右侧均可）

### 5.3 上传页（移动端友好）

新增：
- `app/gallery/upload/page.tsx`（或 client component + server action）

要求：
- 未登录：显示 GitHub 登录按钮
- 已登录但非 TonyDDcui：显示“无权限”
- 上传表单字段：
  - 图片文件（必填）
  - 标题（可选）
  - 配文（可选）
  - 分类（可选，单选/自由输入）
  - 标签（可选，逗号分隔）
- 上传后跳转回 `/gallery` 并高亮最新照片（可选）

## 6. 需要新增/确认的 Vercel 配置（环境变量）

### 6.1 Activity
- `GITHUB_USERNAME=TonyDDcui`
- `GITHUB_TOKEN=...`（用于 GitHub GraphQL，建议 fine-grained token 只给必要权限；如果频繁撤销，Activity 会失效）

### 6.2 GitHub OAuth（next-auth）
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXTAUTH_SECRET`（随机字符串）
- `NEXTAUTH_URL`（生产域名，通常 Vercel 自动处理，但建议显式设置）

### 6.3 Vercel Blob
- `BLOB_READ_WRITE_TOKEN`（Vercel 自动提供/可在 Storage 设置中获取）

### 6.4 Vercel Postgres
- 使用 Vercel 提供的 Postgres 连接环境变量（由集成自动注入）

## 7. 安全与成本控制

1) 上传仅限 `TonyDDcui`：显著降低滥用风险  
2) 上传文件大小限制：建议前端限制（例如 10–20MB），后端再二次校验  
3) 仅允许图片 MIME：`image/jpeg|png|webp|gif`（svg 可选，建议谨慎）  
4) Blob 设为 public（便于公开展示），但上传必须经过鉴权接口签发（client upload token）  

## 8. 验收标准（Definition of Done）

1) `cuizhexiao.xyz` 首页 Activity 恢复贡献日历；失败时提示清晰且可定位原因  
2) `cuizhexiao.xyz/gallery` 不再显示“无图片”，至少可以展示 1 张由 Blob+DB 驱动的照片（测试数据）  
3) 手机端访问 `/gallery`，登录后可进入上传页并成功上传  
4) 上传后能填写标题/配文/分类/标签，刷新后仍能看到并正确展示  
5) `npm test` 与 `npm run build` 通过

