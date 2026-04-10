import { edgefnChatComplete } from "../ai/edgefn";

export type GalleryEnPayload = {
  title: string;
  tags: string[];
  narrative_md: string;
};

function extractJsonObject(text: string): unknown {
  const s = text.trim();
  // 兼容模型偶尔在 JSON 前后加解释：尽量抓取第一段 {...}
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

export async function translateGalleryToEn(input: {
  titleZh: string;
  tagsZh: string[];
  narrativeZh: string;
}): Promise<GalleryEnPayload> {
  const system =
    "You are a professional bilingual editor. Translate Chinese photo metadata into natural, polished English.\n" +
    "Constraints:\n" +
    "- Do NOT output reasoning/thinking.\n" +
    "- Preserve meaning; do light polish.\n" +
    "- Output STRICT JSON only.\n" +
    'JSON schema: {"title": string, "tags": string[], "narrative_md": string}.';

  const user =
    `Translate to English. Return STRICT JSON only.\n\n` +
    `[Title]\n${input.titleZh}\n\n` +
    `[Tags]\n${input.tagsZh.join(", ")}\n\n` +
    `[Narrative]\n${input.narrativeZh}\n`;

  const out = await edgefnChatComplete({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    model: "DeepSeek-V3.2",
    temperature: 0.2,
    maxTokens: 900,
    // 翻译场景不需要 reasoning 兜底
    allowReasoningFallback: false,
  });

  const obj = extractJsonObject(out);
  if (!obj || typeof obj !== "object") throw new Error("I18N_TRANSLATE_INVALID_JSON");
  const o = obj as Record<string, unknown>;

  const title = String(o.title ?? "").trim();
  const narrative_md = String(o.narrative_md ?? "").trim();
  const tags = Array.isArray(o.tags)
    ? o.tags.map((x) => String(x).trim()).filter(Boolean)
    : [];

  if (!title || !narrative_md) throw new Error("I18N_TRANSLATE_EMPTY_FIELDS");
  return { title, tags, narrative_md };
}

