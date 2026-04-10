# Gallery Caption JSON Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gallery 的 AI 配文只展示最终输出，彻底杜绝 thinking/过程文；并删除当前复杂清洗逻辑，改为“严格 JSON + 简单校验 + 重试一次”。

**Architecture:** 生成端统一要求模型只输出 `{"caption":"..."}`，服务端仅解析 `caption` 字段并做轻量校验；失败重试一次，仍失败返回明确错误，管理员可点“重新生成配文”。

**Tech Stack:** Next.js App Router、Node runtime route handlers、EdgeFn(OpenAI-like) 网关

---

## Files touched

**Create**
- `src/lib/ai/captionJson.ts`

**Modify**
- `src/lib/gallery/photoNarratives.ts`
- `app/api/gallery/photos/[id]/narrative/regenerate/route.ts`

**Delete**
- `src/lib/ai/caption.ts`（旧的复杂提取器）

---

### Task 1: 新增最小 JSON 解析/校验工具

**Files**
- Create: `src/lib/ai/captionJson.ts`

- [ ] Step 1: 写 `parseCaptionJson(text)`（只做最小工作）

要求：
- 从文本中找到 `{ ... }` JSON（允许模型夹带少量其他内容）
- `JSON.parse` 后只取 `caption` 字段
- 校验：单行、长度 2~80、不含 `<think>`、“用户/要求/分析/思考”等过程词
- 返回 `caption` 或抛错 `AI_CAPTION_INVALID_OUTPUT`

- [ ] Step 2: Commit

```bash
git add src/lib/ai/captionJson.ts
git commit -m "feat(ai): add minimal caption json parser"
```

---

### Task 2: 初次生成改为严格 JSON（并删除复杂清洗）

**Files**
- Modify: `src/lib/gallery/photoNarratives.ts`

- [ ] Step 1: Prompt 统一改为严格 JSON 输出

要点：
- system/user 明确要求只输出 JSON，不输出解释/推理
- 增加“无描述时”提示：根据相册主题词想象场景生成文学配文，但不说明推测过程

- [ ] Step 2: 生成逻辑

要点：
- 只走文本模式（默认不启用图片识别）
- 第一次调用 -> `parseCaptionJson`
- 失败 -> 重试一次（带示例 JSON）
- 仍失败 -> 抛错，保留 debug 给管理员

- [ ] Step 3: Commit

```bash
git add src/lib/gallery/photoNarratives.ts
git commit -m "fix(gallery): generate captions via strict json (no thinking)"
```

---

### Task 3: 重新生成接口改为严格 JSON（与初次生成一致）

**Files**
- Modify: `app/api/gallery/photos/[id]/narrative/regenerate/route.ts`

- [ ] Step 1: 将 `createNarrative` 逻辑改为与 photoNarratives 一致的 JSON 方案
- [ ] Step 2: 失败返回 `AI_CAPTION_INVALID_OUTPUT`（前端弹窗可见）

- [ ] Step 3: Commit

```bash
git add app/api/gallery/photos/[id]/narrative/regenerate/route.ts
git commit -m "fix(gallery): regenerate caption via strict json"
```

---

### Task 4: 删除旧清洗器并全量构建验证

**Files**
- Delete: `src/lib/ai/caption.ts`

- [ ] Step 1: 删除文件并移除所有 import
- [ ] Step 2: Build

Run: `npm run build`  
Expected: success

- [ ] Step 3: Commit & Push

```bash
git add -A
git commit -m "chore(ai): remove legacy caption cleaner"
git push origin main
```

