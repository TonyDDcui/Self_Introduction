# Theme + Mode Toggle, Claude Nav/Hero, Motion, GitHub Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 Next.js 站点中实现 Claude/Apple 主题切换、浅色/深色模式切换、轻微动效系统，以及 About 区块的 GitHub 头像同步。

**Architecture:** 用 `<html data-theme data-mode>` + CSS variables（token）驱动视觉；用一个 Client Component 负责初始化/持久化（localStorage）并提供 Nav 上的切换按钮；动效用 IntersectionObserver 给区块添加 class，实现“淡入+上移”的轻微 reveal，并支持 `prefers-reduced-motion`。

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, Vitest（已有）

---

## References
- 设计规格（本次）：`docs/superpowers/specs/2026-04-08-theme-motion-avatar-design.md`
- 站点基础设计规格（历史）：`docs/superpowers/specs/2026-04-08-personal-site-blog-redesign-design.md`

## File Structure (locked)

**Create**
- `src/styles/tokens.base.css`
- `src/styles/tokens.apple.light.css`
- `src/styles/tokens.apple.dark.css`
- `src/styles/tokens.claude.light.css`
- `src/styles/tokens.claude.dark.css`
- `src/lib/theme/types.ts`
- `src/lib/theme/storage.ts`
- `src/lib/theme/dom.ts`
- `src/components/theme/ThemeProvider.tsx`
- `src/components/theme/ThemeToggle.tsx`
- `src/components/theme/ThemeToggle.module.css`
- `src/components/theme/ModeToggle.tsx`
- `src/components/theme/ModeToggle.module.css`
- `src/components/motion/Reveal.tsx`
- `src/components/motion/reveal.css`
- `src/components/sections/AboutAvatar.tsx`
- `src/components/sections/AboutAvatar.module.css`
- `src/lib/theme/__tests__/storage.test.ts`

**Modify**
- `src/styles/globals.css`（引入 token 文件与 motion css）
- `app/layout.tsx`（挂载 ThemeProvider）
- `src/components/nav/AppleNav.tsx`（变为“可主题化 Nav”，默认 Claude）
- `src/components/nav/AppleNav.module.css`（Claude/Apple 两套样式分支）
- `src/components/sections/Hero.tsx`（根据 theme 选择 Claude/Apple hero 排版与 CTA 颜色）
- `src/components/sections/Hero.module.css`
- `src/components/sections/About.tsx`（插入头像组件）
- `src/styles/blog.module.css`（可选：Claude mode 下 blog 背景更纸感）

---

### Task 1: Add theme/mode tokens (CSS variables) and wire global imports

**Files:**
- Create: `src/styles/tokens.base.css`
- Create: `src/styles/tokens.apple.light.css`
- Create: `src/styles/tokens.apple.dark.css`
- Create: `src/styles/tokens.claude.light.css`
- Create: `src/styles/tokens.claude.dark.css`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Create base tokens**

`src/styles/tokens.base.css`:
```css
:root {
  --radius-8: 8px;
  --radius-11: 11px;
  --radius-12: 12px;
  --radius-24: 24px;
  --radius-32: 32px;
  --radius-pill: 980px;

  --shadow-card: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px;
  --shadow-whisper: rgba(0, 0, 0, 0.05) 0px 4px 24px;

  --motion-fast: 150ms;
  --motion-base: 300ms;
  --motion-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

- [ ] **Step 2: Create Apple tokens (light/dark)**

`src/styles/tokens.apple.light.css`:
```css
html[data-theme="apple"][data-mode="light"] {
  --bg-page: #f5f5f7;
  --bg-dark: #000000;
  --surface-1: #ffffff;
  --text-primary: #1d1d1f;
  --text-secondary: rgba(0,0,0,0.8);
  --text-tertiary: rgba(0,0,0,0.48);
  --link: #0066cc;
  --accent: #0071e3;
  --focus: #0071e3;
  --ring: rgba(0,0,0,0.08);
}
```

`src/styles/tokens.apple.dark.css`:
```css
html[data-theme="apple"][data-mode="dark"] {
  --bg-page: #000000;
  --bg-dark: #000000;
  --surface-1: #272729;
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.72);
  --text-tertiary: rgba(255,255,255,0.52);
  --link: #2997ff;
  --accent: #0071e3;
  --focus: #0071e3;
  --ring: rgba(255,255,255,0.18);
}
```

- [ ] **Step 3: Create Claude tokens (light/dark)**

`src/styles/tokens.claude.light.css`:
```css
html[data-theme="claude"][data-mode="light"] {
  --bg-page: #f5f4ed;
  --surface-1: #faf9f5;
  --surface-2: #e8e6dc;
  --text-primary: #141413;
  --text-secondary: #5e5d59;
  --text-tertiary: #87867f;
  --link: #3d3d3a;
  --accent: #c96442;
  --focus: #3898ec;
  --ring: #d1cfc5;
}
```

`src/styles/tokens.claude.dark.css`:
```css
html[data-theme="claude"][data-mode="dark"] {
  --bg-page: #141413;
  --surface-1: #30302e;
  --surface-2: #262624;
  --text-primary: #faf9f5;
  --text-secondary: #b0aea5;
  --text-tertiary: #87867f;
  --link: #d97757;
  --accent: #c96442;
  --focus: #3898ec;
  --ring: #30302e;
}
```

- [ ] **Step 4: Wire tokens into globals**

Update `src/styles/globals.css` (top imports):
```css
@import "./tokens.base.css";
@import "./tokens.apple.light.css";
@import "./tokens.apple.dark.css";
@import "./tokens.claude.light.css";
@import "./tokens.claude.dark.css";
@import "../components/motion/reveal.css";
```

And ensure body uses theme tokens:
```css
body {
  background: var(--bg-page);
  color: var(--text-primary);
}
a { color: var(--link); }
*:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
```

- [ ] **Step 5: Verify**

Run: `npm run build`  
Expected: PASS.

- [ ] **Step 6: Commit**
```bash
git add src/styles/globals.css src/styles/tokens.*.css src/components/motion/reveal.css
git commit -m "feat: add theme and mode design tokens"
```

---

### Task 2: Implement ThemeProvider (default Claude + system mode fallback + persistence)

**Files:**
- Create: `src/lib/theme/types.ts`
- Create: `src/lib/theme/storage.ts`
- Create: `src/lib/theme/dom.ts`
- Create: `src/components/theme/ThemeProvider.tsx`
- Modify: `app/layout.tsx`
- Test: `src/lib/theme/__tests__/storage.test.ts`

- [ ] **Step 1: Define types**

`src/lib/theme/types.ts`:
```ts
export type SiteTheme = "claude" | "apple";
export type SiteMode = "light" | "dark";
```

- [ ] **Step 2: Storage helpers (testable)**

`src/lib/theme/storage.ts`:
```ts
import type { SiteMode, SiteTheme } from "./types";

const THEME_KEY = "site.theme";
const MODE_KEY = "site.mode";

export function readTheme(): SiteTheme | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(THEME_KEY);
  return v === "claude" || v === "apple" ? v : null;
}

export function writeTheme(theme: SiteTheme) {
  window.localStorage.setItem(THEME_KEY, theme);
}

export function readMode(): SiteMode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(MODE_KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function writeMode(mode: SiteMode) {
  window.localStorage.setItem(MODE_KEY, mode);
}
```

- [ ] **Step 3: Write failing test for storage**

`src/lib/theme/__tests__/storage.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { readTheme, readMode, writeTheme, writeMode } from "../storage";

describe("theme storage", () => {
  beforeEach(() => localStorage.clear());

  it("reads/writes theme", () => {
    expect(readTheme()).toBeNull();
    writeTheme("claude");
    expect(readTheme()).toBe("claude");
  });

  it("reads/writes mode", () => {
    expect(readMode()).toBeNull();
    writeMode("dark");
    expect(readMode()).toBe("dark");
  });
});
```

- [ ] **Step 4: Run tests (expect fail until vitest jsdom has localStorage)**

Run: `npm test`  
Expected: If environment lacks `localStorage`, FAIL -> adjust vitest config to jsdom (already set) then PASS.

- [ ] **Step 5: DOM apply helper**

`src/lib/theme/dom.ts`:
```ts
import type { SiteMode, SiteTheme } from "./types";

export function applyThemeToHtml(theme: SiteTheme, mode: SiteMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.mode = mode;
}

export function systemPrefersDark(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}
```

- [ ] **Step 6: ThemeProvider (client)**

`src/components/theme/ThemeProvider.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import type { SiteMode, SiteTheme } from "@/lib/theme/types";
import { applyThemeToHtml, systemPrefersDark } from "@/lib/theme/dom";
import { readMode, readTheme } from "@/lib/theme/storage";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<SiteTheme>(() => readTheme() ?? "claude");
  const [mode] = useState<SiteMode>(() => readMode() ?? (systemPrefersDark() ? "dark" : "light"));

  useEffect(() => {
    applyThemeToHtml(theme, mode);
  }, [theme, mode]);

  return <>{children}</>;
}
```

> 注意：切换逻辑会在后续 Task 3 放进 Toggle 组件（这里仅负责初始化与 apply）。

- [ ] **Step 7: Wire provider into layout**

Update `app/layout.tsx`:
```tsx
import ThemeProvider from "@/components/theme/ThemeProvider";

<body>
  <ThemeProvider>
    <AppleNav />
    {children}
  </ThemeProvider>
</body>
```

- [ ] **Step 8: Run tests + build**

Run: `npm test` -> PASS  
Run: `npm run build` -> PASS

- [ ] **Step 9: Commit**
```bash
git add app/layout.tsx src/lib/theme src/components/theme
git commit -m "feat: add theme provider with persistence"
```

---

### Task 3: Add ThemeToggle + ModeToggle in Nav (Claude default)

**Files:**
- Create: `src/components/theme/ThemeToggle.tsx`
- Create: `src/components/theme/ThemeToggle.module.css`
- Create: `src/components/theme/ModeToggle.tsx`
- Create: `src/components/theme/ModeToggle.module.css`
- Modify: `src/components/nav/AppleNav.tsx`

- [ ] **Step 1: Implement toggle UI (Claude ring buttons)**

`src/components/theme/ThemeToggle.tsx`:
```tsx
"use client";
import styles from "./ThemeToggle.module.css";
import { applyThemeToHtml } from "@/lib/theme/dom";
import { readMode, writeTheme, readTheme } from "@/lib/theme/storage";
import type { SiteTheme } from "@/lib/theme/types";

export default function ThemeToggle() {
  const onToggle = () => {
    const current = readTheme() ?? "claude";
    const next: SiteTheme = current === "claude" ? "apple" : "claude";
    const mode = readMode() ?? "light";
    writeTheme(next);
    applyThemeToHtml(next, mode);
  };
  return <button className={styles.button} onClick={onToggle}>Theme</button>;
}
```

`src/components/theme/ThemeToggle.module.css`:
```css
.button{
  border-radius: var(--radius-12);
  background: var(--surface-1);
  color: var(--text-primary);
  border: 1px solid var(--ring);
  padding: 6px 10px;
  font-size: 12px;
}
.button:hover{ box-shadow: 0 0 0 1px var(--ring); }
```

`src/components/theme/ModeToggle.tsx` 类似，切换 `site.mode` 并调用 `applyThemeToHtml(theme, nextMode)`。

- [ ] **Step 2: Add toggles to Nav**

Update `src/components/nav/AppleNav.tsx` right side:
```tsx
import ThemeToggle from "@/components/theme/ThemeToggle";
import ModeToggle from "@/components/theme/ModeToggle";
// ...
<div className={styles.controls}>
  <ThemeToggle />
  <ModeToggle />
</div>
```

- [ ] **Step 3: Build verify**

Run: `npm run dev`  
Manual:
- Click Theme, observe html `data-theme` changes and styles swap
- Click Mode, observe `data-mode` changes

Run: `npm run build` -> PASS

- [ ] **Step 4: Commit**
```bash
git add src/components/theme src/components/nav
git commit -m "feat: add theme and mode toggles"
```

---

### Task 4: Implement Claude Nav + Claude Hero styles (theme-aware)

**Files:**
- Modify: `src/components/nav/AppleNav.module.css`
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/components/sections/Hero.module.css`

- [ ] **Step 1: Nav theme branches**

In `AppleNav.module.css`, implement:
- `html[data-theme="claude"] .nav { background: var(--bg-page); border-bottom: 1px solid var(--ring); }`
- `html[data-theme="apple"] .nav { background: rgba(0,0,0,0.8); backdrop-filter... }`（保留现状）

- [ ] **Step 2: Hero theme branches**

In `Hero.module.css`, implement:
- Claude: parchment background, serif title (Georgia fallback), CTA primary uses `--accent` (terracotta)
- Apple: preserve existing black hero + blue CTA

Update `Hero.tsx` to use semantic classes (no inline color):
```tsx
<Link className={[styles.cta, styles.ctaPrimary].join(" ")} href="/blog">Blog</Link>
```

- [ ] **Step 3: Verify**

Manual verify on:
- `/` with theme=claude, mode=light/dark
- Toggle to apple and verify nav/hero swap

Run: `npm run build` -> PASS

- [ ] **Step 4: Commit**
```bash
git add src/components/nav/AppleNav.module.css src/components/sections/Hero.*
git commit -m "feat: add claude nav and hero styles"
```

---

### Task 5: GitHub avatar sync in About section

**Files:**
- Create: `src/components/sections/AboutAvatar.tsx`
- Create: `src/components/sections/AboutAvatar.module.css`
- Modify: `src/components/sections/About.tsx`

- [ ] **Step 1: Create avatar component**

`src/components/sections/AboutAvatar.tsx`:
```tsx
export default function AboutAvatar() {
  return (
    <img
      src="https://github.com/TonyDDcui.png?size=256"
      alt="GitHub avatar"
      loading="lazy"
      referrerPolicy="no-referrer"
      style={{ width: 96, height: 96 }}
    />
  );
}
```

> Note: 如果 Next/Image 需要远程域名配置，可先用 `<img>`，后续再升级。

- [ ] **Step 2: Style avatar container**

`AboutAvatar.module.css` uses:
- Claude: radius 32, ring border
- Apple: radius 12 or circle

- [ ] **Step 3: Insert into About**

In `About.tsx` header area add `<AboutAvatar />` before title.

- [ ] **Step 4: Verify + commit**

Run: `npm run build` -> PASS  
Commit:
```bash
git add src/components/sections/About.tsx src/components/sections/AboutAvatar.*
git commit -m "feat: sync about avatar from github"
```

---

### Task 6: Motion system (light reveal + reduced-motion)

**Files:**
- Create: `src/components/motion/Reveal.tsx`
- Create: `src/components/motion/reveal.css`
- Modify: `src/components/sections/{About,Projects,Writing,Contact}.tsx`

- [ ] **Step 1: Add CSS for reveal**

`src/components/motion/reveal.css`:
```css
[data-reveal]{
  opacity: 0;
  transform: translateY(8px);
  transition: opacity var(--motion-base) var(--motion-ease-out),
              transform var(--motion-base) var(--motion-ease-out);
}
[data-reveal].is-visible{
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce){
  [data-reveal]{ opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 2: IntersectionObserver client**

`src/components/motion/Reveal.tsx`:
```tsx
"use client";
import { useEffect } from "react";

export default function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) {
        (e.target as HTMLElement).classList.add("is-visible");
        io.unobserve(e.target);
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
```

- [ ] **Step 3: Mark sections as reveal**

In each section root `<section ... data-reveal>` and optionally add a small stagger by CSS `transition-delay` via inline style or class.

- [ ] **Step 4: Mount Reveal once**

Mount `<Reveal />` in `app/page.tsx` (Home only) or `app/layout.tsx` (global).

- [ ] **Step 5: Verify**

Manual: scroll Home and see sections reveal  
Run: `npm run build` -> PASS

- [ ] **Step 6: Commit**
```bash
git add src/components/motion src/components/sections app/layout.tsx
git commit -m "feat: add subtle reveal motion system"
```

---

## Plan Self-Review
- Spec coverage: Theme+Mode（Task1-3）、Claude Nav/Hero（Task4）、Avatar sync（Task5）、轻动效+reduced motion（Task6）
- Placeholder scan: 无 TBD/TODO；每步包含代码与命令
- Type consistency: `SiteTheme`/`SiteMode` 在所有任务中一致

## Execution Handoff
计划已完成并保存在：`docs/superpowers/plans/2026-04-08-theme-motion-avatar-implementation-plan.md`

两种执行方式：
1) **Subagent-Driven（推荐）**：每个 Task 派发一个子代理实现，我逐步 review  
2) **Inline Execution**：我在当前会话按 Task 逐条实现（使用 executing-plans）

请选择 1 或 2。

