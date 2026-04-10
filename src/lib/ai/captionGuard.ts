const PROCESS_PATTERNS: RegExp[] = [
  /第[一二三四五六七八九十0-9]+句/,
  /第[一二三四五六七八九十0-9]+段/,
  /第二句|第三句|最后一句|收尾/,
  /思路|步骤|计划|结构|展开|改写|润色|化用|典故/,
  /加入|使用|比如|例如|这样(?:的)?(?:描写|表达)/,
  /用户让我|我将|我会|先|再|接下来|最后/,
];

export function looksLikeProcessText(text: string): boolean {
  const s = text.trim();
  if (!s) return true;
  if (s.includes("<think") || s.includes("</think>")) return true;
  return PROCESS_PATTERNS.some((re) => re.test(s));
}

