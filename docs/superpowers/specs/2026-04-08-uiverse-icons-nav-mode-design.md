# Uiverse 图标融合（A 方案）：Menu + 模式切换

日期：2026-04-08  
项目：Self_Introduction（Next.js）

## 目标

在不破坏现有 **Claude 纸感视觉**（尺寸 / 圆角 / ring / hover 阴影与上浮）前提下：

1. 替换顶栏 **Menu（目录）** 按钮图标（`TocMenu`）为更“有设计感”的图标，并增加轻量图标动效  
2. 替换 **浅色/深色模式切换** 按钮图标（`ModeToggle` 的 Sun/Moon）为更“有设计感”的图标，并增加轻量图标动效  

用户选择：
- 融合策略：A（保留 Claude 按钮外观，只换图标 + 图标动效）
- Menu 图标风格：gagan-gv
- 模式切换图标风格：RiccardoRapelli

## 约束与范围

### 不做
- 不替换按钮容器样式（仍用现有 `TocMenu.module.css` / `ModeToggle.module.css` 的按钮尺寸与 token）
- 不引入额外 UI 库，不引入 SVG 运行时依赖
- 不影响无障碍：保留 `aria-label`、`aria-hidden`、`focusable="false"` 等语义

### 做
- 只修改/新增：`<svg>` 内容与少量 CSS（hover/focus 时的图标动效）
- 动效必须 **克制** 且支持 `prefers-reduced-motion: reduce`

## 设计方案（实现层面）

### 1) Menu（目录）按钮：TocMenu

文件：
- `src/components/nav/TocMenu.tsx`
- `src/components/nav/TocMenu.module.css`

变更：
- 将 `MenuIcon()` 的 SVG 从现有 “三条横线” 替换为更“圆润、比例更编辑化”的版本：
  - 仍使用 `stroke="currentColor"`（自动适配浅/深模式）
  - 线条端点 `strokeLinecap="round"`
  - 保留轻微不对称（第三条更短）以保持“编辑感”
- 图标动效：
  - hover/focus 时：整体轻微旋转（例如 `-6deg`）+ 轻微上抬（例如 `translateY(-0.5px)`）
  - 同时三条线做细微“收放”效果（用 `stroke-dasharray` / `stroke-dashoffset` 或 transform），持续时间控制在 140–220ms

### 2) 模式切换按钮：ModeToggle（Sun / Moon）

文件：
- `src/components/theme/ModeToggle.tsx`
- `src/components/theme/ModeToggle.module.css`

变更：
- 替换 `SunIcon()` / `MoonIcon()` 的 SVG：
  - 风格更“合成器 / 霓虹线稿”（RiccardoRapelli 倾向）：更清晰的线稿结构、少量内线/切口增强辨识度
  - 仍保持 16×16 图标尺寸与 `currentColor`
- 图标动效：
  - hover/focus 时：太阳光芒轻微“呼吸”（scale/opacity），月亮轻微“摆动”（rotate）
  - 切换瞬间：使用一个极短的 `opacity` + `translateY`（或 stroke-dash）来强调“编辑/切换”的反馈
  - 所有动效在 reduced motion 下关闭

## 版权与署名（说明）

- 目标是复用 Uiverse/Galaxy 的视觉语言来“再设计”图标与动效。  
- 由于 Uiverse 页面内容较多为动态渲染，若无法稳定抓取到指定作者对应组件的源码（精确到某个元素链接/文件名），本次默认以 **自绘 SVG（风格对齐）** 落地；  
  - 若用户后续提供 gagan-gv / RiccardoRapelli 对应的 Uiverse 元素链接（或 Galaxy 仓库里的具体文件路径），可以再替换为原版并在代码里补充准确 attribution。

参考：
- Galaxy 仓库说明（MIT）：https://github.com/uiverse-io/galaxy?tab=readme-ov-file

## 验收标准

1. 首页顶栏的目录按钮图标已替换，hover/focus 时有克制的动效  
2. 模式切换按钮的 sun/moon 图标已替换，hover/focus 时有克制的动效  
3. 浅色/深色模式下图标对比度正常（继承 `currentColor`）  
4. `prefers-reduced-motion: reduce` 时动效关闭  
5. `npm run build` 通过

