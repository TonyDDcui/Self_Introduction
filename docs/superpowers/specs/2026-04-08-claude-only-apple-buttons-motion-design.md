# Claude 全站风格 + 保留 Apple 按钮 + 编辑感动效（设计规格）
日期：2026-04-08  
适用项目：`Self_Introduction`（Next.js App Router）  
默认设置：`data-theme="claude"` 固定；`data-mode="light"`（首次可跟随系统）；动效强度：**编辑感（A）**  

## 1. 目标（Goals）
1) **去掉 Apple UI 主题**：全站视觉统一为 Claude（暖羊皮纸、serif 标题、暖灰中性色、ring-based depth）。  
2) **保留 Apple 按钮风格**（仅按钮）：  
   - Apple Blue 主按钮（`#0071e3`，8px 圆角）  
   - Apple 980px pill 形态（用于 Learn more / 次级动作）  
3) **增强动效**：比当前更多、但依旧克制（“编辑感”入场/滚动/hover），并支持 reduced motion。  
4) **保留浅/深模式切换**（Claude light/dark）。  

## 2. 非目标（Non-goals）
- 不再提供 Apple/Claude 主题切换（仅固定 Claude）。  
- 不做强视差、炫光渐变、复杂 3D、全屏背景漂移等高噪音动效。  
- 不引入第三套主题或可视化主题编辑器。  

## 3. 信息架构与交互入口
### 3.1 Nav 控制区
- 移除 Theme Toggle（Claude/Apple）。  
- 保留 Mode Toggle（浅色/深色）。  

### 3.2 DOM 标记（最终）
在 `<html>` 上：
- `data-theme="claude"`（固定写死，不再切换）
- `data-mode="light" | "dark"`（可切换、持久化）

示例：
```html
<html lang="zh-HK" data-theme="claude" data-mode="light">
```

## 4. Token 与样式约束
### 4.1 Claude 主题（全站唯一主题）
- Light 使用 Claude DESIGN.md 的 Parchment / Ivory / Terracotta / Warm neutrals  
- Dark 使用 Near Black / Dark Surface / Warm Silver  
- Depth：以 **ring shadow** 为主（`0px 0px 0px 1px` 这种边界感），drop shadow 极轻（whisper）。  

### 4.2 Apple 仅按钮（组件级，不影响页面主题）
**Button Variant A：Apple Blue Primary**
- 背景：`#0071e3`
- 文本：`#ffffff`
- Radius：8px
- 用途：最强 CTA（Hero 主按钮、Contact 主入口等）

**Button Variant B：Apple Pill (980px)**
- Radius：980px
- 颜色：跟随 Claude（light 用暖色 ring；dark 用暗面 ring）
- 用途：Learn more / View all / Back 等次级动作

> 强约束：除了按钮 Primary 的 `#0071e3`，其余非交互元素不使用 Apple 蓝；站点的视觉基调仍是 Claude。  

## 5. 组件级设计
### 5.1 Nav（Claude）
- 背景：Parchment/Ivory（`--bg-page` / `--surface-1`）
- 分隔：`1px solid var(--ring)` 或 ring 阴影
- 字体：UI 用 sans；标题/品牌可用 serif（Georgia fallback）
- 右侧：仅 Mode Toggle（浅/深）

### 5.2 Hero（Claude + Apple Blue 主按钮）
- 背景：Parchment
- 标题：serif（Georgia），行高 1.10–1.25
- 副标题：sans + 更松行距（建议 1.55–1.60）
- CTA：
  - 主 CTA：Apple Blue Primary
  - 次 CTA：Apple Pill（Claude ring 风格）

## 6. 动效系统（编辑感 A）
### 6.1 总体原则
- 动效用于“阅读节奏”与“交互反馈”，不用于炫技。  
- 所有动效在 `prefers-reduced-motion: reduce` 下自动关闭或降级。  

### 6.2 Hero 入场（分层 + 轻 blur）
对 Hero 的标题/副标题/CTA：
- 初始：`opacity: 0; transform: translateY(10px); filter: blur(2px);`
- 结束：`opacity: 1; transform: translateY(0); filter: blur(0);`
- 时长：300–420ms，ease-out
- stagger：每层 delay 80ms

### 6.3 滚动 reveal（section + 卡片轻 stagger）
- section 进入视口：`opacity + translateY(8px)`（已有基础可复用）
- 列表/卡片：每项额外 `60–80ms` 的 delay（增强编辑节奏）

### 6.4 Hover/Press 微交互
- 卡片 hover：上浮 2–4px + ring 更明显
- 按钮 hover：
  - Apple Blue：轻微提亮/阴影增强（仍克制）
  - Pill：ring 强化
- 按钮 active：轻微缩小 `scale(0.98)`（可选）

## 7. 验收标准（Acceptance Criteria）
1) 页面无 Apple UI 的黑玻璃/黑白交替/Apple 链接蓝体系；整体视觉为 Claude。  
2) 站点仅保留 **Apple Blue 主按钮** + **Apple Pill 形态** 两类按钮风格。  
3) Nav 仅保留浅/深模式切换，且刷新保持（localStorage）。  
4) Hero 有“编辑感”入场动效；滚动 section reveal 与卡片 stagger 生效。  
5) `prefers-reduced-motion` 生效：系统减少动效时页面不出现动画。  

