# i18n + Gallery 翻译缓存 + 国内访问优化（Cloudflare）设计

日期：2026-04-10  
状态：已与用户确认（待实现）  

## 1. 目标与非目标

### 1.1 目标
1) **全站中英切换**（仅 zh/en），并且“英文内容可缓存”，避免每次打开都消耗 token。  
2) **Gallery 英文模式内容完整**：UI + 照片标题 + 标签 + 配文（narrative）均翻译，并缓存。  
3) **首次需要生成英文时**：前端显示 **loading + 进度条**，生成完成后正常展示英文。  
4) **国内访问速度优化**：
   - Next/Image 全量接入
   - 上传图片转码（HEIC/HEIF → webp/jpg）
   - 更严格 rate limit + 安全响应头
   - 部署侧 WAF（Cloudflare）

### 1.2 非目标（本阶段不做）
- 多语言（仅 zh/en）
- “按需自动翻译并即时展示”作为唯一模式（保留手动同步/预生成能力，避免 token 被刷）
- 将站点“完全交由 AI 托管”（AI 用于生成/翻译；加速与防护由 Cloudflare/Vercel/Next.js 实现）

## 2. 现状摘要（已存在能力）
1) 顶栏已加入语言切换按钮（cookie：`site_lang`）。  
2) Blog 支持英文缓存目录：`content/blog/en/*.mdx`；脚本 `npm run sync:en` 可用 DeepSeek-V3.2 生成并增量更新。  
3) EdgeFn 网关已用于大模型调用（模型：DeepSeek-V3.2）。  
4) Gallery 目前相册归类已改为按照片 Title 前缀优先。

## 3. 关键决策
1) **Blog 翻译缓存落仓库文件**：`content/blog/en/`（可 git 管理、可回滚、部署稳定）。  
2) **Gallery 翻译缓存落 Postgres**：避免仓库膨胀，适合动态上传与频繁变更。  
3) 英文缺失/变更时：**显示 loading + 进度条**；完成后展示英文（不直接回退中文）。

## 4. i18n 架构设计

### 4.1 语言状态
- cookie：`site_lang=zh|en`
- `<html lang=... data-lang=...>`：用于 SSR/SEO/样式钩子
- 切换：前端写 cookie → `location.reload()` 让 Server Components 统一重渲染

### 4.2 UI 文案
将 UI 文案从 `strings.ts` 逐步迁移为：
- `src/i18n/zh.json`
- `src/i18n/en.json`
并提供 `t(lang, key)` 工具函数（服务端与客户端均可用）。

## 5. Blog 英文缓存（文件）

### 5.1 目录结构
- 中文：`content/blog/*.mdx`
- 英文：`content/blog/en/*.mdx`

### 5.2 同步脚本（手动/CI）
- `npm run sync:en`
  - 输入：中文 mdx
  - 输出：英文 mdx（润色风格）
  - 增量：`source_hash` 不变则跳过
  - 调用模型：DeepSeek-V3.2（通过 EdgeFn 网关）

## 6. Gallery 英文缓存（Postgres）

### 6.1 数据模型
新增表：`photo_translations`
- `photo_id text not null`
- `lang text not null`（目前只允许 `en`）
- `title text`
- `tags jsonb`（英文 tags 数组）
- `narrative_md text`（英文配文）
- `source_hash text not null`（从中文源字段计算）
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- 主键：`(photo_id, lang)`
- 索引：`(lang, updated_at)`

### 6.2 source_hash 计算
`source_hash = sha256( title_zh + "\n" + JSON.stringify(tags_zh) + "\n" + narrative_zh + "\n" + caption_zh )`
- 任一字段变更 → 触发重新翻译

### 6.3 API：确保英文缓存（异步任务）
新增端点（示意）：
1) `POST /api/i18n/gallery/photos/:id/en/ensure`
   - 权限：公共可读（或仅登录），但必须 **强限流** 防刷
   - 返回：`{ ok: true, jobId }`
2) `GET /api/i18n/jobs/:jobId`
   - 返回：`{ state, progress, message, result?: { photoId } }`

任务状态：
- `queued` → `running` → `done` / `failed`

### 6.4 进度条设计
将任务拆成可解释阶段并映射进度：
- 0–20：读取源照片（zh）+ 校验
- 20–50：翻译 title/tags
- 50–85：翻译 narrative（最长）
- 85–100：写入 DB + 完成

### 6.5 翻译提示词（DeepSeek-V3.2，润色）
约束：
- 不输出 thinking
- 只输出 JSON（便于解析与幂等）
输出结构：
```json
{ "title": "...", "tags": ["..."], "narrative_md": "..." }
```

### 6.6 并发控制
- 同一 `photo_id+lang` 同时只允许一个任务运行：
  - DB 级锁/唯一任务表（推荐）或 `pg_advisory_lock`
- 重复请求：若已有运行中任务，直接返回同一 `jobId`

### 6.7 失败策略
- 英文模式下若任务失败：
  - UI 显示失败状态 + 重试按钮
  - 不自动回退中文（符合“loading→完成后正常显示英文”的体验要求）

## 7. 性能与图片优化

### 7.1 Next/Image 全量接入
- 将关键 `<img>` 替换为 `next/image`
- MDX 内图片：通过组件映射统一替换（保留现有 `RepoImage`）
- 配置 `next.config.mjs`：
  - `images.remotePatterns`（GitHub 头像、Vercel Blob 域名等）
  - 合理 `sizes` / `priority` / lazy loading

### 7.2 上传图片转码（HEIC/HEIF → webp/jpg）
上传流程调整：
1) 接收文件
2) 若为 HEIC/HEIF：服务端转码为 webp（优先）或 jpg
3) 上传转码后的文件到 Blob
4) DB 保存新 URL / pathname

实现建议：
- 使用 `sharp` 进行转码（注意运行环境对 heif 的支持）
- 先做“单份转码输出”，后续可扩展为多尺寸变体（480/960/1600）

## 8. 安全：rate limit + 安全响应头

### 8.1 限流策略（更严格）
重点接口：
- 上传：`/api/gallery/upload`
- 生成类：`/api/gallery/photos/*/narrative/regenerate`
- 翻译类：`/api/i18n/*`

建议：
- IP + session 双 key
- 对翻译 ensure 接口：更低阈值（例如 30/min），并对失败/异常 IP 更严格

### 8.2 安全响应头
在 Next 中统一增加：
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- CSP（先宽后严，避免阻断 Next 资源）

## 9. Cloudflare（国内加速 + WAF）

### 9.1 前提：DNS 记录改为 Proxied（橙云）
用户确认愿意从 DNS only → Proxied。

### 9.2 推荐配置
- SSL/TLS：Full (strict)
- WAF：
  - Managed Rules 开启
  - 自定义规则：对 `/api/i18n/*`、上传/生成接口更严格（挑战/限速/地理策略视需求）
- 缓存：
  - `/_next/static/*` 强缓存
  - 图片/静态资源缓存
  - HTML 缓存谨慎（避免动态内容错缓存）

## 10. 实施顺序（与用户确认的优先级）
1) Gallery 翻译任务与进度条（DB + API + UI）
2) Next/Image 全量接入（先头像/Blog/Gallery）
3) 上传图片转码（HEIC/HEIF）
4) 安全头 + 更严格限流
5) Cloudflare Proxied + WAF/缓存配置（需要用户在控制台操作，按文档执行）

## 11. 验收标准（DoD）
- 英文模式下：
  - Blog 与 Home 文案正确切换
  - Gallery 的 title/tags/narrative 有英文缓存时直接展示
  - 英文缺失时出现 loading + 进度条，完成后展示英文
  - 反复刷新不会重复调用模型（命中缓存）
- 性能：
  - 关键页面 LCP 改善（Next/Image）
  - HEIC 上传后可正常展示（转码）
- 安全：
  - 高风险 API 限流生效
  - 基础安全响应头生效
  - Cloudflare 橙云代理后 WAF 规则可用（按步骤完成）

