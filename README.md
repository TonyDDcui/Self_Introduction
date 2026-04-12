# TonyDDcui - 個人作品集網站

一個受 Apple 設計風格啟發的現代化個人作品集網站。採用最新的 Web 技術，展現創意開發者的專業形象。

## 🎨 設計特點

### 視覺設計
- **極簡主義風格** - 大量留白，清晰的視覺層次
- **漸變色彩** - 現代化的紫色、粉紅色、青色漸變
- **玻璃擬態效果** - 毛玻璃背景和透明卡片
- **動態排版** - 巨大醒目的標題和流暢的文字動畫

### 交互動畫
- **滾動驅動動畫** - 元素隨著滾動淡入、縮放、位移
- **視差滾動效果** - 英雄區域的深度感
- **微交互** - 按鈕懸停、卡片提升、平滑過渡
- **頁面加載動畫** - 標題和內容的漸進式顯示

### 響應式設計
- **完全響應式** - 從手機到桌面的完美適配
- **移動優先** - 優化的移動體驗
- **觸摸友好** - 適合觸摸設備的交互

## 📁 項目結構

```
apple-style-portfolio/
├── index.html              # 主 HTML 文件
├── css/
│   ├── style.css          # 主樣式表
│   ├── animations.css     # 動畫定義
│   └── responsive.css     # 響應式設計
├── js/
│   └── main.js            # 主 JavaScript 文件
├── images/                # 圖片資源
├── assets/                # 其他資源
└── README.md              # 本文件
```

## 🚀 快速開始

### 本地開發

1. **克隆或下載項目**
```bash
git clone https://github.com/TonyDDcui/Self-Introduction.git
cd apple-style-portfolio
```

2. **使用本地服務器運行**
```bash
# 使用 Python 3
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server
```

3. **在瀏覽器中打開**
```
http://localhost:8000
```

### 部署

#### GitHub Pages
1. 將項目推送到 GitHub
2. 在倉庫設置中啟用 GitHub Pages
3. 選擇 `main` 分支作為源

#### Netlify
1. 連接 GitHub 倉庫
2. 構建命令：留空
3. 發佈目錄：`.`

#### Vercel
1. 導入 GitHub 倉庫
2. 框架預設：其他
3. 部署

## 🎯 主要功能

### 導航
- 粘性導航欄，支持平滑滾動
- 移動菜單，響應式設計
- 活動鏈接指示

### 英雄區域
- 全屏背景，動態漸變
- 動畫標題和副標題
- 行動按鈕（CTA）
- 滾動指示器

### 關於部分
- 個人介紹
- 統計數據（經驗、項目、熱忱）
- 個人圖片框架

### 技能部分
- 6 個技能卡片
- 技能等級進度條
- 懸停動畫效果

### 項目部分
- 項目卡片網格
- 項目覆蓋層和鏈接
- 技術標籤
- 項目分類

### 經歷部分
- 時間軸設計
- 工作經歷卡片
- 日期和公司信息

### 聯絡部分
- 聯絡信息卡片
- 聯絡表單
- 表單驗證

### 頁腳
- 品牌信息
- 導航鏈接
- 社交媒體鏈接
- 版權信息

## 🛠️ 技術棧

### 前端
- **HTML5** - 語義化標記
- **CSS3** - 現代樣式和動畫
- **JavaScript (ES6+)** - 交互和動畫

### 特性
- 無框架依賴 - 純 HTML/CSS/JS
- 響應式設計 - 移動優先
- 可訪問性 - WCAG 標準
- 性能優化 - 快速加載

## 🎨 自定義

### 修改顏色
編輯 `css/style.css` 中的 CSS 變量：

```css
:root {
    --color-accent: #0071e3;
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* ... 更多顏色 ... */
}
```

### 修改內容
編輯 `index.html` 中的相應部分：

```html
<!-- 修改標題 -->
<h1 class="hero-title">
    <span class="hero-title-line">你的標題</span>
</h1>

<!-- 修改技能 -->
<div class="skill-card">
    <h3 class="skill-title">你的技能</h3>
    <!-- ... -->
</div>
```

### 修改字體
在 `index.html` 中修改 Google Fonts 鏈接：

```html
<link href="https://fonts.googleapis.com/css2?family=你的字體&display=swap" rel="stylesheet">
```

## 📱 響應式斷點

- **桌面** - 1024px 及以上
- **平板** - 768px 到 1024px
- **手機** - 480px 到 768px
- **小手機** - 320px 到 480px

## ♿ 可訪問性

- 語義化 HTML
- ARIA 標籤
- 鍵盤導航支持
- 焦點管理
- 顏色對比度符合 WCAG AA 標準
- 支持減少動畫偏好

## 🚀 性能優化

- 最小化 CSS 和 JavaScript
- 圖片懶加載
- 防抖滾動事件
- 交叉觀察器 API 用於動畫觸發
- 無外部依賴

## 🔧 瀏覽器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)
- 移動瀏覽器

## 📄 許可證

MIT License - 自由使用和修改

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 聯絡

- Email: tony@example.com
- GitHub: [@TonyDDcui](https://github.com/TonyDDcui)
- LinkedIn: [TonyDDcui](https://linkedin.com/in/tonyddcui)

## 🙏 致謝

設計靈感來自 Apple 官方網站的現代設計理念。

---

**最後更新**: 2026 年 3 月 28 日

**部署觸發**: 2026 年 4 月 12 日
