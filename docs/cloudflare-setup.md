# Cloudflare 国内访问优化与安全（cuizhexiao.xyz）

这份文档用于把站点从 **DNS only（灰云）** 切换到 **Proxied（橙云）**，并开启 WAF/缓存等能力，以改善国内访问速度并增强安全防护。

> 注意：Cloudflare 配置会影响全站流量路由。建议在低峰期操作，改动后用手机/电脑分别访问首页、Blog、Gallery 验证。

## 1) DNS：从灰云切到橙云（Proxied）

在 Cloudflare 控制台：
1. 进入 **DNS** → **Records**
2. 找到 `@`（根域）与 `www`（如果有）对应的记录
3. 将 **Proxy status** 从 `DNS only` 切换为 `Proxied`（图标变为橙色云）

完成后，访问流量将经过 Cloudflare，才能使用 WAF、Cache Rules、压缩、HTTP/3 等优化能力。

## 2) SSL/TLS：建议 Full (strict)

进入 **SSL/TLS**：
- **Encryption mode**：选择 `Full (strict)`
- 如果你的源站是 Vercel/HTTPS，通常可以直接用 strict

## 3) 性能建议（国内访问更稳）

进入 **Speed** / **Network**（不同 UI 版本名字略有差异）：
- 开启 **HTTP/3 (QUIC)**
- 开启 **Brotli**
- 开启 **Early Hints**（如果可用）

## 4) Cache Rules：缓存 Next 静态资源

进入 **Caching** → **Cache Rules** 新建规则（推荐）：

### 规则 A：`/_next/static/*` 强缓存
- When incoming requests match…
  - URI Path starts with: `/_next/static/`
- Then…
  - Cache eligibility：Cache
  - Edge TTL：30 days（或更长）
  - Browser TTL：Respect existing headers（或 7 days）

> 这会明显改善国内访问首屏静态资源加载。

### 规则 B：图片资源缓存（可选）
如果你的图片走 `*.public.blob.vercel-storage.com`，它本身通常已经有 CDN 缓存；Cloudflare 对跨域资源缓存策略要谨慎。  
建议先观察效果再加规则，避免误缓存动态内容。

## 5) WAF：基础防护（Managed Rules）

进入 **Security** → **WAF**：
- 开启 **Managed Rules**（Cloudflare Managed / OWASP 等）
- 先用默认配置跑 1-2 天，观察是否误拦截正常请求

## 6) WAF 自定义规则：保护高风险 API（推荐）

目标：减少上传/生成/翻译接口被刷，从而节省 token 并防止滥用。

建议对以下路径加严：
- `/api/gallery/upload`
- `/api/gallery/photos/*/narrative/regenerate`
- `/api/i18n/*`

可选动作（按你的接受程度）：
1) **JS Challenge / Managed Challenge**
2) **Rate limiting（Cloudflare 侧）**
3) **Block 特定 UA/可疑国家地区**（如果你只面向国内访问）

> 站点内部已经做了应用层限流，但 Cloudflare 侧限流可以更早拦截恶意流量，减少源站压力。

## 7) 验收清单

改完后逐项验证：
1. 首页可正常打开（浅色/深色切换正常）
2. Blog 列表与文章页可打开（英文切换正常）
3. Gallery 列表可打开（英文模式下出现 loading+进度条，完成后显示英文）
4. 上传页面可正常上传（HEIC 上传后能正常显示）
5. 控制台（Cloudflare Security Events）无大量误拦截

