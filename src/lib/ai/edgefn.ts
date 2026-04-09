export type EdgeFnChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type EdgeFnChatResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
};

function getEdgeFnBaseUrl() {
  return (process.env.EDGEFN_BASE_URL || "https://api.edgefn.net/v1").replace(/\/+$/, "");
}

function getEdgeFnApiKey() {
  return process.env.EDGEFN_API_KEY || "";
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

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // 你的 API 侧固定模型的话，这个字段通常会被忽略；保留一个默认值用于兼容
      model: process.env.EDGEFN_MODEL || "default",
      messages: input.messages,
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? 600,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`EDGEFN_HTTP_${res.status}${text ? `:${text.slice(0, 200)}` : ""}`);
  }

  const data = (await res.json()) as EdgeFnChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim() || "";
  if (!content) {
    throw new Error("EDGEFN_EMPTY_RESPONSE");
  }
  return content;
}

