function tryExtractJsonCaption(text: string): string | null {
  // 允许模型输出夹带解释时，我们仍尽量从中抽出 JSON
  const s = text.trim();
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[0]) as unknown;
    if (!obj || typeof obj !== "object") return null;
    const caption = (obj as Record<string, unknown>).caption;
    return typeof caption === "string" ? caption.trim() : null;
  } catch {
    return null;
  }
}

const STOPWORDS = [
  "用户",
  "要求",
  "我将",
  "我会",
  "思考",
  "分析",
  "首先",
  "接下来",
  "最后",
  "下面",
  "配文：",
  "配文",
  "标题：",
  "描述：",
  "标签：",
  "<think>",
  "</think>",
];

export function isCaptionLikelyValid(text: string): boolean {
  const s = text.trim();
  if (!s) return false;
  if (s.includes("\n")) return false;
  // 目标：1～3 句，<= 60 字（留一点余量给中文标点）
  if (s.length < 2 || s.length > 80) return false;
  const lower = s.toLowerCase();
  if (STOPWORDS.some((w) => lower.includes(w.toLowerCase()))) return false;
  return true;
}

export function extractUserVisibleCaption(text: string): string {
  // 1) JSON 优先（更稳定）
  const fromJson = tryExtractJsonCaption(text);
  if (fromJson && isCaptionLikelyValid(fromJson)) return fromJson;

  // 2) 去掉 code fence / 引号
  let s = text.trim();
  s = s.replace(/^```[a-zA-Z]*\n?/g, "").replace(/```$/g, "").trim();
  s = s.replace(/^["“”']+|["“”']+$/g, "").trim();

  // 3) 如果包含明显的“配文：”，取其后
  const idx = s.lastIndexOf("配文：");
  if (idx !== -1) {
    const after = s.slice(idx + "配文：".length).trim();
    if (isCaptionLikelyValid(after)) return after;
  }

  // 4) 多行时优先取最后一行/最后一句
  const lines = s
    .split(/\n+/g)
    .map((x) => x.trim())
    .filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const cand = lines[i].replace(/^[-*•]\s*/g, "").trim();
    if (isCaptionLikelyValid(cand)) return cand;
  }

  // 5) 仍失败：尝试按句号/分号切段，从后往前找
  const segs = s
    .split(/[。！？；]/g)
    .map((x) => x.trim())
    .filter(Boolean);
  for (let i = segs.length - 1; i >= 0; i -= 1) {
    const cand = segs[i];
    if (isCaptionLikelyValid(cand)) return cand;
  }

  // 6) 兜底：返回原文（上层会用校验触发重试）
  return s;
}

