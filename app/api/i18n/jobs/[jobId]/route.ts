import { NextResponse } from "next/server";

import { getJob } from "../../../../../src/lib/i18n/jobs";
import { getPhotoTranslation } from "../../../../../src/lib/i18n/photoTranslations";
import { assertSameOrigin, getClientIp, json429 } from "../../../../../src/lib/security/requestGuards";
import { enforceRateLimit } from "../../../../../src/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: { jobId: string } }) {
  const sameOrigin = assertSameOrigin(request);
  if (!sameOrigin.ok) {
    return NextResponse.json({ ok: false, reason: sameOrigin.reason }, { status: 403 });
  }

  // 轻量限流：防止恶意轮询
  const ip = getClientIp(request);
  const rl = await enforceRateLimit({
    key: `api:i18n:job_status:ip=${ip}:job=${context.params.jobId ?? "unknown"}`,
    limit: 120,
    windowSeconds: 60,
  });
  if (!rl.ok) return json429({ resetAt: rl.resetAt, retryAfterSeconds: rl.retryAfterSeconds });

  const jobId = context.params.jobId;
  if (!jobId) {
    return NextResponse.json({ ok: false, reason: "missing_job_id" }, { status: 400 });
  }

  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  // 如果是 photo_en 且已完成：顺便返回翻译缓存，减少前端额外请求
  if (job.kind === "photo_en" && job.state === "done") {
    const translation = await getPhotoTranslation(job.target_id, "en");
    return NextResponse.json({ ok: true, job, translation });
  }

  return NextResponse.json({ ok: true, job });
}
