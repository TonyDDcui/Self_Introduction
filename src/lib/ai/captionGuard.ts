const PROCESS_PATTERNS: RegExp[] = [
  /第[一二三四五六七八九十0-9]+句/,
  /第[一二三四五六七八九十0-9]+段/,
  /句子[一二三四五六七八九十0-9]+/,
  /第二句|第三句|最后一句|收尾/,
  /思路|步骤|计划|结构|展开|改写|润色|化用|典故/,
  /加入|使用|比如|例如|这样(?:的)?(?:描写|表达)/,
  /用户让我|我将|我会|先|再|接下来|最后/,
  /first sentence|second sentence|third sentence|final sentence/i,
  /step\s*[0-9]+/i,
  /outline|plan|reasoning/i,
];

export function looksLikeProcessText(text: string): boolean {
  const s = text.trim();
  if (!s) return true;
  if (s.includes("<think") || s.includes("</think>")) return true;
  return PROCESS_PATTERNS.some((re) => re.test(s));
}

function stripProcessLines(text: string): string {
  const lines = text
    .split(/\n+/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const kept: string[] = [];
  for (const line of lines) {
    const normalized = line.replace(/^[-*•]\s*/g, "").trim();
    if (!normalized) continue;
    if (PROCESS_PATTERNS.some((re) => re.test(normalized))) continue;
    if (normalized.includes("<think") || normalized.includes("</think>")) continue;
    kept.push(normalized);
  }

  return kept.join("\n").trim();
}

/**
 * 当模型把“写作计划 + 最终配文”混在一起时，尽量从中剥离出可展示的配文正文。
 * 目标：提高成功率，同时保证不展示过程文。
 */
export function tryExtractCaption(text: string): string | null {
  const raw = text.trim();
  if (!raw) return null;

  // 1) 优先去掉过程行后保留剩余
  const stripped = stripProcessLines(raw);
  const candidate = stripped || raw;

  // 2) 如果仍包含过程模式，尝试取最后一句/最后段
  let s = candidate;
  if (looksLikeProcessText(s)) {
    const segs = s
      .split(/[。！？；\n]/g)
      .map((x) => x.trim())
      .filter(Boolean);
    for (let i = segs.length - 1; i >= 0; i -= 1) {
      const part = segs[i];
      if (part.length < 2) continue;
      if (!looksLikeProcessText(part)) return part;
    }
    return null;
  }

  // 3) 合并为单段并做轻量长度控制
  s = s.replace(/\s*\n+\s*/g, " ").trim();
  if (s.length < 2) return null;
  if (s.length > 220) s = s.slice(0, 220).trim();

  return s;
}
