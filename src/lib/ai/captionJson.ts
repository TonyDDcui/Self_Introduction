function sanitizeCaption(input: string): string {
  let s = input.trim();
  if (!s) return "";

  // 去掉模型可能夹带的 think 标签（即使出现在 caption 字段里）
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // 统一成单行（避免 parse 失败）
  s = s.replace(/\s*\n+\s*/g, " ").trim();

  // 去掉常见前缀（尽量“修复”而不是判死刑，提高成功率）
  s = s.replace(/^\s*(caption|配文|最终答案|final answer)\s*[:：]\s*/i, "").trim();

  // 如果模型仍输出过程文，尽量把它剥掉：取最后一句
  if (s.length > 120) {
    const segs = s
      .split(/[。！？；]/g)
      .map((x) => x.trim())
      .filter(Boolean);
    const last = segs[segs.length - 1] ?? "";
    if (last.length >= 2) s = last;
  }

  // 长度控制（目标 60 字内，留一点余量给标点）
  if (s.length > 70) s = s.slice(0, 70).trim();

  return s;
}

function findJsonCandidates(raw: string): string[] {
  const s = raw.trim();
  // 非贪婪匹配：避免把“前面的 { + 后面的 }”整个吞掉导致 JSON.parse 失败
  const matches = s.match(/\{[\s\S]*?\}/g);
  return matches ? matches.map((x) => x.trim()) : [];
}

export function parseCaptionJson(raw: string): string {
  const candidates = findJsonCandidates(raw);
  if (candidates.length === 0) throw new Error("AI_CAPTION_INVALID_OUTPUT");

  // 从后往前尝试：很多模型会在末尾才给最终 JSON
  for (let i = candidates.length - 1; i >= 0; i -= 1) {
    const c = candidates[i];
    try {
      const obj = JSON.parse(c) as unknown;
      if (!obj || typeof obj !== "object") continue;
      const caption = (obj as Record<string, unknown>).caption;
      if (typeof caption !== "string") continue;
      const cleaned = sanitizeCaption(caption);
      if (cleaned.length >= 2) return cleaned;
    } catch {
      // ignore and try the next candidate
    }
  }

  throw new Error("AI_CAPTION_INVALID_OUTPUT");
}
