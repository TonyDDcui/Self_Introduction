import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";

import { authOptions } from "../../../../src/lib/auth/options";
import { isUploader } from "../../../../src/lib/auth/guards";
import { sql } from "../../../../src/lib/db";
import { getClientIp, assertSameOrigin, json429 } from "../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../src/lib/security/rateLimit";
import { vercelBlobProvider } from "../../../../src/lib/storage/vercelBlobProvider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function asNonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length > 0 ? s : null;
}

function asOptionalString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  return asNonEmptyString(v);
}

function normalizeTags(v: unknown): string[] {
  if (v === undefined || v === null) return [];
  if (typeof v !== "string") return [];

  const parts = v.includes(",") ? v.split(",") : [v];
  const deduped = Array.from(
    new Set(parts.map((s) => s.trim()).filter(Boolean)),
  );
  return deduped;
}

function mimeToExt(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return null;
  }
}

export async function POST(req: Request) {
  const sameOrigin = assertSameOrigin(req);
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

  // uploader 豁免（更高阈值）
  const ip = getClientIp(req);
  const rl = await enforceRateLimit({
    key: `api:gallery:upload:ip=${ip}:actor=uploader`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_form_data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, reason: "missing_file", message: "缺少图片文件（file）" },
      { status: 400 },
    );
  }

  const contentType = file.type || "";
  if (!contentType.startsWith("image/") || !ALLOWED_IMAGE_TYPES.has(contentType)) {
    return NextResponse.json(
      { ok: false, reason: "invalid_mime", message: "仅支持常见图片格式（JPG/PNG/WEBP/GIF/AVIF）" },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_size",
        message: "图片大小需大于 0B",
      },
      { status: 400 },
    );
  }

  const title = asOptionalString(formData.get("title"));
  const caption = asOptionalString(formData.get("caption"));
  const category = asOptionalString(formData.get("category"));
  const tags = normalizeTags(formData.get("tags"));
  const tagsCsv = tags.length > 0 ? tags.join(",") : null;

  const uploadFile: File | Blob | Buffer = file;
  const uploadContentType = contentType;
  const ext = mimeToExt(contentType) ?? "img";

  const uploadId = randomUUID();
  const filename = `gallery/${uploadId}.${ext}`;

  let putResult: { url: string; pathname: string } | null = null;
  try {
    putResult = await vercelBlobProvider.putImage({
      file: uploadFile,
      filename,
      contentType: uploadContentType,
    });

    const { rows } = await sql<{ id: string }>`
      insert into photos (
        blob_url,
        blob_pathname,
        title,
        caption,
        category,
        tags,
        visibility
      ) values (
        ${putResult.url},
        ${putResult.pathname},
        ${title},
        ${caption},
        ${category},
        coalesce(string_to_array(${tagsCsv}, ','), '{}'::text[]),
        'public'
      )
      returning id
    `;

    const id = rows[0]?.id;
    revalidateTag("gallery:publicPhotos");
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    console.error("[api/gallery/upload][POST] failed:", err);
    if (putResult?.pathname) {
      try {
        await vercelBlobProvider.delImage(putResult.pathname);
      } catch {
        // ignore cleanup failures
      }
    }

    return NextResponse.json(
      {
        ok: false,
        reason: "upload_failed",
        message: err instanceof Error ? err.message : "上传失败",
      },
      { status: 500 },
    );
  }
}
