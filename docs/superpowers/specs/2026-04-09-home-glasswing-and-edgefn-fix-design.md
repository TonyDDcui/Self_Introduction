# Home Glasswing 扩展背景 + EdgeFn 配文修复（Design）

日期：2026-04-09

## 需求

1. **Hero 不需要蒙版**：Home 首屏保持干净，不包裹 SectionGlass。
2. **删除 Activity 模块**：Home 不再渲染 Activity section（文件可保留，后续再用）。
3. **About 模块实现 Glasswing 式滚动扩展背景**
   - 初始：About 以“蒙版卡片”形式出现（移动端宽度约 92%，两侧留白）。
   - 向下滚动：蒙版逐步扩大（圆角变小、宽度变满/接近满、背景更像全段背景）。
   - 向上滚动：反向收缩回蒙版尺寸。
   - 纹理：采用**纸质纹理**（克制、非图片资源或使用轻量内联纹理，避免额外请求）。
   - 无障碍：`prefers-reduced-motion` 时禁用滚动动画，保持静态蒙版。
4. **修复新增照片后 AI 配文偶发错误**
   - 错误：`EDGEFN_EMPTY_RESPONSE: {... "message":{"role":"assistant","reasoning_...`（返回结构存在但正文字段不在我们当前解析路径）
   - 目标：增强响应解析兼容性 + 多模态请求空响应时自动回退到纯文本重试，尽量不影响用户体验。

## 设计方案

### A) Home 模块结构

- `app/page.tsx`：移除 `<Activity />`；保留其他模块。
- `Hero.tsx`：移除 `SectionGlass` 包裹。
- `About.tsx`：将 `SectionGlass` 替换为新的滚动扩展容器 `GlasswingExpand`（名称可调整），实现“蒙版→扩展背景”。

### B) GlasswingExpand（滚动扩展背景）组件

新增 client component（监听滚动并更新 CSS 变量）：

- 文件：
  - `src/components/sections/GlasswingExpand.tsx`
  - `src/components/sections/GlasswingExpand.module.css`
- API：
  - `<GlasswingExpand>{children}</GlasswingExpand>`
- 机制：
  - 使用 `ref` 获取容器在 viewport 的 `getBoundingClientRect()`
  - 按 `rect.top` 计算进度 `p`（0→1），通过 `requestAnimationFrame` 更新 `--gw-p`
  - CSS 使用 `--gw-p` 控制：
    - `transform: scaleX(...)`（移动端从 0.92→1）
    - `border-radius` 从大→0
    - 背景层 `backdrop-filter` / 纹理层透明度随 p 增强（可选）
  - `prefers-reduced-motion`：固定 `p=0`（或直接不挂载监听）

### C) EdgeFn 空响应修复

改动点：

1) `src/lib/ai/edgefn.ts`
- `extractTextFromUnknownContent`：支持 **object** 形态（例如 `{ text: "..." }` 或 `{ content: "..." }`）
- 解析 `choices[0].message` 时不只读 `message.content`：
  - 若 `message` 是 object，尝试从 `message.content`、`message.output_text`、`message.text`、`message.final` 等字段提取文本
  - 对 key 以 `reasoning` 开头的字段不作为首选，但若只有它有内容可作为兜底（可配置开关）

2) `src/lib/gallery/photoNarratives.ts`
- 多模态（带 image_url）路径：
  - 现有：仅对“不支持多模态”回退
  - 新增：若捕获到 `EDGEFN_EMPTY_RESPONSE*`，也回退到纯文本重试一次

## 验收标准

1. Home 首屏 Hero 不再有蒙版。
2. Home 不再渲染 Activity。
3. About：向下滚动时蒙版扩展、向上滚动时收缩；移动端初始约 92% 宽度且两侧留白；纸质纹理存在但克制。
4. 新增照片后 AI 配文生成成功率提升：出现空响应时会自动回退重试；若仍失败，debug 信息更可读。

