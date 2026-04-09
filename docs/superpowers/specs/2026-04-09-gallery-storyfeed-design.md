# Gallery 相册详情页图文流 + 细节调整（Design）

日期：2026-04-09  
范围：Self_Introduction 项目（Next.js / Vercel）

## 目标

1. **顶栏头像稍微变大**（保持克制，不“离谱”）。
2. **相册详情页 `/gallery/albums/[slug]` 改为“图 + AI 文案”同一蒙版框的纵向流**：
   - 不再使用网格卡片，也不再在图片下方显示标题/描述/分类等元信息。
   - 多张图片：**一张图片 + 一段文字**，文字本身作为图片之间的间隔。
   - 文案生成优先依据 **tags + title/caption**；并 **尝试让 AI 识别图片**（若接口不支持则自动回退到纯文本方式）。
3. Home 页 Hero 标题从“崔喆箫”改为“箫”。

## 非目标

- 不改 `/gallery` 相册列表页与 `/gallery/all` 全部照片页的展示形态。
- 不在前端暴露任何 AI token；仅使用服务端环境变量读取。

## UI / 交互设计

### 顶栏头像
- 调整 `AppleNav` 左上角头像尺寸（例如 26px → 30/32px）。
- 同步 `<img width/height>` 属性，避免 layout shift。

### 相册详情页图文流（单一蒙版框）

在相册详情页标题区块下方，渲染一个容器（蒙版框）：
- 容器样式沿用现有 “Apple-ish card” 语言：圆角、描边、半透明背景、轻阴影。
- 容器内部为纵向排列的条目：
  - 图片（保持一定比例或自适应，默认 4:3；可裁切 `object-fit: cover`）
  - AI 文案（纯文本段落，2–3 句；作为图片间隔）

管理员（Uploader）可见调试：
- 当某张图生成失败时，页面仅对管理员显示错误摘要（方便定位接口/参数问题）。

## AI 文案生成与缓存

### 生成粒度
- **按照片（photo id）生成**，而非按相册整体生成。

### 输入信号
- tags（逗号/数组）
- title / caption（若存在）
- 公开图片 URL（尝试多模态：若接口支持，则提供给模型；否则回退纯文本）

### 输出格式
- 纯中文文本，1 段（或最多 2 段），不使用 emoji，不使用标题/列表。

### 缓存策略
- 首次访问相册详情页时：
  - 批量查询该相册内照片的已缓存文案
  - 对缺失部分逐张生成并写入 DB
- 后续访问直接读取缓存，不重复消耗 token。

### 数据表
新增表（最小可用）：

- `photo_narratives`
  - `photo_id text primary key`
  - `album_slug text`
  - `narrative_md text not null`
  - `created_at timestamptz default now()`
  - `updated_at timestamptz default now()`

（可选）为 `album_slug` 增加索引以加速批量读取。

## 兼容性与容错

- 若缺少 `EDGEFN_API_KEY`：页面仍正常展示图片，仅不展示 AI 文案（管理员可见提示）。
- 若接口返回 4xx/5xx：记录错误并对管理员展示摘要；对访客静默降级为“无文案”。
- 多模态失败时（例如返回 “InvalidRequestBody / image not supported”）：自动回退为纯文本请求并缓存结果。

## 验收标准

1. 顶栏头像肉眼可见变大但仍克制，整体布局不抖动。
2. `/gallery/albums/[slug]` 页面：
   - 图片与文案在同一个蒙版容器中
   - 不展示原始 caption/category/tags
   - 多图时：图文按“图-文-图-文”排列
3. Home Hero 标题只显示“箫”。
4. Vercel production 无构建错误；运行期可在管理员视角看到 AI 失败原因（如有）。

