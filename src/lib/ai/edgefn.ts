export type EdgeFnChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

type EdgeFnChatResponse = {
  // 兼容 OpenAI-like / EdgeFn 不同返回结构
  choices?: Array<{
    message?: Record<string, unknown>;
    text?: unknown;
  }>;
  output_text?: unknown;
  response?: unknown;
};

function getEdgeFnBaseUrl() {
  return (process.env.EDGEFN_BASE_URL || "https://api.edgefn.net/v1").replace(/\/+$/, "");
}

function getEdgeFnApiKey() {
  return process.env.EDGEFN_API_KEY || "";
}

function extractTextFromUnknownContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && !Array.isArray(content)) {
    // 有些网关会把内容包成对象：{ text: "..."} / { content: "..."} / { output_text: "..." }
    const obj = content as Record<string, unknown>;
    const t = obj.text;
    if (typeof t === "string") return t;
    const c = obj.content;
    if (typeof c === "string") return c;
    const ot = obj.output_text;
    if (typeof ot === "string") return ot;
  }
  if (!Array.isArray(content)) return "";

  // 兼容 content parts: string | {text:string} | {content:string} | {type:'text', text:string}
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object") {
        const p = part as Record<string, unknown>;
        const t = p.text;
        if (typeof t === "string") return t;
        const c = p.content;
        if (typeof c === "string") return c;
      }
      return "";
    })
    .join("");
}

function extractChatContent(data: EdgeFnChatResponse): string {
  const c0 = data.choices?.[0];
  const msgObj = c0?.message;
  if (msgObj && typeof msgObj === "object") {
    // 首选“正文”字段
    const msgText = extractTextFromUnknownContent(msgObj.content);
    if (msgText) return msgText;
    const msgOutputText = extractTextFromUnknownContent(msgObj.output_text);
    if (msgOutputText) return msgOutputText;
    const msgFinal = extractTextFromUnknownContent(msgObj.final);
    if (msgFinal) return msgFinal;
    const msgTextField = extractTextFromUnknownContent(msgObj.text);
    if (msgTextField) return msgTextField;

    // 部分推理模型会把最终输出混在 reasoning 字段里；这里兜底取出，
    // 后续会在 stripReasoningArtifacts 里剥离过程文，只留下可展示内容。
    for (const [k, v] of Object.entries(msgObj)) {
      if (!k.toLowerCase().startsWith("reasoning")) continue;
      const r = extractTextFromUnknownContent(v);
      if (r) return r;
    }
  }

  const choiceText = c0?.text;
  if (typeof choiceText === "string" && choiceText.trim()) return choiceText;

  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text;
  if (typeof data.response === "string" && data.response.trim()) return data.response;
  return "";
}

function stripReasoningArtifacts(text: string): string {
  let s = text;

  // DeepSeek R1 系列经常用 <think>...</think> 包裹思考过程
  if (s.includes("</think>")) {
    const idx = s.lastIndexOf("</think>");
    if (idx !== -1) s = s.slice(idx + "</think>".length);
  }
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // 常见前缀
  s = s.replace(/^\s*(最终答案|final answer|答案)\s*[:：]\s*/i, "");

  let cleaned = s.trim();
  if (!cleaned) return "";

  // 如果包含“最终答案/输出/配文”等显式标记，优先取其后（避免展示过程文）
  for (const marker of ["最终答案", "最终输出", "配文", "输出"]) {
    const idx = cleaned.lastIndexOf(marker);
    if (idx !== -1) {
      const after = cleaned.slice(idx + marker.length).replace(/^[:：\s]+/, "").trim();
      if (after.length >= 2) {
        cleaned = after;
        break;
      }
    }
  }

  // 兜底：如果仍包含多段内容，从后往前取最后一段/最后一句
  if (cleaned.includes("\n")) {
    const parts = cleaned
      .split(/\n+/g)
      .map((x) => x.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1] ?? "";
    if (last.length >= 2) cleaned = last;
  }
  if (cleaned.length > 220) {
    const segs = cleaned
      .split(/[。！？；]/g)
      .map((x) => x.trim())
      .filter(Boolean);
    const last = segs[segs.length - 1] ?? "";
    if (last.length >= 2) cleaned = last;
  }

  return cleaned;
}

export function edgefnSupportsImages(): boolean {
  // 默认关闭：只有明确配置才启用图片识别（避免多模态导致空响应/失败）
  return process.env.EDGEFN_SUPPORTS_IMAGES === "1";
}

export async function edgefnChatComplete(input: {
  messages: EdgeFnChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const baseUrl = getEdgeFnBaseUrl();
  const apiKey = getEdgeFnApiKey();
  if (!apiKey) {
    throw new Error("EDGEFN_API_KEY_NOT_SET");
  }

  // EdgeFn 网关要求必填 model：优先使用环境变量，否则使用默认模型名
  const model = process.env.EDGEFN_MODEL || "DeepSeek-R1-Distill-Qwen-14B";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: input.messages,
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? 600,
      stream: false,
    }),
  });

  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`EDGEFN_HTTP_${res.status}${raw ? `:${raw.slice(0, 200)}` : ""}`);
  }

  let data: EdgeFnChatResponse;
  try {
    data = raw ? (JSON.parse(raw) as EdgeFnChatResponse) : {};
  } catch {
    throw new Error(`EDGEFN_INVALID_JSON${raw ? `:${raw.slice(0, 200)}` : ""}`);
  }

  const content = stripReasoningArtifacts(extractChatContent(data)).trim();
  if (!content) {
    // 把响应体打出来一小段，方便定位“返回结构不兼容/网关无输出”
    throw new Error(`EDGEFN_EMPTY_RESPONSE${raw ? `:${raw.slice(0, 200)}` : ""}`);
  }
  return content;
}
