# 个人主页 + 博客重设计（Apple 风格）— 设计规格 v2
日期：2026-04-08  
技术栈：Next.js（React） + MDX（仓库内内容）  
核心要求：自动接入仓库图片（MDX 可引用 + 自动图库页）

## 0. 背景与现状
- 当前仓库为纯 HTML/CSS/JS 单页作品集，页面使用大量渐变/玻璃拟态与占位图。
- `images/`、`assets/` 在文档中被提及，但由于为空目录并未纳入 Git 追踪，站点无真实图片资产。
- 需要重设计为更“Apple 官网”气质，并加入博客能力（MDX）。

## 1. 目标（Goals）
1. 视觉与排版遵循《Design System Inspiration of Apple》：黑/浅灰交替节奏、唯一蓝色交互强调、SF Pro 排版逻辑、极克制阴影/边框。
2. 站点结构为“发布会大片感”（产品发布页叙事）：每屏讲一件事，节奏清晰。
3. 博客采用仓库内 MDX 管理，支持标签、列表、详情页，可扩展 RSS/搜索。
4. 自动接入仓库内所有图片：
   - 在 MDX/项目内容中可用简单语法引用仓库图片
   - 生成 `/gallery` 图库页，可搜索/筛选并一键复制引用片段

## 2. 非目标（Non-goals）
- 不引入多彩渐变、纹理背景、复杂拟物/玻璃拟态卡片体系。
- 不实现评论系统/登录系统（可作为后续扩展）。
- 不做重型 CMS（内容继续写在 repo 中）。

## 3. 信息架构（IA）与路由（Routes）
### 3.1 站点路由
- `/`：Home（发布会式长页）
- `/blog`：博客列表（分页/标签/搜索可选）
- `/blog/[slug]`：博客文章（MDX）
- `/tags/[tag]`：标签页（可选但推荐）
- `/projects`：项目列表（可选；也可仅首页精选）
- `/projects/[slug]`：项目详情（MDX 或数据驱动；可选）
- `/gallery`：自动图库（必做）
- `/resume`：简历页（可选，或外链 PDF）

### 3.2 Home 分镜（Sections：黑 → 灰 → 黑 → 灰 → 黑）
1. **Hero（Dark / #000）**  
   - 视觉：全宽黑底、中心内容块、无背景纹理/渐变  
   - 文案：一句定位（H1）+ 一句补充（subline）  
   - **CTA 设计**（主 CTA = Blog）：  
     - 左：`Learn more`（Pill Outline，透明底 + 描边）→ 滚动到 About  
     - 右：`Blog`（Primary Blue）→ `/blog`
2. **About（Light / #f5f5f7）**  
   - 左对齐正文（禁止正文居中）  
   - 3 个 stats（年限/项目/领域等）
3. **Featured Projects（Dark / #000）**  
   - 每个项目使用“Product Hero Module”：大图（来自仓库图片）+ 标题 + 一句描述 + 两个 CTA（Learn more / View code）
4. **Writing（Light / #f5f5f7）**  
   - 最新 3–6 篇文章卡片（标题/摘要/日期/标签）  
   - “View all posts” pill link → `/blog`
5. **Contact（Dark / #000）**  
   - 以联系方式为主：Email / GitHub / LinkedIn  
   - 表单可选：视觉极简，输入框遵循 Apple 风格（少边框、focus ring 明确）

## 4. 视觉系统（Design Tokens）
> 关键原则：**唯一强调色** `#0071e3` 仅用于交互（链接、按钮、focus）。其余全部中性色。

### 4.1 颜色（Color Tokens）
- `--bg-dark`: `#000000`
- `--bg-light`: `#f5f5f7`
- `--text-on-light`: `#1d1d1f`
- `--text-secondary-on-light`: `rgba(0,0,0,0.8)`
- `--text-tertiary-on-light`: `rgba(0,0,0,0.48)`
- `--text-on-dark`: `#ffffff`
- `--accent`: `#0071e3`（focus ring / primary CTA / interactive）
- `--link-on-light`: `#0066cc`
- `--link-on-dark`: `#2997ff`

### 4.2 字体与排版（Typography）
字体栈建议（Web 近似 SF Pro）：
- Display：`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif`
- Text：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif`

关键字号/字重/行高/字距（必须落地为 token）：
- Hero H1：56px / 600 / line-height 1.07 / letter-spacing -0.28px
- Section Title：40px / 600 / 1.10
- Tile Heading：28px / 400 / 1.14 / 0.196px
- Body：17px / 400 / 1.47 / -0.374px
- Link：14px / 400 / 1.43 / -0.224px
- Nav：12px / 400（暗色玻璃导航）

### 4.3 圆角/阴影（Radius & Shadow）
- `--radius-8`: 8px（按钮/卡片）
- `--radius-11`: 11px（输入/筛选按钮）
- `--radius-12`: 12px（大图容器）
- `--radius-pill`: 980px（Learn more / Shop 风格 pill）
- 阴影（慎用）：`rgba(0, 0, 0, 0.22) 3px 5px 30px 0px`

## 5. 组件规范（Components）
### 5.1 Navigation（非谈判项）
- sticky 顶部导航：`rgba(0,0,0,0.8)` + `backdrop-filter: saturate(180%) blur(20px)`
- 高度 48px；文字 12px、白色；hover 下划线
- 移动端：汉堡 → 全屏 overlay menu（同样暗玻璃）

### 5.2 Buttons
1) Primary Blue（主按钮）
- 背景：`#0071e3`，文字白
- Radius：8px；Padding：8px 15px
- Focus：2px outline `#0071e3`

2) Pill Outline（Learn more）
- 透明底；文字与描边：亮底 `#0066cc` / 暗底 `#2997ff`（按背景切换）
- Radius：980px
- Hover：underline

### 5.3 Cards（克制）
- 卡片通常无边框无阴影；依靠背景块与留白分隔
- 只有“产品/项目”主卡允许使用一次柔和阴影

## 6. 博客系统（MDX in repo）
### 6.1 内容目录
- `content/blog/*.mdx`
- （可选）`content/projects/*.mdx`

### 6.2 Frontmatter 最小字段
- `title`
- `date`
- `summary`
- `tags: []`
- `cover`（可选：仓库图片引用路径）

### 6.3 列表与详情
- `/blog`：按时间倒序；支持分页与标签过滤（至少提供 tag 页）
- `/blog/[slug]`：文章页提供：目录（可选）、上一篇/下一篇（可选）、标签

## 7. 仓库图片自动接入（MDX 可引用 + /gallery）
### 7.1 目标体验
1) MDX 内可引用仓库图片：  
   - `<RepoImage src="path/in/repo/foo.png" alt="..." />`
2) `/gallery` 自动列出仓库所有图片：  
   - 支持搜索（文件名/路径）与筛选（扩展名/文件夹）  
   - 每张图提供“一键复制引用代码”（供 MDX 使用）

### 7.2 构建期管线（推荐做法）
1) 扫描 repo：`**/*.{png,jpg,jpeg,webp,gif,svg}`（排除 `.git/ .next/ node_modules/`）  
2) 输出到 Next public：把图片按原目录结构（或 hash 防冲突）复制到  
   - `public/repo-images/**`
3) 生成清单：`repo-images-manifest.json`（建议放 `src/generated/` 或 `public/`）  
   - 字段：`originalPath`, `publicPath`, `name`, `ext`（可加 `size`, `mtime`）
4) 运行时：
   - `<RepoImage />` 通过 manifest 将 `src` 解析到 `publicPath`，统一走 Next/Image（svg 可降级 img）
   - `/gallery` 读取 manifest 渲染

### 7.3 冲突与规则
- 同名不同路径：以原路径为准（保留目录结构）或追加短 hash
- 空目录无法被 Git 追踪：若要求固定 `images/` 目录，需放置 `.gitkeep`（后续实现阶段处理）

## 8. 动效与无障碍
- 动效：只做淡入/轻位移；禁用复杂视差与夸张动效
- 必做：`prefers-reduced-motion` 降级
- Focus ring：所有交互元素统一 `2px solid #0071e3`

## 9. 验收标准（Acceptance Criteria）
1. 首页实现黑/浅灰交替分镜与 Apple 风格导航。
2. Blog：MDX 内容可渲染，列表/详情可用，tag 可用（至少一种聚合方式）。
3. 图片：构建后 manifest 覆盖 repo 内所有图片；MDX 可引用；`/gallery` 可浏览并复制引用。
4. 全站仅 `#0071e3` 作为交互强调色（不出现第二强调色）。

