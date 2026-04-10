type CaptionInput = {
  tags: string[];
  description: string;
};

const PROCESS_PATTERNS: RegExp[] = [
  /第[一二三四五六七八九十0-9]+句/,
  /第[一二三四五六七八九十0-9]+段/,
  /第二句|第三句|最后一句|收尾/,
  /思路|步骤|计划|结构|展开|改写|润色|化用|典故/,
  /思考|推理|分析|解释/,
  /用户让我|我将|我会|先|再|接下来|最后/,
  /first sentence|second sentence|third sentence|final sentence/i,
  /step\s*[0-9]+/i,
  /outline|plan|reasoning/i,
];

export function sanitizeCaptionV2(text: string): string | null {
  if (!text) return null;
  let s = text.trim();
  if (!s) return null;

  // 去掉 <think> 块
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  s = s.replace(/^\s*(配文|caption|最终答案|final answer)\s*[:：]\s*/i, "").trim();

  // 去掉明显的过程行
  const lines = s
    .split(/\n+/g)
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((line) => !PROCESS_PATTERNS.some((re) => re.test(line)));

  s = (lines.join("\n") || s).trim();

  // 仍有过程迹象：尝试取最后一句
  if (PROCESS_PATTERNS.some((re) => re.test(s))) {
    const segs = s
      .split(/[。！？；\n]/g)
      .map((x) => x.trim())
      .filter(Boolean);
    for (let i = segs.length - 1; i >= 0; i -= 1) {
      const part = segs[i];
      if (part.length >= 2 && !PROCESS_PATTERNS.some((re) => re.test(part))) return part;
    }
    return null;
  }

  // 单段化 + 长度兜底（不严格限制，但防止极端长）
  s = s.replace(/\s*\n+\s*/g, " ").trim();
  if (s.length < 2) return null;
  if (s.length > 240) s = s.slice(0, 240).trim();
  return s;
}

export function buildCaptionPromptV2(input: CaptionInput): { system: string; user: string } {
  const tagsLine = input.tags.length ? input.tags.join("，") : "无";
  return {
    system:
      "你是一个为摄影作品撰写中文配文的编辑。严禁输出思考过程/推理/分析/解释（包括 <think> 标签、步骤、写作计划）。只输出最终配文正文。",
    user: `请根据“标签”和“详细描述”生成一段配文（用于照片下方纯文字展示）。\n\n标签：${tagsLine}\n详细描述：${input.description}\n\n要求：\n- 用中文\n- 只输出配文正文（不要标题、不要列表、不要 emoji）\n- 不要解释、不要说明你在如何写（不要出现“第一句/第二句/思路/计划”等）`,
  };
}
