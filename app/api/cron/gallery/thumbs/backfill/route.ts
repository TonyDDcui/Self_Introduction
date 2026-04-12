import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { sql } from "../../../../../../src/lib/db";
import { generateAndPersistPhotoThumb } from "../../../../../../src/lib/gallery/thumbsServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSecret(req: Request): string | null {
  const url = new URL(req.url);
  const q = url.searchParams.get("secret");
  if (q) return q;
  const h = req.headers.get("x-cron-secret");
  return h;
}

export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, reason: "missing_cron_secret_env" },
      { status: 500 },
    );
  }
  const provided = getSecret(req);
  if (!provided || provided !== expected) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit") || 12)));

  let rows: Array<{ id: string; blob_url: string }> = [];
  try {
    const q = await sql<{ id: string; blob_url: string }>`
      select id::text as id, blob_url
      from photos
      where visibility = 'public'
        and (thumb_url is null or thumb_url = '')
      order by published_at desc
      limit ${limit}
    `;
    rows = q.rows;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/thumb_(url|pathname)/i.test(msg)) {
      return NextResponse.json(
        {
          ok: false,
          reason: "db_migration_required",
          message: "数据库缺少缩略图字段，请先执行迁移：scripts/db/migrations/2026-04-12-add-photo-thumbs.sql",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: false, reason: "query_failed", message: msg }, { status: 500 });
  }

  const results: Array<{ id: string; ok: boolean; message?: string }> = [];
  for (const r of rows) {
    try {
      await generateAndPersistPhotoThumb({ photoId: r.id, blobUrl: r.blob_url });
      results.push({ id: r.id, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ id: r.id, ok: false, message: msg });
    }
  }

  revalidateTag("gallery:publicPhotos");
  return NextResponse.json(
    {
      ok: true,
      processed: results.length,
      success: results.filter((x) => x.ok).length,
      failed: results.filter((x) => !x.ok).length,
      results,
    },
    { status: 200 },
  );
}

