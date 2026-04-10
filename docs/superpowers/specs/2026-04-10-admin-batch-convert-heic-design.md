# 设计文档：后台批量转换 HEIC/HEIF → JPG 并替换

日期：2026-04-10

## 背景
Gallery 现有历史照片中包含 HEIC/HEIF。多数浏览器（尤其 Windows Chrome/Edge）无法直接预览，导致用户看到空白占位并需要下载原图。虽然前端已支持“上传时自动转 JPG”，但历史数据仍需一次性清理。

## 目标
1) 提供一个仅管理员/上传者可调用的后台接口，一键扫描并批量将 **HEIC/HEIF** 转换为 **JPG**。  
2) 转换后**更新 Postgres `photos` 表**中的 `blob_url` / `blob_pathname` 指向新的 JPG blob，实现页面直接可预览。  
3) 提供 `dryRun` 预演模式：仅返回将处理的清单与统计，不做实际转换/写库。  
4) 安全：旧 blob 不删除（可回滚），接口需鉴权 + 限流 + 同源校验。  

## 非目标
- 不批量转换 PNG/WebP/AVIF（避免透明通道丢失/体积劣化）。
- 不做复杂的后台 UI（只提供 API；后续可加管理页按钮）。

## 方案概览

### 核心流程（convert）
1. 鉴权：`getServerSession` + `isUploader(session)`  
2. 查询候选：从 `photos` 中选出 `blob_url` 或 `blob_pathname` 包含 `.heic` / `.heif`（大小写不敏感）。  
3. 逐张处理（串行，避免资源爆炸）：
   - 从 `blob_url` 下载原始 HEIC/HEIF（fetch）
   - 使用 `sharp` 将其转为 JPG（quality=85~90，移除元数据）
   - 通过 `@vercel/blob` 服务端 API 上传新 JPG（路径 `gallery/converted/<photoId>.jpg` + random suffix）
   - 更新 DB：`photos.blob_url/blob_pathname` 指向新 JPG
   - （可选）将原 URL 记录到 `photos.meta` 或新表用于回滚（本期可先不做 schema 变更，改为日志输出 + dryRun 清单留存）

### DryRun
- 返回候选列表与统计：
  - 总数、估算总大小（通过 HEAD/Content-Length，如可得）、每张的 id、旧 url、建议新文件名
- 不进行下载/转码/上传/写库

### API 设计
`POST /api/admin/gallery/convert-heic`

Body:
```json
{
  "dryRun": true,
  "limit": 50
}
```

Response（dryRun）:
```json
{
  "ok": true,
  "dryRun": true,
  "total": 12,
  "items": [{ "photoId": "...", "from": "https://...heic", "to": "gallery/converted/<id>.jpg" }]
}
```

Response（execute）:
```json
{
  "ok": true,
  "dryRun": false,
  "processed": 12,
  "failed": 1,
  "errors": [{ "photoId": "...", "reason": "HTTP 403" }]
}
```

### 限流与互斥
- 使用既有 `enforceRateLimit`（例如 5 次/分钟，按 uploader + IP）
- 使用 Postgres advisory lock（与翻译锁分开 key）保证同一时刻只能跑一个批处理，防止重复执行。

## 测试计划
1) 单测：选择候选 SQL 过滤逻辑（不依赖真实 blob）。  
2) 集成/手工：先跑 `dryRun=1` 确认清单；再小批量 `limit=2` 执行验证；最后全量执行。  

