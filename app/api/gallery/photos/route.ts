import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../src/lib/auth/options";
import { isUploader } from "../../../../src/lib/auth/guards";
import { sql } from "../../../../src/lib/db";
import { listPublicPhotos } from "../../../../src/lib/gallery/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const dedupe = (arr: string[]) =>
    Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));

  if (Array.isArray(v)) {
    const tags = v.filter((x): x is string => typeof x === "string");
    return dedupe(tags);
  }

  if (typeof v === "string") {
    // Allow either a single tag or comma-separated tags.
    const parts = v.includes(",") ? v.split(",") : [v];
    return dedupe(parts);
  }

  return [];
}

export async function GET() {
  try {
    const rows = await listPublicPhotos();
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("[api/gallery/photos][GET] failed:", err);

    const hasDbEnv = Boolean(
      process.env.POSTGRES_URL ||
        process.env.POSTGRES_URL_NON_POOLING ||
        process.env.DATABASE_URL,
    );

    return NextResponse.json(
      {
        ok: false,
        reason: "internal_error",
        message: "读取 Gallery 数据失败（请查看 Vercel Logs 获取具体报错）。",
        hasDbEnv,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }
  if (!isUploader(session)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, reason: "invalid_body" }, { status: 400 });
  }

  const blobUrl = asNonEmptyString((body as Record<string, unknown>).blobUrl);
  const blobPathname = asNonEmptyString(
    (body as Record<string, unknown>).blobPathname,
  );

  if (!blobUrl || !blobPathname) {
    return NextResponse.json(
      { ok: false, reason: "missing_required_fields" },
      { status: 400 },
    );
  }

  const title = asOptionalString((body as Record<string, unknown>).title);
  const caption = asOptionalString((body as Record<string, unknown>).caption);
  const category = asOptionalString((body as Record<string, unknown>).category);
  const tags = normalizeTags((body as Record<string, unknown>).tags);
  const tagsCsv = tags.length > 0 ? tags.join(",") : null;
  const visibility =
    asOptionalString((body as Record<string, unknown>).visibility) ?? "public";

  try {
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
        ${blobUrl},
        ${blobPathname},
        ${title},
        ${caption},
        ${category},
        coalesce(string_to_array(${tagsCsv}, ','), '{}'::text[]),
        ${visibility}
      )
      returning id
    `;

    const id = rows[0]?.id;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    console.error("[api/gallery/photos][POST] failed:", err);
    return NextResponse.json(
      { ok: false, reason: "internal_error" },
      { status: 500 },
    );
  }
}
