import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../../../src/lib/auth/options";
import { isUploader } from "../../../../../src/lib/auth/guards";
import { sql } from "../../../../../src/lib/db";
import { getClientIp, assertSameOrigin, json429 } from "../../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../../src/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const sameOrigin = assertSameOrigin(_request);
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

  const ip = getClientIp(_request);
  const rl = await enforceRateLimit({
    key: `api:gallery:delete:ip=${ip}:actor=uploader`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  const id = context.params.id;
  if (!id) {
    return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });
  }

  try {
    const { rows } = await sql<{ blob_url: string; blob_pathname: string }>`
      select blob_url, blob_pathname
      from photos
      where id = ${id}
      limit 1
    `;

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }

    // 先删 Blob，再删 DB：避免“DB 没了但 Blob 仍在”的孤儿文件
    // del 支持 url 或 pathname；我们优先用 url（更直观）
    await del(row.blob_url);

    await sql`
      delete from photos
      where id = ${id}
    `;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[api/gallery/photos/:id][DELETE] failed:", err);
    return NextResponse.json(
      { ok: false, reason: "internal_error" },
      { status: 500 },
    );
  }
}
