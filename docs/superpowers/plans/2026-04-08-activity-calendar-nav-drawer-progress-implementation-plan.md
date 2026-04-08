# Activity Calendar + TOC Nav + Project Drawer + Reading Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Claude-only 站点中新增 Activity（GitHub 贡献日历，日更缓存）并增加三项交互：顶栏目录导航、Projects 抽屉详情、Blog 阅读进度条，同时清理全站残留旧 token（统一 Claude tokens）。

**Architecture:** GitHub 数据由 Next Route Handler 在服务端调用 GraphQL，并用 `revalidate=86400` 做日更缓存；前端 Activity 以 Client Component 渲染网格与 tooltip；交互类（目录、抽屉、进度条）均为轻量 Client Components，支持 `prefers-reduced-motion` 与 Esc/点击遮罩关闭。

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules

---

## References
- Spec: `docs/superpowers/specs/2026-04-08-activity-calendar-nav-drawer-progress-design.md`

## File Structure (locked)

**Create**
- `app/api/github/contributions/route.ts`
- `src/lib/github/contributions.ts`
- `src/components/sections/Activity.tsx`
- `src/components/sections/Activity.module.css`
- `src/components/nav/TocMenu.tsx`
- `src/components/nav/TocMenu.module.css`
- `src/components/sections/ProjectDrawer.tsx`
- `src/components/sections/ProjectDrawer.module.css`
- `src/components/blog/ReadingProgress.tsx`
- `src/components/blog/ReadingProgress.module.css`

**Modify**
- `app/page.tsx`
- `src/components/sections/{About,Projects,Writing}.tsx`
- `src/components/sections/{About,Writing}.module.css`（Claude token 统一）
- `src/styles/blog.module.css`（进度条占位/布局）
- `src/components/nav/AppleNav.tsx`（加目录菜单）
- `src/components/nav/AppleNav.module.css`（右侧 controls 布局）

---

### Task 1: Unify remaining sections to Claude tokens

**Files:**
- Modify: `src/components/sections/About.module.css`
- Modify: `src/components/sections/Writing.module.css`
- (Optional) Modify: other section css if any old vars remain

- [ ] Replace `--bg-light/--text-on-light/--text-secondary-on-light/--link-on-light` with:
  - background: `var(--surface-1)` or `var(--bg-page)`
  - text: `var(--text-primary)` / `var(--text-secondary)` / `var(--text-tertiary)`
  - links: `var(--link)`
  - borders: `var(--ring)`

- [ ] Verify: `npm run build`
- [ ] Commit: `git commit -m "refactor: unify remaining sections to claude tokens"`

---

### Task 2: Add GitHub contributions API (server-only) + daily revalidate

**Files:**
- Create: `src/lib/github/contributions.ts`
- Create: `app/api/github/contributions/route.ts`

- [ ] Implement `getContributions({ token, username })` to call `https://api.github.com/graphql` with query:
```graphql
query($login:String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount contributionLevel }
        }
      }
    }
  }
}
```

- [ ] Route handler reads env:
  - `process.env.GITHUB_TOKEN`
  - `process.env.GITHUB_USERNAME`
  If missing, return 200 with `{ ok:false, reason:"missing_env" }`

- [ ] Cache: `export const revalidate = 86400;`
- [ ] Verify: `npm run build`
- [ ] Commit: `git commit -m "feat: add github contributions api with daily revalidate"`

---

### Task 3: Add Activity section before About

**Files:**
- Create: `src/components/sections/Activity.tsx`
- Create: `src/components/sections/Activity.module.css`
- Modify: `app/page.tsx`

- [ ] Insert `<Activity />` between `<Hero />` and `<About />`
- [ ] Activity client fetches `/api/github/contributions` and renders:
  - title + meta (total contributions)
  - calendar grid
  - hover tooltip
  - graceful fallback when `ok:false`
- [ ] Add `id="activity"` and `data-reveal`
- [ ] Verify: `npm run build`
- [ ] Commit: `git commit -m "feat: add activity section with contributions calendar"`

---

### Task 4: Add TOC menu in top nav

**Files:**
- Create: `src/components/nav/TocMenu.tsx`
- Create: `src/components/nav/TocMenu.module.css`
- Modify: `src/components/nav/AppleNav.tsx`
- Modify: `src/components/nav/AppleNav.module.css`

- [ ] Add “目录” icon button; popover lists:
  - Activity / About / Projects / Writing / Contact
- [ ] Smooth scroll + update hash
- [ ] Close on click outside + Esc
- [ ] Verify: `npm run build`
- [ ] Commit: `git commit -m "feat: add toc menu navigation"`

---

### Task 5: Add Projects drawer/modal

**Files:**
- Create: `src/components/sections/ProjectDrawer.tsx`
- Create: `src/components/sections/ProjectDrawer.module.css`
- Modify: `src/components/sections/Projects.tsx`

- [ ] Clicking card opens drawer with:
  - title, description, derived bullet points
  - Learn more / View code links
- [ ] Close on overlay click + Esc
- [ ] Ensure links inside card still clickable (stopPropagation)
- [ ] Verify: `npm run build`
- [ ] Commit: `git commit -m "feat: add projects drawer details"`

---

### Task 6: Add blog reading progress bar

**Files:**
- Create: `src/components/blog/ReadingProgress.tsx`
- Create: `src/components/blog/ReadingProgress.module.css`
- Modify: `app/blog/[slug]/page.tsx`

- [ ] Mount `<ReadingProgress targetSelector=".prose" />` above article
- [ ] Compute progress based on scroll position of target element
- [ ] Render 2px top bar; `prefers-reduced-motion` disables animation
- [ ] Verify: `npm run build`
- [ ] Commit: `git commit -m "feat: add blog reading progress bar"`

---

## Verification Checklist
- `npm test` PASS
- `npm run build` PASS
- Home order: Hero → Activity → About → Projects → Writing → Contact
- Env missing -> Activity shows fallback, no crash

