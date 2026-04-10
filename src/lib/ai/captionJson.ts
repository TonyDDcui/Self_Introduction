const BAD_SUBSTRINGS = [
  "<think",
  "用户",
  "要求",
  "分析",
  "思考",
  "推理",
  "首先",
  "接下来",
  "最后",
];

export function parseCaptionJson(raw: string): string {
  const s = raw.trim();
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("AI_CAPTION_INVALID_OUTPUT");

  let obj: unknown;
  try {
    obj = JSON.parse(m[0]);
  } catch {
    throw new Error("AI_CAPTION_INVALID_OUTPUT");
  }

  if (!obj || typeof obj !== "object") throw new Error("AI_CAPTION_INVALID_OUTPUT");
  const caption = (obj as Record<string, unknown>).caption;
  if (typeof caption !== "string") throw new Error("AI_CAPTION_INVALID_OUTPUT");

  const text = caption.trim();
  if (!text) throw new Error("AI_CAPTION_INVALID_OUTPUT");
  if (text.includes("\n")) throw new Error("AI_CAPTION_INVALID_OUTPUT");
  if (text.length < 2 || text.length > 80) throw new Error("AI_CAPTION_INVALID_OUTPUT");
  const lower = text.toLowerCase();
  if (BAD_SUBSTRINGS.some((w) => lower.includes(w.toLowerCase()))) {
    throw new Error("AI_CAPTION_INVALID_OUTPUT");
  }

  return text;
}

