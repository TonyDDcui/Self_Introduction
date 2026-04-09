# 安全防护 + 性能提速（Design）

日期：2026-04-09  
项目：Self_Introduction（Next.js / Vercel / Neon Postgres / Vercel Blob）

## 背景与约束

- 当前 Vercel 账号为 **Hobby**，Firewall 面板中 **Bot Protection / 自定义规则 / Rate Limiting** 等能力需要升级 Pro 才能长期启用。
- Firewall 中可用 **Attack Mode**（临时 challenge）作为应急手段，但不适合常开。
- 因此本轮以 **代码侧防护** 为主：重点保护 `app/api/*`（上传/删除/鉴权等），并补齐基础安全响应头；对“刷页面/爬虫”主要通过缓存与低成本拦截来降低伤害。

## 目标

1. **防攻击（偏严格）**
   - 全覆盖关键 API：上传、删除、图库写接口、鉴权相关接口。
   - 速率限制（429）+ 管理员（uploader）豁免（大幅放宽阈值）。
   - CSRF/跨站滥用：对所有非 GET 接口做 `Origin/Referer` 同源校验（可配置）。
   - 限制请求体（Content-Type / size / JSON 解析失败）并快速失败。
2. **性能提速**
   - 降低 Postgres 查询频率：对公共照片列表/相册汇总等做服务端缓存与 revalidate。
   - 降低相册首次打开的“生成文案”阻塞：限制单次请求生成数量，避免长尾卡死。
   - 图片加载策略：首屏更积极预加载，其余懒加载与合理 `sizes`。
3. **UI 小调整**
   - 顶栏头像调整到 **约 45px**（并微调间距避免挤压）。

## 速率限制策略（你选择 A：极严）

> 单位：每 IP / 每分钟（窗口 60s）。超限返回 429，并带 `Retry-After`。

### 页面请求（仅用于“非常轻量”的保护）
- 页面：60/min
  - 注：不依赖 DB（避免 Edge middleware 访问 DB 的兼容风险），仅做最简单的 bot/异常 UA 拦截 + 让缓存更有效。

### API 请求（核心）
- 通用 API：20/min
- 上传/删除：6/min
- 管理员（uploader 登录）豁免：
  - 通用 API：60/min
  - 上传/删除：60/min

## 架构设计

### 1) API 级别限流（Node.js runtime + Postgres 存储）

在 `src/lib/security/` 下新增限流模块，供每个 API route 复用：

- 生成限流 key：
  - `ip`：优先 `x-forwarded-for` 第一个 IP；缺失则降级为 `unknown`
  - `routeKey`：例如 `api:gallery:upload`、`api:gallery:delete`、`api:auth` 等
  - `actor`：若 uploader 登录则额外标记 `actor=uploader`（用于豁免/提高阈值）

- 数据表（Neon / Postgres）：
  - `rate_limits`
    - `key text primary key`
    - `count int not null`
    - `reset_at timestamptz not null`
    - `updated_at timestamptz not null default now()`

- 原子更新逻辑（单条 UPSERT）：
  - 若 `now() > reset_at`：重置为 `count=1`，`reset_at=now()+window`
  - 否则：`count=count+1`
  - 返回最新 `count/reset_at` 判断是否超限

### 2) CSRF/跨站滥用防护（同源校验）

对所有非 GET/HEAD 请求：
- 读取 `Origin`（优先）或 `Referer`
- 解析 host，与请求 `Host` 必须一致
- 不一致：返回 403（`forbidden_origin`）

说明：
- 该规则对“从你网页发起的 fetch”不会造成影响（浏览器会带 Origin）。
- 若未来需要允许外部客户端调用，可通过环境变量允许额外 host 白名单（本轮默认关闭，偏严格）。

### 3) 基础安全响应头（next.config.mjs）

对全站添加：
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

说明：
- 本轮不强推 CSP（容易误伤 Next.js 脚本/样式与 Vercel Blob 图片），后续可增量加。

## 性能提速设计

### 1) 缓存公共照片列表

将 `listPublicPhotos()` 包一层 `unstable_cache`：
- cache key：`gallery:publicPhotos:v1`
- revalidate：例如 60s（可调）
- 写接口（上传/删除）成功后触发 revalidate tag（或以“时间窗口”简化）

说明：
- Gallery 页面即便是 dynamic（因为要读 session），也可以复用缓存结果来减少 DB 压力。

### 2) 限制单次 AI 文案生成数量

相册首次打开时若缺失大量 photo narrative：
- 单次请求最多生成 N 条（建议 3~5）
- 剩余部分先不生成（或展示为空），用户刷新/滚动后再补齐
- 目的：避免首访卡顿与 API 被“自己”打爆

### 3) 图片加载

保持现有 `GalleryImage` 组件使用策略基础上：
- 相册详情页首张图：优先加载（priority 或更积极 preload）
- 其他图片：lazy + 合理 `sizes`

## 需要修改/新增的文件（预估）

**新增**
- `src/lib/security/rateLimit.ts`（Postgres 滑窗限流）
- `src/lib/security/requestGuards.ts`（ip 获取、origin 校验、通用辅助）

**修改**
- `app/api/gallery/upload/route.ts`
- `app/api/gallery/photos/[id]/route.ts`
- `app/api/gallery/photos/route.ts`（POST 写库）
- `app/api/gallery/blob/route.ts`
- `app/api/auth/[...nextauth]/route.ts`（可选：仅对 POST/回调相关做轻限流）
- `next.config.mjs`（安全响应头）
- `src/lib/gallery/photos.ts`（缓存封装）
- `src/components/nav/AppleNav.module.css` + `src/components/nav/AppleNav.tsx`（头像 45px）

## 验收标准

1. 未登录/非 uploader 对上传/删除接口仍为 401/403，且对高频请求能稳定返回 429。
2. uploader 登录后批量上传不容易被误伤（阈值提升生效）。
3. 跨站来源（Origin 不同）对写接口返回 403。
4. Gallery 页面加载 DB 次数显著下降（缓存生效）。
5. 顶栏头像约 45px，布局不挤压、不抖动。

