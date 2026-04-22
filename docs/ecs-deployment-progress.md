# cuizhexiao.xyz 项目部署进度说明（ECS）

更新时间：2026-04-22  
分支：`cursor/implement-mvp-fastapi-ai-fee1`

---

## 一、已完成内容

### 1. 后端 FastAPI（MVP）已落地

已新增 `backend/` 服务，核心能力如下：

- 认证相关
  - `GET /api/auth/github/login`
  - `GET /api/auth/github/callback`
  - `GET /api/me`
  - `POST /api/auth/logout`
  - Google/WeChat 路由预留（当前返回 501）
- 业务相关
  - `GET /api/billing/status`
  - `POST /api/ai/chat`（当前可用，但依赖 Ollama）
  - `GET /api/admin/users`
  - `POST /api/admin/users/{user_id}/subscription`
  - `GET /api/admin/users/{user_id}/usage`
  - `GET /api/blog/latest`
  - `GET /api/healthz`
- 规则已实现
  - GitHub 白名单管理员
  - 每日免费 5 次（Asia/Shanghai）
  - 管理员不限额
  - 超额返回 `402 + SUBSCRIPTION_REQUIRED`
  - 基础限流（用户/IP）
  - 订阅操作审计日志

### 2. 数据模型已落地（MVP）

已在 `backend/app/models.py` 实现：

- `users`
- `identities`
- `refresh_tokens`
- `subscriptions`
- `usage_daily`
- `admin_audit_logs`

> 当前采用 SQLAlchemy 启动自动建表模式，满足 MVP 联调需求。

### 3. 前端联动已落地

- 首页 Writing 区域支持优先读取后端 `/api/blog/latest`，展示最新 5 篇 WordPress 文章
- 当后端或 WP 不可用时自动回退本地文章内容
- 已新增 `/admin` 极简管理页（MVP 表格视图）

### 4. 部署骨架已落地

- `docker-compose.yml`（postgres/fastapi/wordpress/mysql/ollama）
- `backend/Dockerfile`
- `backend/.env.example`
- `backend/README.md`
- `deploy/nginx/czx.conf`（`/`、`/api/`、`/blog/` 分流）

### 5. 代码质量与构建验证已完成

- `python3 -m compileall app`（backend）通过
- `npm test` 通过
- `npm run build` 通过

---

## 二、当前可运行范围（不依赖 Ollama）

在忽略 AI 模型的情况下，以下链路可先验证：

1. Nginx 路由分流
   - `/` -> 前端
   - `/api/healthz` -> FastAPI
   - `/blog/` -> WordPress
2. WordPress 访问与后台登录页
3. FastAPI 的认证、计费状态、管理员列表、博客桥接接口
4. 首页最新 5 篇博客联动（通过 `/api/blog/latest`）

---

## 三、待完成内容（按优先级）

### P0（先保证上线可用）

1. **忽略 AI 后完成整站联调**
   - 跑通 `/`、`/api/healthz`、`/blog/wp-login.php`
   - 确认 Nginx 与容器端口映射一致
2. **GitHub OAuth 正式配置**
   - 配置 `GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET`
   - 回调地址配置为 `https://cuizhexiao.xyz/api/auth/github/callback`
3. **生产环境变量校准**
   - `APP_URL`、`FRONTEND_URL`、`COOKIE_SECURE=true`、`COOKIE_DOMAIN=cuizhexiao.xyz`

### P1（AI 恢复时再做）

1. **恢复 Ollama 链路**
   - 统一镜像/网络策略，确保 FastAPI 可访问 `OLLAMA_BASE_URL`
   - 模型 `gemma4:e4b` 拉取与可用性验证
2. **AI 路由联调**
   - `/api/ai/chat` 请求成功
   - 免费额度扣减与 402 行为符合预期

### P2（后续增强）

1. `/admin` 页面从“只读表格”增强为“可操作开通/停用订阅”
2. CSDN 自动同步任务与 WP 展示策略统一（当前脚本已保留）
3. 会话增强（如刷新逻辑、设备管理等）

---

## 四、建议的本次验收清单（无 AI 版本）

请在 ECS 完成以下验收：

1. `curl http://127.0.0.1:8000/api/healthz` 返回 `{"status":"ok"}`
2. `curl -I http://127.0.0.1:8080/wp-login.php` 返回 200/302
3. `curl http://127.0.0.1:8000/api/blog/latest` 返回 JSON（空数组或文章列表均可）
4. `curl -I https://cuizhexiao.xyz/` 返回 200
5. `curl -I https://cuizhexiao.xyz/api/healthz` 返回 200
6. `curl -I https://cuizhexiao.xyz/blog/wp-login.php` 返回 200/302

---

## 五、关键文件索引

- 后端主入口：`backend/app/main.py`
- 后端模型：`backend/app/models.py`
- 环境模板：`backend/.env.example`
- Compose：`docker-compose.yml`
- Nginx 示例：`deploy/nginx/czx.conf`
- 首页博客联动：`src/components/sections/Writing.tsx`
- 后端博客 API 客户端：`src/lib/backendApi.ts`
- 管理页：`app/admin/page.tsx`

