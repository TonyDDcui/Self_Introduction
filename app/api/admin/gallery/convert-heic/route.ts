import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";
import sharp from "sharp";

import { authOptions } from "../../../../../src/lib/auth/options";
import { isUploader } from "../../../../../src/lib/auth/guards";
import { sql } from "../../../../../src/lib/db";
import { withAdminHeicBatchLock } from "../../../../../src/lib/admin/locks";
import { isHeicCandidate } from "../../../../../src/lib/gallery/heicBatch";
import { getClientIp, assertSameOrigin, json429 } from "../../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../../src/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = ["hkg1"];

type Body = { dryRun?: boolean; limit?: number };

export async function POST(request: Request) {
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
    key: `api:admin:heic:ip=${ip}:actor=uploader`,
    limit: 5,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  const body = (await request.json().catch(() => ({}))) as Body;
  const dryRun = Boolean(body.dryRun);
  const limit = Math.min(200, Math.max(1, Math.floor(body.limit ?? 50)));

  if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, reason: "missing_blob_token" },
      { status: 500 },
    );
  }

  try {
    return await withAdminHeicBatchLock(async () => {
      const { rows } = await sql<{ id: string; blob_url: string | null; blob_pathname: string | null }>`
        select id, blob_url, blob_pathname
        from photos
        where
          (blob_url ilike '%.heic%' or blob_url ilike '%.heif%'
           or blob_pathname ilike '%.heic%' or blob_pathname ilike '%.heif%')
        order by published_at desc nulls last, created_at desc
        limit ${limit}
      `;

      const candidates = rows.filter((r) => isHeicCandidate(r));

      if (dryRun) {
        return NextResponse.json({
          ok: true,
          dryRun: true,
          total: candidates.length,
          items: candidates.map((r) => ({
            photoId: r.id,
            from: r.blob_url,
            to: `gallery/converted/${r.id}.jpg`,
          })),
        });
      }

      let processed = 0;
      const errors: Array<{ photoId: string; reason: string }> = [];

      for (const row of candidates) {
        const photoId = row.id;
        const fromUrl = row.blob_url;
        if (!fromUrl) {
          errors.push({ photoId, reason: "missing_blob_url" });
          continue;
        }

        try {
          const res = await fetch(fromUrl);
          if (!res.ok) throw new Error(`fetch_failed_http_${res.status}`);

          const buf = Buffer.from(await res.arrayBuffer());
          const jpg = await sharp(buf, { failOnError: false })
            .rotate()
            .jpeg({ quality: 88 })
            .toBuffer();

          const out = await put(`gallery/converted/${photoId}.jpg`, jpg, {
            access: "public",
            addRandomSuffix: true,
            contentType: "image/jpeg",
          });

          await sql`
            update photos
            set blob_url = ${out.url}, blob_pathname = ${out.pathname}
            where id = ${photoId}
          `;

          processed += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "unknown_error";
          errors.push({ photoId, reason: msg });
        }
      }

      // 让 Gallery 页尽快看到新图片 URL
      revalidateTag("gallery:publicPhotos");

      return NextResponse.json({
        ok: true,
        dryRun: false,
        processed,
        failed: errors.length,
        errors,
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error";
    if (msg === "HEIC_BATCH_ALREADY_RUNNING") {
      return NextResponse.json({ ok: false, reason: msg }, { status: 409 });
    }
    console.error("[api/admin/gallery/convert-heic] failed:", err);
    return NextResponse.json({ ok: false, reason: "internal_error" }, { status: 500 });
  }
}

