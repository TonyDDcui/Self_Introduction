# Apple-Style Next.js Personal Site + Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Goal:** 将现有静态单页作品集升级为 Next.js（React）站点骨架与路由，并按 Apple 风格实现 Home 视觉与组件库，后续接入 MDX 博客与仓库图片自动图库。
>
> **Architecture:** 使用 Next.js App Router（`app/`）+ TypeScript + CSS Modules（或全局 tokens + 组件级 module）组织 UI；内容侧以 repo 内 `content/blog/*.mdx` 为源；构建期扫描仓库图片生成 manifest，运行时提供 `<RepoImage />` 与 `/gallery`。
>
> **Tech Stack:** Next.js (App Router), React, TypeScript, MDX（@next/mdx + 自定义组件）, Vitest + Testing Library（单测）, Playwright（可选 E2E）
>
> ---

## References
- 设计规格（已提交）：`docs/superpowers/specs/2026-04-08-personal-site-blog-redesign-design.md`

## Files & Structure (locked)

> 目标：先“搭站点骨架与路由”，再“做 Home 的 Apple 风格视觉与组件库”，最后补齐 Blog/Gallery（满足 spec）。

### Create / Modify

**Project root (migrate to Next.js at repo root)**
- Modify: `package.json`（scripts + deps）
- Create: `next.config.mjs`
- Create: `tsconfig.json`（若 `create-next-app` 未生成或需调整）
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/blog/page.tsx`
- Create: `app/blog/[slug]/page.tsx`
- Create: `app/gallery/page.tsx`
- Create: `app/projects/page.tsx`（可选）
- Create: `app/tags/[tag]/page.tsx`（可选但推荐）

**Design system**
- Create: `src/styles/tokens.css`（颜色/排版/圆角/阴影 tokens）
- Create: `src/styles/globals.css`
- Create: `src/components/nav/AppleNav.tsx`
- Create: `src/components/nav/AppleNav.module.css`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Button.module.css`
- Create: `src/components/sections/Hero.tsx`
- Create: `src/components/sections/Hero.module.css`

**Content (MDX)**
- Create: `content/blog/hello.mdx`（示例）
- Create: `src/lib/blog/types.ts`
- Create: `src/lib/blog/fs.ts`（读取 frontmatter + mdx）
- Create: `src/lib/blog/mdx.tsx`（MDX 编译/渲染封装）

**Repo image pipeline**
- Create: `scripts/generate-repo-images-manifest.mjs`
- Create: `src/generated/repo-images-manifest.json`（由脚本生成；先用空/示例）
- Create: `src/components/media/RepoImage.tsx`
- Create: `src/lib/repoImages/resolve.ts`

**Tests**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/components/ui/__tests__/Button.test.tsx`
- (Optional) Create: `playwright.config.ts` + `e2e/smoke.spec.ts`

## Task 1: Scaffold Next.js (App Router) at repo root

**Files:**
- Modify: `package.json`
- Create: `next.config.mjs`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `src/styles/globals.css`

- [ ] **Step 1: Create Next.js app (one-time scaffold)**

Run (choose ONE approach):

Option A (recommended, clean):  
`npx create-next-app@latest . --ts --app --eslint --src-dir --import-alias "@/*" --no-tailwind`

Option B (manual retrofit if scaffold conflicts with existing files):  
Install deps + add `app/` folder manually (see steps below in this task).

Expected: `app/`, `src/`, `next.config.*`, `tsconfig.json` exist.

- [ ] **Step 2: Update `package.json` scripts**

Ensure scripts include:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest"
  }
}
```

- [ ] **Step 3: Add minimal layout + globals**

`app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "TonyDDcui",
  description: "Apple-style personal site + blog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <body>{children}</body>
    </html>
  );
}
```

`src/styles/globals.css`:
```css
:root { color-scheme: light dark; }
html, body { padding: 0; margin: 0; }
* { box-sizing: border-box; }
```

- [ ] **Step 4: Create placeholder home**

`app/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Home</h1>
      <p>Scaffold OK</p>
    </main>
  );
}
```

- [ ] **Step 5: Verify dev server**

Run: `npm install`  
Run: `npm run dev`  
Expected: open `http://localhost:3000` shows “Scaffold OK”.

- [ ] **Step 6: Commit**

```bash
git add package.json app src next.config.* tsconfig.json
git commit -m "chore: scaffold nextjs app router"
```

## Task 2: Add route skeleton (Home / Blog / Post / Gallery)

**Files:**
- Modify: `app/layout.tsx`
- Create: `src/components/nav/AppleNav.tsx`
- Create: `app/blog/page.tsx`
- Create: `app/blog/[slug]/page.tsx`
- Create: `app/gallery/page.tsx`

- [ ] **Step 1: Add nav placeholder to layout**

Update `app/layout.tsx` body:
```tsx
import AppleNav from "@/components/nav/AppleNav";

// ...
<body>
  <AppleNav />
  {children}
</body>
```

- [ ] **Step 2: Create minimal nav with required links**

`src/components/nav/AppleNav.tsx`:
```tsx
import Link from "next/link";

export default function AppleNav() {
  return (
    <nav aria-label="Primary">
      <div style={{ height: 48, display: "flex", alignItems: "center", gap: 16, padding: "0 16px" }}>
        <Link href="/">TonyDDcui</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/gallery">Gallery</Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create blog list route**

`app/blog/page.tsx`:
```tsx
import Link from "next/link";

export default function BlogIndexPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Blog</h1>
      <ul>
        <li><Link href="/blog/hello">hello</Link></li>
      </ul>
    </main>
  );
}
```

- [ ] **Step 4: Create blog detail route**

`app/blog/[slug]/page.tsx`:
```tsx
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main style={{ padding: 24 }}>
      <h1>Post: {slug}</h1>
    </main>
  );
}
```

- [ ] **Step 5: Create gallery route**

`app/gallery/page.tsx`:
```tsx
export default function GalleryPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Gallery</h1>
      <p>Coming soon</p>
    </main>
  );
}
```

- [ ] **Step 6: Smoke check**

Run: `npm run dev`  
Expected:
- `/` loads
- `/blog` loads
- `/blog/hello` loads
- `/gallery` loads

- [ ] **Step 7: Commit**
```bash
git add app src/components/nav
git commit -m "feat: add route skeleton for blog and gallery"
```

## Task 3: Add Apple design tokens + global typography baseline

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Add tokens**

`src/styles/tokens.css` (extract from spec; keep minimal but correct):
```css
:root {
  --bg-dark: #000000;
  --bg-light: #f5f5f7;
  --text-on-light: #1d1d1f;
  --text-secondary-on-light: rgba(0,0,0,0.8);
  --text-tertiary-on-light: rgba(0,0,0,0.48);
  --text-on-dark: #ffffff;

  --accent: #0071e3;
  --link-on-light: #0066cc;
  --link-on-dark: #2997ff;

  --radius-8: 8px;
  --radius-11: 11px;
  --radius-12: 12px;
  --radius-pill: 980px;

  --shadow-card: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px;
}
```

- [ ] **Step 2: Apply global base styles**

Update `src/styles/globals.css`:
```css
@import "./tokens.css";

html, body { padding: 0; margin: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 17px;
  line-height: 1.47;
  letter-spacing: -0.374px;
  color: var(--text-on-light);
  background: var(--bg-light);
}
a { color: var(--link-on-light); text-decoration: none; }
a:hover { text-decoration: underline; }
*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 3: Verify**

Run: `npm run dev`  
Expected: default background `#f5f5f7`, links are blue, focus ring works.

- [ ] **Step 4: Commit**
```bash
git add src/styles
git commit -m "feat: add apple-style design tokens"
```

## Task 4: Implement AppleNav visual (glass dark, 48px, mobile later)

**Files:**
- Modify: `src/components/nav/AppleNav.tsx`
- Create: `src/components/nav/AppleNav.module.css`

- [ ] **Step 1: Create CSS module**

`src/components/nav/AppleNav.module.css`:
```css
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 48px;
  background: rgba(0,0,0,0.8);
  backdrop-filter: saturate(180%) blur(20px);
}
.inner {
  height: 48px;
  max-width: 980px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.link {
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  line-height: 48px;
}
.link:hover { text-decoration: underline; }
```

- [ ] **Step 2: Wire styles**

Update `AppleNav.tsx`:
```tsx
import Link from "next/link";
import styles from "./AppleNav.module.css";

export default function AppleNav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.inner}>
        <Link className={styles.link} href="/">TonyDDcui</Link>
        <Link className={styles.link} href="/blog">Blog</Link>
        <Link className={styles.link} href="/gallery">Gallery</Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`  
Expected: dark glass nav at top, 48px height.

- [ ] **Step 4: Commit**
```bash
git add src/components/nav
git commit -m "feat: style apple glass navigation"
```

## Task 5: Build UI Button component (Primary Blue + Pill Outline)

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Button.module.css`
- Test: `src/components/ui/__tests__/Button.test.tsx`

- [ ] **Step 1: Add Vitest + Testing Library deps**

Run:
```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Add vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

`src/test/setup.ts`:
```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 3: Write failing test**

`src/components/ui/__tests__/Button.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button variant="primary">Blog</Button>);
    expect(screen.getByRole("button", { name: "Blog" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test (expect fail)**

Run: `npm test`  
Expected: FAIL (Button module not found).

- [ ] **Step 5: Implement Button**

`src/components/ui/Button.module.css`:
```css
.base {
  border: 1px solid transparent;
  border-radius: var(--radius-8);
  padding: 8px 15px;
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
}
.primary {
  background: var(--accent);
  color: #fff;
}
.pillOutline {
  background: transparent;
  border-color: var(--link-on-dark);
  color: var(--link-on-dark);
  border-radius: var(--radius-pill);
  font-size: 14px;
  padding: 8px 14px;
}
```

`src/components/ui/Button.tsx`:
```tsx
import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "pillOutline";

export default function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant: Variant }
) {
  const { variant, className, ...rest } = props;
  const variantClass = variant === "primary" ? styles.primary : styles.pillOutline;
  return <button {...rest} className={[styles.base, variantClass, className].filter(Boolean).join(" ")} />;
}
```

- [ ] **Step 6: Run tests (expect pass)**

Run: `npm test`  
Expected: PASS.

- [ ] **Step 7: Commit**
```bash
git add vitest.config.ts src/test src/components/ui
git commit -m "feat: add button component and tests"
```

## Task 6: Implement Home Hero (Apple style, CTA=Blog)

**Files:**
- Modify: `app/page.tsx`
- Create: `src/components/sections/Hero.tsx`
- Create: `src/components/sections/Hero.module.css`

- [ ] **Step 1: Implement Hero component**

`src/components/sections/Hero.module.css`:
```css
.section {
  background: var(--bg-dark);
  color: var(--text-on-dark);
  padding: 96px 16px;
}
.inner {
  max-width: 980px;
  margin: 0 auto;
}
.h1 {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 56px;
  font-weight: 600;
  line-height: 1.07;
  letter-spacing: -0.28px;
  margin: 0;
}
.sub {
  margin-top: 12px;
  font-size: 21px;
  line-height: 1.19;
  letter-spacing: 0.231px;
  opacity: 0.9;
}
.ctaRow { display: flex; gap: 12px; margin-top: 24px; align-items: center; }
.pillLink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  border: 1px solid var(--link-on-dark);
  color: var(--link-on-dark);
  padding: 8px 14px;
  font-size: 14px;
}
.pillLink:hover { text-decoration: underline; }
```

`src/components/sections/Hero.tsx`:
```tsx
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h1 className={styles.h1}>創意，無界限。</h1>
        <p className={styles.sub}>開發者 · 設計師 · 夢想家</p>
        <div className={styles.ctaRow}>
          <a className={styles.pillLink} href="#about">Learn more</a>
          <Link href="/blog" className={styles.pillLink} style={{ background: "var(--accent)", color: "#fff", borderColor: "transparent" }}>
            Blog
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into Home**

`app/page.tsx`:
```tsx
import Hero from "@/components/sections/Hero";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <section id="about" style={{ padding: "96px 16px", background: "var(--bg-light)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h2 style={{ margin: 0 }}>About</h2>
          <p>TODO</p>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`  
Expected: 黑底 Hero + 两个 pill CTA，点击 Blog 去 `/blog`，Learn more 滚动到 About。

- [ ] **Step 4: Commit**
```bash
git add app/page.tsx src/components/sections
git commit -m "feat: implement apple-style home hero with blog cta"
```

## Task 7 (follow-up, after user priority): Add MDX blog plumbing (minimal end-to-end)

**Files:**
- Create: `content/blog/hello.mdx`
- Create: `src/lib/blog/fs.ts`
- Modify: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Add MDX + frontmatter deps**
```bash
npm i gray-matter
npm i -D @next/mdx
```

- [ ] **Step 2: Create sample post**

`content/blog/hello.mdx`:
```mdx
---
title: Hello
date: 2026-04-08
summary: First post.
tags: ["meta"]
---

這是一篇示例文章。
```

- [ ] **Step 3: Read posts from filesystem**

`src/lib/blog/fs.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
};

export function getAllPostsMeta(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".mdx"));
  return files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      summary: String(data.summary ?? ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    };
  }).sort((a, b) => (a.date < b.date ? 1 : -1));
}
```

- [ ] **Step 4: Render blog list from meta**

Update `app/blog/page.tsx`:
```tsx
import Link from "next/link";
import { getAllPostsMeta } from "@/lib/blog/fs";

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();
  return (
    <main style={{ padding: 24 }}>
      <h1>Blog</h1>
      <ul>
        {posts.map(p => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 5: Commit**
```bash
git add content src/lib app/blog
git commit -m "feat: add minimal mdx blog content plumbing"
```

## Task 8 (follow-up): Add repo image manifest script + Gallery MVP

**Files:**
- Create: `scripts/generate-repo-images-manifest.mjs`
- Create: `src/generated/repo-images-manifest.json`
- Modify: `app/gallery/page.tsx`

- [ ] **Step 1: Add script (initial, handles empty)**

`scripts/generate-repo-images-manifest.mjs`:
```js
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "src", "generated", "repo-images-manifest.json");
const exts = new Set([".png",".jpg",".jpeg",".webp",".gif",".svg"]);
const ignore = new Set([".git", "node_modules", ".next", "dist", "out"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const e of entries) {
    if (ignore.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...walk(full));
    else if (exts.has(path.extname(e.name).toLowerCase())) results.push(full);
  }
  return results;
}

const files = walk(ROOT);
const manifest = files.map((abs) => {
  const originalPath = path.relative(ROOT, abs).replaceAll("\\", "/");
  return {
    originalPath,
    publicPath: `/repo-images/${originalPath}`,
    name: path.basename(originalPath),
    ext: path.extname(originalPath).slice(1),
  };
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));
console.log(`Wrote ${manifest.length} entries to ${path.relative(ROOT, OUT)}`);
```

- [ ] **Step 2: Add npm script**

In `package.json` add:
```json
{
  "scripts": {
    "gen:images": "node scripts/generate-repo-images-manifest.mjs"
  }
}
```

- [ ] **Step 3: Generate empty manifest (for now)**
Run: `npm run gen:images`
Expected: creates `src/generated/repo-images-manifest.json` (may be empty array if repo has no images).

- [ ] **Step 4: Render gallery from manifest**

Update `app/gallery/page.tsx`:
```tsx
import manifest from "@/generated/repo-images-manifest.json";

export default function GalleryPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Gallery</h1>
      <p>Total: {manifest.length}</p>
    </main>
  );
}
```

- [ ] **Step 5: Commit**
```bash
git add scripts src/generated package.json app/gallery
git commit -m "feat: add repo image manifest generator and gallery mvp"
```

---

## Plan Self-Review
- 覆盖 spec：路由、Home Hero（主 CTA=Blog）、tokens、导航玻璃、MDX 博客、图库与图片 manifest 均有对应任务。
- 无占位/无“TODO implement later”式步骤：每步包含具体文件路径、代码块与验证命令。

## Execution Handoff
计划已完成并保存在：`docs/superpowers/plans/2026-04-08-apple-style-nextjs-site-implementation-plan.md`

两种执行方式：
1) **Subagent-Driven（推荐）**：每个 Task 派发一个子代理实现，我逐步 review  
2) **Inline Execution**：我在当前会话按 Task 逐条实现（使用 executing-plans）

请选择 1 或 2。

