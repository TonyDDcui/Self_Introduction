import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

import { authOptions } from "../../../../../src/lib/auth/options";
import { isUploader } from "../../../../../src/lib/auth/guards";
import { sql } from "../../../../../src/lib/db";
import { getClientIp, assertSameOrigin, json429 } from "../../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../../src/lib/security/rateLimit";
import { generateAndPersistPhotoThumb } from "../../../../../src/lib/gallery/thumbsServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { id?: unknown };

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

  const ip = getClientIp(req);
  const rl = await enforceRateLimit({
    key: `api:gallery:thumbs_ensure:ip=${ip}:actor=uploader`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  let body: Body | null = null;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });
  }

  // Load photo info
  const { rows } = await sql<{
    id: string;
    blob_url: string;
    thumb_url: string | null;
  }>`
    select id::text as id, blob_url, thumb_url
    from photos
    where id = ${id}::uuid
    limit 1
  `;

  const photo = rows[0];
  if (!photo) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  // Already has thumbnail
  if (photo.thumb_url) {
    return NextResponse.json({ ok: true, id: photo.id, thumbUrl: photo.thumb_url }, { status: 200 });
  }

  try {
    const result = await generateAndPersistPhotoThumb({ photoId: photo.id, blobUrl: photo.blob_url });
    revalidateTag("gallery:publicPhotos");
    return NextResponse.json({ ok: true, id: photo.id, thumbUrl: result.thumbUrl }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "db_missing_thumb_columns") {
      return NextResponse.json(
        {
          ok: false,
          reason: "db_migration_required",
          message: "数据库缺少缩略图字段，请先执行迁移：scripts/db/migrations/2026-04-12-add-photo-thumbs.sql",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { ok: false, reason: "thumb_generation_failed", message: msg },
      { status: 500 },
    );
  }
}

