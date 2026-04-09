# Home Glasswing + EdgeFn Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Home 移除 Activity、Hero 去掉蒙版，并在 About 实现“蒙版随滚动扩展为背景”的 Glasswing 效果（纸质纹理）；同时修复新增照片后 AI 配文偶发 EDGEFN_EMPTY_RESPONSE。

**Architecture:** UI 侧新增一个 client component 监听滚动，计算滚动进度写入 CSS 变量驱动蒙版扩展；AI 侧增强 EdgeFn 响应解析兼容性，并在多模态空响应时自动回退到纯文本重试。

**Tech Stack:** Next.js App Router、React（client component）、CSS Modules、Neon Postgres、EdgeFn（OpenAI-like）

---

## Files touched

**Create**
- `src/components/sections/GlasswingExpand.tsx`
- `src/components/sections/GlasswingExpand.module.css`

**Modify**
- `app/page.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/About.tsx`
- `src/lib/ai/edgefn.ts`
- `src/lib/gallery/photoNarratives.ts`

---

### Task 1: Home 移除 Activity 模块

**Files**
- Modify: `app/page.tsx`

- [ ] Step 1: 删除 `Activity` import 与 `<Activity />` 渲染
- [ ] Step 2: Build 验证

Run: `npm run build`  
Expected: success

- [ ] Step 3: Commit

```bash
git add app/page.tsx
git commit -m "ui(home): remove activity section"
```

---

### Task 2: Hero 去掉蒙版

**Files**
- Modify: `src/components/sections/Hero.tsx`

- [ ] Step 1: 移除 `SectionGlass` 包裹与 import（保留原 `.hero` / `.inner` 结构）
- [ ] Step 2: Build

Run: `npm run build`  
Expected: success

- [ ] Step 3: Commit

```bash
git add src/components/sections/Hero.tsx
git commit -m "ui(home): remove hero glass mask"
```

---

### Task 3: About 实现 GlasswingExpand（纸质纹理）

**Files**
- Create: `src/components/sections/GlasswingExpand.tsx`
- Create: `src/components/sections/GlasswingExpand.module.css`
- Modify: `src/components/sections/About.tsx`

- [ ] Step 1: 创建 `GlasswingExpand.tsx`（client）

核心逻辑（示例）：

```ts
"use client";
import { useEffect, useRef } from "react";
import styles from "./GlasswingExpand.module.css";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function GlasswingExpand(props: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) {
      el.style.setProperty("--gw-p", "0");
      return;
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // start: element top enters 70% viewport; end: reaches 10% viewport
        const start = vh * 0.7;
        const end = vh * 0.1;
        const p = clamp01((start - r.top) / (start - end));
        el.style.setProperty("--gw-p", String(p));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className={styles.wrap}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}
```

- [ ] Step 2: 创建 `GlasswingExpand.module.css`

关键点：
- `.wrap` relative
- `.backdrop` 用 `position: sticky; top: var(--nav-height, 0px); height: 70vh~100vh;`
- 使用 `--gw-p` 驱动：
  - `transform: scaleX(calc(0.92 + 0.08 * var(--gw-p)))`
  - `border-radius: calc(18px - 18px * var(--gw-p))`
  - 纸质纹理：使用内联 SVG noise + 纤维方向 repeating-linear-gradient（opacity 低）
- 移动端初始 92% 宽度：通过 scaleX 或 max-width + margin 实现（保证两侧留白）

- [ ] Step 3: `About.tsx` 用 `GlasswingExpand` 替换 `SectionGlass`

```tsx
import GlasswingExpand from "./GlasswingExpand";
// ...
<section ...>
  <GlasswingExpand>
    <div className={styles.inner}>...</div>
  </GlasswingExpand>
</section>
```

- [ ] Step 4: Build

Run: `npm run build`  
Expected: success

- [ ] Step 5: Commit

```bash
git add src/components/sections/GlasswingExpand.tsx src/components/sections/GlasswingExpand.module.css src/components/sections/About.tsx
git commit -m "ui(home): glasswing expand backdrop for about"
```

---

### Task 4: EdgeFn 空响应修复（解析 + 回退重试）

**Files**
- Modify: `src/lib/ai/edgefn.ts`
- Modify: `src/lib/gallery/photoNarratives.ts`

- [ ] Step 1: `edgefn.ts` 增强解析

实现点：
- `extractTextFromUnknownContent()` 支持 object
- `extractChatContent()` 尝试从 message 对象的多字段取值（content/output_text/text/final，必要时再兜底 reasoning*）

- [ ] Step 2: `photoNarratives.ts` 多模态空响应回退

在 image_url 尝试 catch 中：
- 若错误是 `EDGEFN_EMPTY_RESPONSE*`，也走“回退纯文本重试”

- [ ] Step 3: Build

Run: `npm run build`  
Expected: success

- [ ] Step 4: Commit

```bash
git add src/lib/ai/edgefn.ts src/lib/gallery/photoNarratives.ts
git commit -m "fix(ai): handle edgefn empty response and retry text-only"
```

---

### Task 5: Push 上线

- [ ] Step 1: Push

Run: `git push origin main`

