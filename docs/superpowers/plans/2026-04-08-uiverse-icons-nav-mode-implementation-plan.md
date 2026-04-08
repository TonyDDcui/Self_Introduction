# Uiverse Icon Swap (Menu + Mode Toggle) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保持现有 Claude 顶栏按钮外观不变的前提下，将 `TocMenu`（Menu）与 `ModeToggle`（Sun/Moon）替换为更有设计感的 SVG 图标，并加入克制的图标动效（支持 reduced motion）。

**Architecture:** 仅替换 React 组件内联 SVG 与对应 CSS module 动效；按钮容器样式不变；图标颜色继承 `currentColor`，避免浅/深模式适配问题。

**Tech Stack:** Next.js 14 App Router, React, TypeScript, CSS Modules

---

## Files to touch (map)

**Modify:**
- `src/components/nav/TocMenu.tsx` — 替换 `MenuIcon()` SVG，增加 `data-` 属性便于 CSS 动效
- `src/components/nav/TocMenu.module.css` — 为 `.icon svg` 增加 hover/focus 动效（克制）
- `src/components/theme/ModeToggle.tsx` — 替换 `SunIcon()` / `MoonIcon()` SVG，增加 `data-` 属性
- `src/components/theme/ModeToggle.module.css` — 为 `.icon svg` 增加 hover/focus + 切换瞬间动效

**Add (optional but recommended for attribution):**
- `src/components/ui/UiverseAttribution.tsx`（或 `docs/ATTRIBUTION.md`）— 记录来源链接（MIT）与作者名（仅文档级，不影响运行时）

**Docs already done:**
- `docs/superpowers/specs/2026-04-08-uiverse-icons-nav-mode-design.md`

---

### Task 1: Add minimal icon motion plumbing (CSS-first)

**Files:**
- Modify: `src/components/nav/TocMenu.tsx`
- Modify: `src/components/theme/ModeToggle.tsx`

- [ ] **Step 1: Add stable selectors for CSS animation**

Update `TocMenu.tsx` so the SVG root has a stable attribute:

```tsx
function MenuIcon() {
  return (
    <svg
      data-uiverse-icon="gagan-gv-menu"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* paths updated in Task 2 */}
    </svg>
  );
}
```

Update `ModeToggle.tsx` so both icons have stable attributes:

```tsx
function SunIcon() {
  return (
    <svg
      data-uiverse-icon="RiccardoRapelli-sun"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* paths updated in Task 3 */}
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/nav/TocMenu.tsx src/components/theme/ModeToggle.tsx
git commit -m "chore: add icon hooks for uiverse motion"
```

---

### Task 2: Replace TocMenu MenuIcon SVG + add subtle motion (gagan-gv style)

**Files:**
- Modify: `src/components/nav/TocMenu.tsx`
- Modify: `src/components/nav/TocMenu.module.css`

- [ ] **Step 1: Replace the SVG paths (editorial hamburger)**

Use a rounded 3-line icon with slight asymmetry:

```tsx
function MenuIcon() {
  return (
    <svg
      data-uiverse-icon="gagan-gv-menu"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.line1} d="M5 7.25h14" />
      <path className={styles.line2} d="M5 12h14" />
      <path className={styles.line3} d="M5 16.75h10.5" />
    </svg>
  );
}
```

- [ ] **Step 2: Add hover/focus motion to the SVG**

Append to `TocMenu.module.css`:

```css
.icon svg {
  transition: transform 180ms var(--motion-ease-out), opacity 180ms var(--motion-ease-out);
  transform-origin: 50% 50%;
}

.button:hover .icon svg,
.button:focus-visible .icon svg {
  transform: translateY(-0.5px) rotate(-6deg);
}

.line1,
.line2,
.line3 {
  transition: transform 200ms var(--motion-ease-out);
  transform-origin: 6px 12px;
}

.button:hover .line1,
.button:focus-visible .line1 {
  transform: translateX(0.3px);
}
.button:hover .line2,
.button:focus-visible .line2 {
  transform: translateX(-0.2px);
}
.button:hover .line3,
.button:focus-visible .line3 {
  transform: translateX(0.6px);
}

@media (prefers-reduced-motion: reduce) {
  .icon svg,
  .line1,
  .line2,
  .line3 {
    transition: none !important;
    transform: none !important;
  }
}
```

- [ ] **Step 3: Run quick build**

Run: `npm run build`  
Expected: success (warnings ok)

- [ ] **Step 4: Commit**

```bash
git add src/components/nav/TocMenu.tsx src/components/nav/TocMenu.module.css
git commit -m "feat: update toc menu icon with subtle motion"
```

---

### Task 3: Replace ModeToggle Sun/Moon SVG + add subtle motion (RiccardoRapelli style)

**Files:**
- Modify: `src/components/theme/ModeToggle.tsx`
- Modify: `src/components/theme/ModeToggle.module.css`

- [ ] **Step 1: Replace SunIcon / MoonIcon paths**

Sun: 更干净的圆 + 光芒；Moon：更利落的弯月切口。

```tsx
function SunIcon() {
  return (
    <svg
      data-uiverse-icon="RiccardoRapelli-sun"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle className={styles.core} cx="12" cy="12" r="3.6" />
      <path className={styles.rays} d="M12 2.4v2.2M12 19.4v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      data-uiverse-icon="RiccardoRapelli-moon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.moon} d="M21 13.2A8.6 8.6 0 0 1 10.8 3.1a7.1 7.1 0 1 0 10.2 10.1z" />
    </svg>
  );
}
```

- [ ] **Step 2: Add hover + toggle feedback motion**

Append to `ModeToggle.module.css`:

```css
.icon svg {
  transition: transform 180ms var(--motion-ease-out), opacity 180ms var(--motion-ease-out);
  transform-origin: 50% 50%;
}

.button:hover .icon svg,
.button:focus-visible .icon svg {
  transform: translateY(-0.5px);
}

.core,
.rays,
.moon {
  transform-origin: 50% 50%;
  transition: transform 220ms var(--motion-ease-out), opacity 220ms var(--motion-ease-out);
}

/* sun “breath” */
.button:hover .core,
.button:focus-visible .core {
  transform: scale(1.06);
}
.button:hover .rays,
.button:focus-visible .rays {
  transform: scale(1.04);
  opacity: 0.95;
}

/* moon “tilt” */
.button[aria-pressed="true"]:hover .moon,
.button[aria-pressed="true"]:focus-visible .moon {
  transform: rotate(-10deg);
}

@media (prefers-reduced-motion: reduce) {
  .icon svg,
  .core,
  .rays,
  .moon {
    transition: none !important;
    transform: none !important;
  }
}
```

- [ ] **Step 3: Run tests**

Run: `npm test`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/theme/ModeToggle.tsx src/components/theme/ModeToggle.module.css
git commit -m "feat: update mode toggle icons with subtle motion"
```

---

### Task 4: Attribution (docs) + final verification + push

**Files:**
- Modify (optional): `README.md` or add `docs/ATTRIBUTION.md`

- [ ] **Step 1: Add attribution note**

Add a short note with links:
- Galaxy repo (MIT)
- 用户指定作者 profile 链接（若可用）

- [ ] **Step 2: Final verify**

Run:
```bash
npm run build
```

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Self-review checklist (spec coverage)

- [x] 保持按钮容器样式不变（仅 SVG + 少量 CSS）→ Task 2/3
- [x] Menu: gagan-gv 风格 + 克制动效 → Task 2
- [x] Mode: RiccardoRapelli 风格 + 克制动效 → Task 3
- [x] Reduced motion 支持 → Task 2/3
- [x] Build/test 验证与提交推送 → Task 2/3/4

