# 主题切换 + 亮/暗模式 + 轻动效 + GitHub 头像同步（设计规格）
日期：2026-04-08  
适用项目：`/workspace/Self_Introduction`（Next.js App Router）  
默认设置：**Theme=Claude**，**Mode=Light**，**Motion=轻微**  

## 1. 目标（Goals）
1) 增加 **主题切换**（Claude / Apple），默认 Claude。  
2) 增加 **亮/暗模式切换**（Light / Dark），可与主题独立组合（共 4 种组合）。  
3) 首页与关键区块增加 **轻微动效**（更有“活”的感觉，但仍保持克制）。  
4) About 区块展示头像，并与 GitHub 头像 **自动同步**（TonyDDcui）。  

## 2. 非目标（Non-goals）
- 不做复杂的视差、炫光、渐变光斑、重度 3D 动画（与 Apple/Claude 的克制气质冲突）。  
- 不引入第三套主题；不实现主题编辑器。  

## 3. 信息架构与交互入口
### 3.1 Nav 右侧控制区（必须）
在导航栏右侧放置两个开关（顺序建议：Theme → Mode）：
- **Theme Toggle**：Claude / Apple  
- **Mode Toggle**：Light / Dark（中文文案：浅色 / 深色）  

默认值：
- Theme：Claude
- Mode：Light

### 3.2 持久化与系统偏好
- 主题与模式写入 `localStorage`：`site.theme`, `site.mode`
- 首次访问（localStorage 无值）：
  - Theme：Claude（固定默认）
  - Mode：跟随 `prefers-color-scheme`（若系统为 dark，则默认 Dark，否则 Light）
- 用户手动切换后：以 localStorage 为准，不再自动跟随系统变化（避免“自动跳变”）。  

## 4. 主题系统（Theme Architecture）
### 4.1 DOM 标记
在 `<html>` 上挂两个 data 属性：
- `data-theme="claude" | "apple"`
- `data-mode="light" | "dark"`

例：
```html
<html lang="zh-HK" data-theme="claude" data-mode="light">
```

### 4.2 Token 组织方式（推荐）
采用“基础 token + 主题&模式覆盖”的 CSS 变量结构，避免组件里写 if/else：
1) `tokens.base.css`：通用尺寸、圆角、z-index、动效时长等（与主题无关）  
2) `tokens.apple.light.css`
3) `tokens.apple.dark.css`
4) `tokens.claude.light.css`
5) `tokens.claude.dark.css`

加载顺序建议：
`base` → 根据 `data-theme`/`data-mode` 选择其一（用 attribute selector 覆盖）。  

### 4.3 Claude 主题关键 token（来自 Claude DESIGN.md）
Light：
- `--bg-page`: `#f5f4ed`（Parchment）
- `--surface-1`: `#faf9f5`（Ivory）
- `--text-primary`: `#141413`
- `--text-secondary`: `#5e5d59`
- `--text-tertiary`: `#87867f`
- `--accent`: `#c96442`（Terracotta，CTA）
- `--focus`: `#3898ec`（只用于 focus ring，可访问性允许唯一冷色）
- `--ring`: `#d1cfc5`（ring shadow）

Dark：
- `--bg-page`: `#141413`
- `--surface-1`: `#30302e`
- `--text-primary`: `#faf9f5`
- `--text-secondary`: `#b0aea5`
- `--accent`: `#c96442`
- `--focus`: `#3898ec`
- `--ring`: `#30302e`（或更浅一档用于 hover）

### 4.4 Apple 主题关键 token（沿用现有 Apple 规格）
Light：
- `--bg-page`: `#f5f5f7`
- `--bg-dark`: `#000000`
- `--text-primary`: `#1d1d1f`
- `--text-secondary`: `rgba(0,0,0,0.8)`
- `--accent`: `#0071e3`（唯一强调色）
- `--focus`: `#0071e3`

Dark：
- `--bg-page`: `#000000`
- `--surface-1`: `#272729`（可选）
- `--text-primary`: `#ffffff`
- `--text-secondary`: `rgba(255,255,255,0.72)`（可选）
- `--accent`: `#2997ff`（暗底链接更亮；按钮仍可用 `#0071e3` 或保持一致策略）
- `--focus`: `#0071e3`

> 备注：Apple 主题坚持“蓝色只用于交互”原则；Claude 主题坚持“陶土色只用于 CTA/强强调”，其余为暖中性色。  

## 5. Claude 导航栏与 Hero（按主题切换）
### 5.1 Claude Nav 视觉
当 `data-theme="claude"`：
- Nav 背景：`--bg-page` 或 `--surface-1`（更像纸面）
- 分隔：使用 ring 或 1px warm border（不要 Apple 黑玻璃）
- 字体：UI 使用 sans；品牌/标题可用 serif（Georgia fallback）
- 右侧放置 Theme/Mode Toggle（小尺寸、圆角 12px、ring 阴影）

### 5.2 Claude Hero 视觉
当 `data-theme="claude"`：
- 背景：Parchment
- 标题（serif）：更“书名感”，行高 1.10–1.25
- 副标题（sans）：更松的行距 1.60
- CTA：主 CTA 采用 `--accent`（Terracotta），次 CTA 用 warm sand / ring button

### 5.3 Apple Nav/Hero 保持现有
当 `data-theme="apple"`：沿用当前 Apple 深色玻璃导航与发布会式 Hero（但仍使用统一动画系统）。  

## 6. 动效系统（Motion）
### 6.1 动效强度：轻微（已确认）
动效原则：只增强“进入/提示交互”，不制造噪音。

进入动效（Hero）：
- 标题、描述、CTA：`opacity 0 → 1` + `translateY(8px) → 0`
- 300ms，`cubic-bezier(0.22, 1, 0.36, 1)`（ease-out 类）
- 元素分层 delay：80ms

滚动 reveal（sections）：
- About/Projects/Writing/Contact：进入视口时添加 `.is-visible`
- 同样 `opacity + translateY(8px)`，300ms

Hover（卡片/按钮）：
- 卡片：`translateY(-2px)` + ring/阴影轻微增强
- 按钮：ring 更明显；不做大幅缩放

### 6.2 无障碍（必须）
支持：
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

## 7. GitHub 头像同步（About）
### 7.1 数据来源
使用 GitHub 头像直链（会自动随 GitHub 头像更新）：
- `https://github.com/TonyDDcui.png?size=256`

### 7.2 展示规则
- About 区块左侧或首段上方展示头像容器
- Claude 主题：圆角 32px / 24px（更“柔”）
- Apple 主题：圆角 12px 或圆形（偏“产品图”感）
- 加载失败兜底：显示带边框的占位块（不影响布局）  

## 8. 验收标准（Acceptance Criteria）
1) Nav 有 Theme 与 Mode 两个开关，切换立即生效且刷新保持。  
2) Claude 主题下 Nav 与 Hero 视觉符合 Claude DESIGN（暖底、serif 标题、陶土 CTA、ring 阴影）。  
3) Apple 主题下仍保持 Apple 气质（黑/浅灰节奏、蓝色交互）。  
4) 轻微动效在 Home 与各 section 可见，并支持 reduced motion。  
5) About 中头像与 GitHub 同步（头像变更后站点自动反映）。  

