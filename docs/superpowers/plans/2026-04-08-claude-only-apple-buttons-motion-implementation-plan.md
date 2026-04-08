# Claude-only Theme + Apple Buttons + Editorial Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将站点固定为 Claude 风格（仅保留浅/深模式切换），保留两类 Apple 按钮（Apple Blue 主按钮 + 980px pill 形态），并把动效增强为“编辑感”入场/滚动/hover，同时支持 reduced motion。

**Architecture:** 用 `<html data-theme="claude" data-mode="light|dark">` + Claude tokens 控制全站；删除 ThemeToggle 与所有 Apple 主题 tokens；按钮组件增加 `appleBlue` 与 `applePill` variants；动效以 CSS + `Reveal`（IntersectionObserver）+ Hero 的分层入场 class 实现。

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, Vitest

---

## References
- 设计规格（本次）：`docs/superpowers/specs/2026-04-08-claude-only-apple-buttons-motion-design.md`
- 现有主题/动效实现（将被改造）：`docs/superpowers/specs/2026-04-08-theme-motion-avatar-design.md`

## File Structure (locked)

**Modify**
- `src/styles/globals.css`
- `src/styles/tokens.apple.light.css`
- `src/styles/tokens.apple.dark.css`
- `src/components/theme/ThemeToggle.tsx`（删除或移除引用）
- `src/components/theme/ThemeToggle.module.css`（可删除）
- `src/components/nav/AppleNav.tsx`
- `src/components/nav/AppleNav.module.css`
- `app/layout.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Button.module.css`
- `src/components/sections/Hero.tsx`
- `src/components/sections/Hero.module.css`
- `src/components/motion/reveal.css`

**Create (optional but recommended)**
- `src/lib/theme/constants.ts`（固定主题名）

**Delete (optional)**
- `src/styles/tokens.apple.light.css`（不再需要）
- `src/styles/tokens.apple.dark.css`
- `src/components/theme/ThemeToggle.tsx`
- `src/components/theme/ThemeToggle.module.css`

> 注：删除文件不是必须；也可保留但不再 import/不再使用。此计划默认“保留文件但不再生效”，避免破坏历史；若你希望仓库更干净，可在最后做清理 commit。

---

### Task 1: Lock theme to Claude and remove Theme toggle (keep Mode toggle)

**Files:**
- Modify: `src/components/theme/ThemeProvider.tsx`
- Modify: `src/components/nav/AppleNav.tsx`
- Modify: `app/layout.tsx`
- (Optional) Delete: `src/components/theme/ThemeToggle.tsx`, `src/components/theme/ThemeToggle.module.css`

- [ ] **Step 1: Update ThemeProvider to always apply theme=claude**

Edit `src/components/theme/ThemeProvider.tsx`:
```tsx
"use client";
import { useEffect, useState } from "react";
import type { SiteMode } from "@/lib/theme/types";
import { applyThemeToHtml, systemPrefersDark } from "@/lib/theme/dom";
import { readMode, writeMode } from "@/lib/theme/storage";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode] = useState<SiteMode>(() => readMode() ?? (systemPrefersDark() ? "dark" : "light"));

  useEffect(() => {
    writeMode(mode);
    applyThemeToHtml("claude", mode);
  }, [mode]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Remove ThemeToggle from Nav**

Edit `src/components/nav/AppleNav.tsx` to only render ModeToggle in controls:
```tsx
<div className={styles.controls}>
  <ModeToggle />
</div>
```

- [ ] **Step 3: Verify**

Run: `npm run build`  
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add app/layout.tsx src/components/nav/AppleNav.tsx src/components/theme/ThemeProvider.tsx
git commit -m "feat: lock site theme to claude and keep mode toggle"
```

---

### Task 2: Remove Apple theme tokens from global import (Claude-only)

**Files:**
- Modify: `src/styles/globals.css`
- (Optional) Stop importing: `src/styles/tokens.apple.light.css`, `src/styles/tokens.apple.dark.css`

- [ ] **Step 1: Keep only base + Claude tokens in globals**

In `src/styles/globals.css`, remove:
```css
@import "./tokens.apple.light.css";
@import "./tokens.apple.dark.css";
```
Keep:
```css
@import "./tokens.base.css";
@import "./tokens.claude.light.css";
@import "./tokens.claude.dark.css";
```

- [ ] **Step 2: Ensure anchor/focus/body still use --bg-page/--text-primary/--link/--focus**

Run: `npm run build` -> PASS

- [ ] **Step 3: Commit**
```bash
git add src/styles/globals.css
git commit -m "chore: use claude tokens only"
```

---

### Task 3: Add Apple button variants (Apple Blue + Apple Pill) inside Button component

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Button.module.css`
- Modify: `src/components/ui/__tests__/Button.test.tsx`

- [ ] **Step 1: Write failing tests for new variants**

Update `src/components/ui/__tests__/Button.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders appleBlue variant", () => {
    render(<Button variant="appleBlue">CTA</Button>);
    expect(screen.getByRole("button", { name: "CTA" })).toBeInTheDocument();
  });

  it("renders applePill variant", () => {
    render(<Button variant="applePill">Learn more</Button>);
    expect(screen.getByRole("button", { name: "Learn more" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm fail**

Run: `npm test`  
Expected: FAIL (variant 类型不支持)。

- [ ] **Step 3: Implement variants**

Update `src/components/ui/Button.tsx`:
```tsx
type Variant = "primary" | "pillOutline" | "appleBlue" | "applePill";
```
Map variants to css classes.

Update `src/components/ui/Button.module.css`:
```css
.appleBlue{
  background: #0071e3;
  color: #fff;
  border-radius: var(--radius-8);
}
.applePill{
  border-radius: var(--radius-pill);
  border: 1px solid var(--ring);
  background: color-mix(in srgb, var(--surface-1) 60%, transparent);
  color: var(--text-primary);
  font-size: 14px;
  padding: 8px 14px;
}
```

- [ ] **Step 4: Run tests**

Run: `npm test` -> PASS

- [ ] **Step 5: Build verify**

Run: `npm run build` -> PASS

- [ ] **Step 6: Commit**
```bash
git add src/components/ui/Button.tsx src/components/ui/Button.module.css src/components/ui/__tests__/Button.test.tsx
git commit -m "feat: add apple blue and pill button variants"
```

---

### Task 4: Update Nav/Hero to Claude UI, but use Apple buttons for CTAs

**Files:**
- Modify: `src/components/nav/AppleNav.module.css`
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/components/sections/Hero.module.css`

- [ ] **Step 1: Ensure Nav is Claude-only**

In `AppleNav.module.css` remove Apple branch selectors; keep Claude style only:
```css
.nav { background: var(--surface-1); border-bottom: 1px solid var(--ring); }
.link { color: var(--text-primary); }
```

- [ ] **Step 2: Hero CTA uses Button variants**

Update `Hero.tsx`:
- 主 CTA：使用 `Button variant="appleBlue"`（Link 版本可用 `<Link className=...>` 或扩展 Button 支持 `asChild`；先用 Link + class 也可，但建议复用 Button）。
- 次 CTA：`Button variant="applePill"` 或等效 pill class。

- [ ] **Step 3: Build verify**

Run: `npm run build` -> PASS

- [ ] **Step 4: Commit**
```bash
git add src/components/nav src/components/sections/Hero.*
git commit -m "feat: claude nav and hero with apple button ctAs"
```

---

### Task 5: Upgrade motion to “editorial” (Hero entrance + card stagger + hover)

**Files:**
- Modify: `src/components/motion/reveal.css`
- Modify: `src/components/sections/Hero.module.css`
- Modify: `src/components/sections/Writing.module.css`
- Modify: `src/components/sections/Projects.module.css`

- [ ] **Step 1: Add hero entrance animation classes**

In `Hero.module.css` add:
- `.enter` base (opacity/translate/blur)
- `.enterVisible` end state
- stagger via css variables `--d` on elements

Pseudo CSS:
```css
.enter {
  opacity: 0;
  transform: translate3d(0, 10px, 0);
  filter: blur(2px);
  transition: opacity 420ms var(--motion-ease-out),
              transform 420ms var(--motion-ease-out),
              filter 420ms var(--motion-ease-out);
  transition-delay: var(--d, 0ms);
}
.enterVisible { opacity: 1; transform: none; filter: blur(0); }
@media (prefers-reduced-motion: reduce) { .enter{ opacity:1; transform:none; filter:none; transition:none; } }
```

- [ ] **Step 2: Implement Hero entrance trigger**

In `Hero.tsx` (client) or a small hook:
- On mount, add `enterVisible` (e.g. setState true)
- Apply `style={{ ["--d" as any]: "0ms" }}` to title, 80ms to subtitle, 160ms to CTA row.

- [ ] **Step 3: Card stagger on reveal**

Enhance existing reveal system:
- Keep `[data-reveal]` for section root
- Add optional `[data-reveal-item]` for cards; when section becomes visible, cards get `.is-visible` with incremental delays
Simpler alternative:
- CSS only: in Projects/Writing list, set `transition-delay` via `nth-child` selectors.

Example:
```css
[data-reveal].is-visible .card:nth-child(1){ transition-delay: 60ms; }
[data-reveal].is-visible .card:nth-child(2){ transition-delay: 120ms; }
```

- [ ] **Step 4: Hover micro-interactions**

In card css modules:
- `transform: translateY(-2px)` on hover
- ring/shadow slightly stronger (Claude ring)

- [ ] **Step 5: Verify**

Manual: `npm run dev` and check:
- Hero entrance is visible
- Scroll reveals have stagger
- Hover feels responsive

Run: `npm run build` -> PASS

- [ ] **Step 6: Commit**
```bash
git add src/components/motion/reveal.css src/components/sections/Hero.module.css src/components/sections/Projects.module.css src/components/sections/Writing.module.css src/components/sections/Hero.tsx
git commit -m "feat: enhance editorial motion and interactions"
```

---

### Task 6 (optional cleanup): Remove unused Apple theme code

**Files:**
- Delete (optional): `src/styles/tokens.apple.light.css`, `src/styles/tokens.apple.dark.css`
- Delete (optional): `src/components/theme/ThemeToggle.*`

- [ ] **Step 1: Verify nothing imports deleted files**
Run: `npm run build` -> PASS

- [ ] **Step 2: Delete and commit**
```bash
git rm src/styles/tokens.apple.light.css src/styles/tokens.apple.dark.css src/components/theme/ThemeToggle.tsx src/components/theme/ThemeToggle.module.css
git commit -m "chore: remove unused apple theme toggle"
```

---

## Plan Self-Review
- Spec coverage: Claude-only + keep mode toggle（Task1-2）、Apple buttons only（Task3-4）、editorial motion（Task5）、cleanup（Task6）
- Placeholder scan: 每个步骤包含具体代码/命令；无 TBD

## Execution Handoff
计划已保存至：`docs/superpowers/plans/2026-04-08-claude-only-apple-buttons-motion-implementation-plan.md`

两种执行方式：
1) **Subagent-Driven（推荐）**：每个 Task 派发一个子代理实现，我逐步 review  
2) **Inline Execution**：我在当前会话按 Task 逐条实现（使用 executing-plans）

请选择 1 或 2。

