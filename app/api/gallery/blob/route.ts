import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../../src/lib/auth/options";
import { isUploader } from "../../../../src/lib/auth/guards";
import { getClientIp, assertSameOrigin, json429 } from "../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../src/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
];

/**
 * 客户端直传（Client Upload）入口：
 * - 浏览器直接把大文件上传到 Vercel Blob（避免服务端 4.5MB body 限制导致 413）
 * - 本路由仅负责：鉴权 + 生成 upload token + 接收 upload 完成回调
 */
export async function POST(request: Request): Promise<NextResponse> {
  const sameOrigin = assertSameOrigin(request);
  if (!sameOrigin.ok) {
    return NextResponse.json({ ok: false, reason: sameOrigin.reason }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }
  if (!isUploader(session)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rl = await enforceRateLimit({
    key: `api:gallery:blob:ip=${ip}:actor=uploader`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // 复用外层校验结果：避免重复读取 session
        if (!session) throw new Error("Not authenticated");
        if (!isUploader(session)) throw new Error("Forbidden");

        // 强制写入 gallery/ 目录，避免用户自定义路径污染
        const safeName = pathname.replaceAll("\\\\", "/").split("/").pop() || "upload";
        const finalPathname = `gallery/${safeName}`;

        return {
          pathname: finalPathname,
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // 这里可以做异步回调（比如写数据库），当前我们在客户端上传完成后再调用 /api/gallery/photos 写库
        console.log("[gallery/blob] upload completed:", {
          url: blob.url,
          pathname: blob.pathname,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      // 注意：handleUpload 文档建议这里用 400，Vercel 会自动重试回调
      { status: 400 },
    );
  }
}
