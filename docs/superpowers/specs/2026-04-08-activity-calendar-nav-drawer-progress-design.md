# Claude 统一风格：Activity(贡献日历) + 目录导航 + Projects 抽屉 + 阅读进度条（设计规格）
日期：2026-04-08  
项目：`Self_Introduction`（Next.js App Router）  
确认的结构：**Hero → Activity → About → Projects → Writing → Contact**  
贡献日历更新频率：**每天一次（revalidate 86400s）**

## 1. 目标（Goals）
1) **全站样式变量统一为 Claude tokens**：移除残留的旧变量（如 `--bg-dark/--text-on-dark/--link-on-dark`），所有 section 都使用 `--bg-page/--surface-1/--surface-2/--text-primary/--text-secondary/--ring/--link`。
2) Home 新增 **Activity 区块**：展示 GitHub 贡献日历（可 hover tooltip），放在 About 之前。
3) 增加三项交互体验：
   - 顶栏 **Section 目录导航**（展开跳转）。
   - **Projects 抽屉/弹窗详情**（点项目卡打开，展示要点与链接）。
   - Blog 文章页 **阅读进度条**（顶部细条，随滚动推进）。

## 2. 非目标（Non-goals）
- 不做复杂视差/炫光/3D 动效；保持“编辑感、克制”。
- 不做登录、数据库、用户系统。

## 3. 环境变量与安全
在 Vercel / 本地环境中配置（不写入仓库）：
- `GITHUB_TOKEN`：GitHub classic token（最小权限即可）
- `GITHUB_USERNAME`：`TonyDDcui`

安全要求：
- Token 不出现在客户端 bundle；所有 GitHub API 请求必须在服务端完成（Route Handler）。
- 缺失 token 时：前端显示温和的降级（占位说明），不报错、不白屏。

## 4. 信息架构（IA）
首页 section 顺序固定：
1) Hero
2) **Activity（新增）**
3) About
4) Projects
5) Writing
6) Contact

各 section id：
- `#activity`、`#about`、`#projects`、`#writing`、`#contact`

## 5. Activity：GitHub 贡献日历
### 5.1 数据获取（服务端）
- 新增 Route Handler：`/app/api/github/contributions/route.ts`
- 使用 GitHub GraphQL API 获取近 1 年贡献数据（`contributionCalendar`）。
- 缓存策略：`revalidate: 86400`（每天一次）。

返回 JSON（最小必要字段）：
```json
{
  "totalContributions": 1234,
  "weeks": [
    { "contributionDays": [
      { "date": "2026-04-08", "count": 7, "level": 3 }
    ]}
  ]
}
```

### 5.2 前端展示
- 新增 `Activity` section（`id="activity"`），标题 “Activity” 或中文/中英混排（保持现有英文标题体系即可）。
- 网格：按 GitHub 常见布局（周列 * 7 行），每格为一个 day。
- Hover：
  - 显示 tooltip：`YYYY-MM-DD · N contributions`
  - tooltip 风格：Claude ring + warm surface，轻微阴影。
- 动效：
  - section 进入视口：沿用 reveal（淡入+上移）
  - 格子出现：轻微 stagger（按列/行 40–60ms）

### 5.3 颜色（Claude token-based）
- Light：背景 paper，格子边界用 ring，填充深浅随 `level` 变化（从 `--surface-2` → `--accent` 轻微混合）
- Dark：背景 near-black，格子从 `--surface-2` → `--accent` 淡化映射

## 6. 顶栏：Section 目录导航（Claude 对齐）
### 6.1 入口
- 顶栏右侧：新增一个“目录”按钮（图标+文字可选，推荐图标即可）。
- 点击展开 Popover/Menu：列表项为 Activity / About / Projects / Writing / Contact。

### 6.2 行为
- 点击某项：`scrollIntoView({ behavior: "smooth" })` + 更新 hash。
- Popover 自带关闭：点击外部/选择项后关闭，Esc 关闭。
- 无障碍：使用 button + aria-expanded + aria-controls。

## 7. Projects：抽屉/弹窗详情
### 7.1 交互
- 点击项目卡：打开右侧抽屉（Drawer）或居中弹窗（Modal）。
- 内容：
  - 项目标题
  - 3–5 条要点（可从现有 description 派生，后续再精炼）
  - 链接：Learn more / View code（保持现有）
  - （可选）若 Gallery/RepoImage 有素材：显示 1 张预览图

### 7.2 动效与体验
- 打开/关闭：200–260ms，ease-out；支持 reduced motion。
- 背景遮罩：浅色模式为 warm tint，深色模式为 near-black 透明层。

## 8. Blog：阅读进度条
### 8.1 位置与样式
- Blog 文章页顶部固定 2px 进度条（不占高度或占极小高度）。
- 颜色：
  - 进度条填充：`--accent`（Claude terracotta）
  - 背景轨道：`--ring` 或更淡一档

### 8.2 行为
- 监听滚动，计算文章主体滚动进度（0–100%）。
- reduced motion：不做动画过渡或使用更短过渡。

## 9. 验收标准（Acceptance Criteria）
1) 首页 section 顺序为 Hero → Activity → About → Projects → Writing → Contact。
2) 全站不再出现旧的深色区块白字样式；浅色模式文字为黑色/暖黑且对比度正常。
3) Activity 正常显示贡献日历；缺失 token 时显示温和降级提示，不报错。
4) 顶栏目录导航可用，点击平滑滚动到对应 section。
5) Projects 点击卡片可打开详情抽屉/弹窗并可关闭。
6) Blog 文章页出现阅读进度条，滚动时更新。

