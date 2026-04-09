# 部署指南

## 快速部署

### 1. GitHub Pages (推薦)

#### 步驟 1: 準備 GitHub 倉庫
```bash
# 初始化 Git 倉庫
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Apple-style portfolio"

# 添加遠程倉庫
git remote add origin https://github.com/TonyDDcui/Self-Introduction.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

#### 步驟 2: 啟用 GitHub Pages
1. 進入 GitHub 倉庫設置
2. 找到 "Pages" 部分
3. 選擇 "Deploy from a branch"
4. 選擇 `main` 分支
5. 選擇根目錄 `/`
6. 點擊 "Save"

#### 步驟 3: 訪問網站
網站將在 `https://tonyddcui.github.io/Self-Introduction/` 上線

### 2. Netlify

#### 步驟 1: 連接 GitHub
1. 訪問 [netlify.com](https://netlify.com)
2. 點擊 "New site from Git"
3. 選擇 GitHub
4. 授權並選擇倉庫

#### 步驟 2: 配置構建
- **Build command**: 留空
- **Publish directory**: `.`

#### 步驟 3: 部署
點擊 "Deploy site"，Netlify 將自動部署

#### 步驟 4: 自定義域名 (可選)
1. 進入 Site settings
2. 找到 "Domain management"
3. 添加自定義域名

### 3. Vercel（推薦：Next.js）

本專案目前以 **Next.js App Router** 為主（含 API Route、MDX Blog、Gallery 等），最推薦使用 Vercel 部署。

#### 步驟 1: 導入項目
1. 訪問 [vercel.com](https://vercel.com)
2. 點擊 "New Project"
3. 導入 GitHub 倉庫（Self_Introduction）

#### 步驟 2: 構建配置（一般可自動識別）
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm ci`（可選）

#### 步驟 3: 環境變量（必填清單）

> 建議：同時配置到 **Production** 與 **Preview**。

**A) Activity（GitHub 贡献日历）**
- `GITHUB_USERNAME=TonyDDcui`
- `GITHUB_TOKEN=...`（GitHub GraphQL token；若 token 失效/撤銷，Activity 會顯示更明確的錯誤原因）

**B) GitHub OAuth（僅本人可上傳照片）**
- `GITHUB_CLIENT_ID=...`
- `GITHUB_CLIENT_SECRET=...`
- `NEXTAUTH_SECRET=...`（隨機長字串）
- `NEXTAUTH_URL=https://cuizhexiao.xyz`

**C) Vercel Blob（存圖片）**
- `BLOB_READ_WRITE_TOKEN=...`（可由 Vercel Storage / Blob 取得或由整合自動注入）

**D) Vercel Postgres（存元数据）**
- 透過 Vercel Postgres 整合建立 DB 後，Vercel 會自動注入連線相關 env（通常無需手動填）

#### 步驟 4: Storage（Blob + Postgres）初始化

**1) 啟用 Vercel Blob**
- 在 Vercel Dashboard：Storage → Blob → Create
- 確認專案可讀取 `BLOB_READ_WRITE_TOKEN`

**2) 啟用 Vercel Postgres**
- 在 Vercel Dashboard：Storage → Postgres → Create
- 建表：在 Postgres 的 Query/Console 中執行以下初始化 SQL（專案內檔案）：
  - `scripts/db/init.sql`

#### 步驟 5: 部署
點擊 "Deploy"（或 push 到 `main` 觸發自動部署）。

### 4. 傳統虛擬主機

#### 使用 FTP 上傳
1. 連接到 FTP 服務器
2. 上傳所有文件到 `public_html` 或 `www` 目錄
3. 訪問域名

#### 使用 SSH
```bash
# 連接到服務器
ssh user@your-domain.com

# 進入 web 目錄
cd public_html

# 克隆倉庫
git clone https://github.com/TonyDDcui/Self-Introduction.git .

# 或上傳文件
scp -r * user@your-domain.com:/public_html/
```

## 域名配置

### 購買域名
1. 在 Namecheap、GoDaddy 等平台購買域名
2. 配置 DNS 記錄

### 指向 GitHub Pages
```
A 記錄: 185.199.108.153
A 記錄: 185.199.109.153
A 記錄: 185.199.110.153
A 記錄: 185.199.111.153
CNAME 記錄: tonyddcui.github.io
```

### 指向 Netlify
```
CNAME 記錄: your-site.netlify.app
```

### 指向 Vercel
```
CNAME 記錄: cname.vercel-dns.com
```

## SSL/HTTPS

### GitHub Pages
自動提供 HTTPS

### Netlify
自動提供 HTTPS (Let's Encrypt)

### Vercel
自動提供 HTTPS

### 傳統虛擬主機
1. 購買 SSL 證書
2. 在服務器上安裝
3. 配置 HTTPS

## 性能優化

### 圖片優化
```bash
# 使用 ImageOptim 或 TinyPNG
# 壓縮所有圖片
```

### 代碼最小化
```bash
# 使用 UglifyJS 最小化 JavaScript
npx uglifyjs js/main.js -o js/main.min.js

# 使用 cssnano 最小化 CSS
npx cssnano css/style.css -o css/style.min.css
```

### 緩存策略
在 `_headers` 文件中配置 (Netlify):
```
/*
  Cache-Control: public, max-age=3600
```

## 監控和分析

### Google Analytics
1. 創建 Google Analytics 帳戶
2. 獲取追蹤 ID
3. 在 HTML 中添加追蹤代碼

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Netlify Analytics
1. 在 Netlify 中啟用 Analytics
2. 查看實時統計

## 持續集成/部署 (CI/CD)

### GitHub Actions
創建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 故障排除

### 網站無法訪問
1. 檢查 DNS 配置
2. 檢查防火牆設置
3. 清除瀏覽器緩存

### 樣式未加載
1. 檢查 CSS 文件路徑
2. 檢查 MIME 類型
3. 清除瀏覽器緩存

### JavaScript 不工作
1. 檢查瀏覽器控制台錯誤
2. 檢查 JavaScript 文件路徑
3. 檢查瀏覽器兼容性

### 性能問題
1. 使用 Google PageSpeed Insights
2. 優化圖片
3. 最小化代碼
4. 啟用 GZIP 壓縮

## 更新和維護

### 定期更新
```bash
# 拉取最新更改
git pull origin main

# 推送更新
git add .
git commit -m "Update: [description]"
git push origin main
```

### 備份
```bash
# 定期備份倉庫
git clone --mirror https://github.com/TonyDDcui/Self-Introduction.git backup.git
```

---

**最後更新**: 2026 年 3 月 28 日
