# Project Plan — cuizhexiao.xyz（静态站 + FastAPI + WordPress + 本地模型）

> 本文用于让任何工程师/模型在**无上下文**情况下理解项目的目标、架构、业务逻辑与落地步骤。  
> 站点域名：`https://cuizhexiao.xyz`  
> 运行环境：阿里云 ECS（Ubuntu），Nginx，Docker Compose。  

---

## 1. 项目目标（Goals）

### 1.1 总目标
在同一台 ECS 上构建一个面向国内外用户的个人站点与 AI 产品雏形，满足：
- **内容**：WordPress 继续作为博客系统，挂载到 `/blog/`
- **产品/功能**：由 FastAPI 提供统一后端能力（鉴权、订阅、用量、AI 网关、管理后台 API）
- **前端**：根路径 `/` 使用 `Self_Introduction` 仓库的**静态版**站点（index.html + css + js），通过调用 `/api/*` 实现登录与 AI 使用
- **AI 模型**：在 ECS 本地运行，采用 **Ollama** 作为模型服务，优先使用 **OpenAI 兼容接口**（便于生态接入与后续计费/统计）

### 1.2 业务目标（MVP）
1) 登录（大厂逻辑）：
   - 支持 **GitHub / Google / WeChat（开放平台网站应用扫码）**
   - 开放注册：任何用户都可登录创建账号
   - 只有管理员可访问“订阅/用量/用户管理”等全业务面板
2) AI 使用门槛：
   - **必须登录**才能使用 AI
   - 免费策略：**每天免费 5 次**（先按“请求次数”计费 A）
   - 超额后提示订阅（第一期不接真实支付，管理员手动开通订阅）
3) 订阅（第一期手动开通，后续可接支付）：
   - 用户达到免费额度后显示“需要订阅”
   - 管理员后台可为用户开通/停用订阅
4) 计费演进：
   - **阶段 A（先做）**：按“请求次数”计费
   - **阶段 B（后做）**：按 token/字数计费（更接近商业化）

---

## 2. 站点分级与路由（Information Architecture）

### 2.1 路由分级（域名 → 一级路径）
`cuizhexiao.xyz` 下的一级分区：
- `/`：静态站（Self_Introduction 静态版）
- `/api/`：FastAPI（认证、订阅、用量、AI 网关、管理 API）
- `/blog/`：WordPress（Docker），Nginx 反代

### 2.2 关键约束
- 静态站不是 SPA：静态站 Nginx 建议 `try_files ... =404`（避免错误路径返回 200）
- `/api/` 为后端网关入口：OAuth 回调与 AI 调用都走 `/api/*`

---

## 3. 系统架构（Architecture）

### 3.1 组件
1) **Nginx（入口网关）**
   - 托管静态站（`/`）
   - 反代 FastAPI（`/api/`）
   - 反代 WordPress（`/blog/`）
2) **FastAPI（统一后端服务）**
   - OAuth 登录（GitHub/Google/WeChat）
   - 会话管理（HttpOnly Cookie + Access/Refresh）
   - 用户体系（user/identity）
   - 用量限制（每日免费 5 次）
   - 订阅权益（手动开通）
   - AI 网关（鉴权 + 限流 + 审计 + 转发到 Ollama）
   - 管理后台 API（仅 admin）
3) **Postgres（业务数据库）**
   - 存用户、身份绑定、refresh token、订阅状态、用量数据等
4) **Ollama（本地模型服务）**
   - 提供本地推理能力
   - FastAPI 通过 OpenAI 兼容方式接入（优先）
5) **WordPress（内容系统）**
   - 继续使用 docker compose 的 WordPress + DB
   - 挂载在 `/blog/`（与主站功能解耦）

### 3.2 核心链路（请求流）
**登录：**
静态站 → `/api/auth/{provider}/login` → 第三方授权 → `/api/auth/{provider}/callback` → FastAPI 建立会话（cookie）→ 静态站调用 `/api/me` 获取用户态

**AI 调用：**
静态站 → `/api/ai/chat`（或 `/api/ai/chat/stream`）→ FastAPI（鉴权/订阅/额度/限流）→ 转发到 Ollama → 返回结果

---

## 4. 身份认证与权限（Auth & RBAC）

### 4.1 登录方式（Providers）
- GitHub OAuth
- Google OAuth
- WeChat OAuth（微信开放平台：网站应用扫码）

### 4.2 账号体系（大厂“统一账号 + 多身份绑定”）
一个用户（user）可绑定多个第三方身份（identity）：
- user：站内账户
- identity：第三方账号（github/google/wechat）映射到同一个 user

### 4.3 管理员识别规则（Admin）
管理员判定采用“白名单”最稳：  
- 当 GitHub 登录用户名命中 `TonyDDcui` 时，赋予 `role=admin`
- 其余用户默认 `role=user`

> 备注：后续可扩展 Google 邮箱白名单、微信 openid 白名单，但 MVP 优先以 GitHub 用户名为准。

### 4.4 会话策略（你已选）
使用 **HttpOnly Cookie + Access/Refresh**：
- Access Token：短期（例如 15 分钟）
- Refresh Token：长期（例如 30 天），落库可吊销
- 支持能力：退出登录、吊销 refresh、（后续）退出所有设备

---

## 5. 订阅与用量（Subscription & Usage）

### 5.1 免费额度（阶段 A）
- 规则：登录用户 **每天免费 5 次**
- 计数维度：`user_id + date(YYYY-MM-DD)`
- 超额：返回明确错误（建议 HTTP 402 + `{code:"SUBSCRIPTION_REQUIRED"}`）

### 5.2 订阅逻辑（第一期手动开通）
订阅的最小闭环：
- 用户超额后看到订阅引导页面（静态页 + 调 API）
- 管理员在管理后台为用户开通订阅（`status=active`）
- 订阅 active 用户：更高额度或无限（MVP 可先设为无限）

### 5.3 计费演进（阶段 B）
后续升级为 token/字数计费：
- 记录每次请求的 prompt/completion tokens（若模型接口支持）
- 用量表升级为事件表（usage_events）
- 支持月度额度、套餐差异、精细化限流

---

## 6. AI 网关与模型服务（AI Gateway）

### 6.1 模型服务选择
- 本地模型：**Ollama**
- 接入协议：优先 **OpenAI 兼容接口**（对接成本最低、生态最成熟）

### 6.2 AI API 形态
阶段 A（先做）：
- 非流式：`POST /api/ai/chat`

阶段 B（后做）：
- 流式 SSE：`POST /api/ai/chat/stream`

### 6.3 网关职责（FastAPI）
每次 AI 请求必须经过：
1) 登录校验（无登录直接拒绝）
2) 订阅/额度校验（免费 5 次/天 or 订阅 active）
3) 限流（例如每分钟请求数、并发限制）
4) 记录审计（user_id、时间、耗时、状态码、错误原因）
5) 转发到 Ollama 并返回

---

## 7. 管理后台（Admin Console）

### 7.1 形态
第一期：管理后台网页（仅管理员可见）
- 页面：`/admin`（静态站提供 UI）
- 数据：通过调用 `/api/admin/*` 获取与操作

### 7.2 功能清单（MVP）
- 用户列表：注册时间、绑定 provider、最后登录
- 订阅管理：为指定 user 开通/停用订阅
- 用量查看：按天查看某用户已使用次数（阶段 A）

---

## 8. 数据模型（Postgres）（MVP 建议表）

> 具体字段可在实现阶段细化，MVP 最少需要以下实体。

1) `users`
   - `id` (pk)
   - `role` (`admin|user`)
   - `created_at`, `last_login_at`
2) `identities`
   - `id` (pk)
   - `user_id` (fk)
   - `provider` (`github|google|wechat`)
   - `provider_user_id`（github id / google sub / wechat openid）
   - `email`（可空）, `username`（可空）, `avatar_url`（可空）
3) `refresh_tokens`
   - `id` (pk)
   - `user_id` (fk)
   - `token_hash`
   - `expires_at`
   - `revoked_at`（可空）
4) `subscriptions`
   - `user_id` (pk/fk)
   - `plan` (`free|pro`)
   - `status` (`none|active|expired|canceled`)
   - `started_at`, `expires_at`
5) `usage_daily`
   - `user_id`
   - `date`
   - `count`
   - unique(`user_id`, `date`)

---

## 9. 接口清单（API Surface）（MVP）

### 9.1 公共接口
- `GET /api/me`：获取当前登录用户
- `POST /api/auth/logout`：退出

### 9.2 OAuth
- `GET /api/auth/github/login`
- `GET /api/auth/github/callback`
- `GET /api/auth/google/login`
- `GET /api/auth/google/callback`
- `GET /api/auth/wechat/login`
- `GET /api/auth/wechat/callback`

### 9.3 AI
- `POST /api/ai/chat`（非流式）
- `POST /api/ai/chat/stream`（流式 SSE，阶段 B）

### 9.4 订阅（用户侧）
- `GET /api/billing/status`：订阅状态 + 今日剩余免费次数

### 9.5 管理接口（仅 admin）
- `GET /api/admin/users`
- `POST /api/admin/users/{user_id}/subscription`（开通/停用/设置过期时间）
- `GET /api/admin/users/{user_id}/usage`（查看用量）

---

## 10. 部署拓扑（ECS）

### 10.1 Docker Compose（建议）
- `postgres`（业务库）
- `fastapi`（后端）
- `ollama`（模型服务）
- `wordpress` + `mysql`（现有博客）

### 10.2 Nginx（核心分流）
- `/` → 静态站目录
- `/api/` → fastapi:8000（建议只监听 127.0.0.1）
- `/blog/` → wordpress:80（通过 127.0.0.1:8080 映射）

---

## 11. 风险与降低出错率策略（Ops Strategy）

1) **故障隔离**
   - WordPress 与 FastAPI/AI 分离，互不影响
2) **统一入口**
   - 所有业务 API 都走 `/api/`，便于日志与排错
3) **稳定优先**
   - 先做“次数计费 A”，后做“token 计费 B”
4) **可回滚**
   - 所有配置与服务用 compose 管理，版本可控
5) **可观测**
   - FastAPI 记录关键日志：登录、AI 调用、订阅变更
   - 后续可加 Prometheus/Grafana（非 MVP）

---

## 12. 里程碑（Milestones）

### M1：基础网关与路由打通
- Nginx `/` + `/api/` + `/blog/` 正常
- Postgres 跑通，FastAPI 连通

### M2：三方登录（GitHub/Google/WeChat）+ 会话
- 完成 OAuth 回调与 cookie 会话
- `/api/me` 可用

### M3：AI 网关（阶段 A：次数计费）
- 登录后可调用 AI
- 每日 5 次免费，超额返回订阅提示

### M4：订阅（手动开通）+ 管理后台
- `/admin` 仅管理员可访问
- 管理员可为用户开通订阅

### M5：阶段 B（token 计费 + SSE）
- 增加 `/api/ai/chat/stream`
- 增加 token/字数统计与计费（替换或并行于次数计费）

---

## 13. 配置清单（需要你准备的 Key/回调地址）

> 回调 URL 都建议使用：`https://cuizhexiao.xyz/api/auth/<provider>/callback`

- GitHub OAuth：Client ID / Client Secret
- Google OAuth：Client ID / Client Secret
- 微信开放平台（网站应用）：AppID / AppSecret + 回调域名配置

---

## 14. 验收标准（Acceptance Criteria）
- `/blog/wp-login.php` 正常（WordPress 不受影响）
- 未登录访问 `/api/ai/*` 必须被拒绝
- 登录用户每日免费 5 次可正常使用 AI
- 超额后提示订阅，订阅 active 后恢复可用
- 管理后台只有管理员可见，可为用户开通订阅并查看用量

