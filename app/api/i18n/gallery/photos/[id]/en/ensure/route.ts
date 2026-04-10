import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { assertSameOrigin, getClientIp, json429 } from "../../../../../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../../../../../src/lib/security/rateLimit";
import { createJob, findLatestJob, updateJob } from "../../../../../../../../src/lib/i18n/jobs";
import { runPhotoEnJob } from "../../../../../../../../src/lib/i18n/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: { id: string } }) {
  const sameOrigin = assertSameOrigin(request);
  if (!sameOrigin.ok) {
    return NextResponse.json({ ok: false, reason: sameOrigin.reason }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rl = await enforceRateLimit({
    key: `api:i18n:ensure_photo_en:ip=${ip}`,
    limit: 30,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  const id = context.params.id;
  if (!id) {
    return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });
  }

  const existing = await findLatestJob({ kind: "photo_en", targetId: id, lang: "en" });
  if (existing && (existing.state === "queued" || existing.state === "running")) {
    return NextResponse.json({ ok: true, jobId: existing.job_id });
  }

  const jobId = randomUUID();
  await createJob({ jobId, kind: "photo_en", targetId: id, lang: "en" });

  // Fire-and-forget: 失败时更新 job 为 failed
  void runPhotoEnJob(jobId, id).catch(async (e) => {
    const msg = e instanceof Error ? e.message : String(e);
    await updateJob(jobId, { state: "failed", progress: 100, message: "失败", error: msg });
  });

  return NextResponse.json({ ok: true, jobId });
}

