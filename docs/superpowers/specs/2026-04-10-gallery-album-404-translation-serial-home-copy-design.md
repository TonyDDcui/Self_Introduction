# 设计文档：Gallery 相册 404 / 翻译串行 / Home 文案修订

日期：2026-04-10  
范围：仅本次优先三项修复（不包含额外性能/SEO 重构）

## 背景与问题

### P0-1：Gallery 相册卡片点击 404
- 现象：在 `/gallery` 相册列表中点击某些相册（用户反馈：相册标题为“迎春”）会进入 404。
- 推测根因：相册 slug 可能包含中文或特殊字符；前端在构造路径时未进行 `encodeURIComponent`，导致实际请求路径与 Next 路由参数解码不一致/不兼容。

### P0-2：Gallery 英文翻译并发导致卡顿与资源占用
- 现象：英文模式下会同时为多张照片触发翻译任务（photo_en），并发调用模型导致资源占用高与页面卡顿。
- 目标：将翻译改为“全站全局串行”，同一时刻最多只有 1 个 photo_en 翻译在运行，其余排队。

### P0-3：Home 文案需要调整 + Featured Projects 英文未翻译
- About 模块：竞赛奖项需要显示 `9+`（替换“待补充”）。
- Featured Projects：删除“后续可以补充‘项目实际展示’…”占位语；并确保英文模式下该板块标题/副标题/CTA/项目描述均可切换为英文。

## 设计目标（验收标准）
1) 点击“迎春”相册不再 404；相册 slug 含中文/特殊字符也可稳定访问。  
2) 英文翻译任务全站全局串行：并发触发时只运行 1 个；其余 job 保持 queued 并逐个完成。  
3) Home 文案更新：About 竞赛奖项显示 9+；Featured Projects 删除占位语并完成 i18n。  

## 方案设计

### 1) 修复相册 404（slug 编码）
**改动点：**
- `src/components/gallery/AlbumGrid.tsx`
  - 将 `href={`/gallery/albums/${a.slug}`}` 改为 `href={`/gallery/albums/${encodeURIComponent(a.slug)}`}`。
- `app/gallery/albums/[slug]/page.tsx`
  - 以防部分运行时返回未解码字符串：在服务端对 `params.slug` 做一次安全解码（try/catch），保证和数据侧 slug 比较一致。

**为什么这样做：**
- 使用 `encodeURIComponent` 是 URL path segment 的标准安全做法，可覆盖中文、空格、`+`、`#` 等符号。

**风险与回滚：**
- 风险低；若出现兼容问题，可回滚为原链接拼接方式。

### 2) 翻译任务全站全局串行（Postgres Advisory Lock）
**核心思路：**  
在执行模型翻译前获取一个固定 advisory lock（全局互斥锁），保证同一时刻只有一个 `runPhotoEnJob()` 能真正进入“翻译调用”阶段。

**改动点：**
- `src/lib/i18n/runner.ts`
  - runner 启动时先保持 `queued`，获取锁后才把 job 标记为 `running` 并推进进度。
  - 翻译完成（或失败）后释放锁（`finally` 确保释放）。
- （可选，前端体验）`GalleryGrid.tsx` / `AlbumStoryFeed.tsx`
  - 将“批量 ensure”改为页面内并发=1 的队列触发，减少一次性创建大量 job 与轮询请求。

**为什么这样做：**
- 即使多个用户同时访问英文模式，也能保证模型调用不并发，从源头降低 CPU/Token 峰值。

**风险与回滚：**
- 如果 serverless 执行时间过长，队列可能变慢；但这是预期 trade-off（节省资源优先）。
- 如需更快，可将锁粒度改为“每相册/每用户串行”，或未来升级成 Cron runner 扫描 queued job。

### 3) Home 文案调整 + Featured Projects i18n
**改动点：**
- `src/components/sections/About.tsx`
  - 将 highlights 的 label/value 迁移到 `src/lib/i18n/strings.ts`（中英文两套）：
    - `section.about.stats.awards.label/value`（value = `9+`）
    - 其余字段也用 key 保持一致（公开项目/兴趣）。
- `src/components/sections/Projects.tsx`
  - 标题、副标题、CTA 文案与项目描述改为 i18n key（英文提供自然翻译）。
  - 删除占位语句：“后续可以补充‘项目实际展示’…”。

**为什么这样做：**
- 目前该板块硬编码中文，英文切换不会生效；将文案集中到 strings 字典可与全站语言切换一致。

## 测试计划
1) 相册 slug：用“迎春”相册复现点击 → 确认不 404；并手工测试中文 slug / 含空格 slug。  
2) 翻译串行：英文模式打开 `/gallery/all`，观察 i18n_jobs 中 `running` 同时最多 1 条；其余保持 `queued`。  
3) Home 文案：切换中英文，验证 About 的奖项显示 9+；Featured Projects 中英文均正确显示、无占位语。  

