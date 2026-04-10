import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";

const BLOG_ZH_DIR = path.join(process.cwd(), "content", "blog");
const BLOG_EN_DIR = path.join(process.cwd(), "content", "blog", "en");

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function getBaseUrl() {
  return (process.env.EDGEFN_BASE_URL || "https://api.edgefn.net/v1").replace(/\/+$/, "");
}

function getApiKey() {
  return process.env.EDGEFN_API_KEY || "";
}

async function edgeChat({ system, user }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("EDGEFN_API_KEY_NOT_SET");
  const res = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "DeepSeek-V3.2",
      temperature: 0.2,
      max_tokens: 1800,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`EDGEFN_HTTP_${res.status}:${raw.slice(0, 200)}`);
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`EDGEFN_INVALID_JSON:${raw.slice(0, 200)}`);
  }
  const msg = data?.choices?.[0]?.message;
  const content = msg?.content || msg?.output_text || data?.output_text || "";
  const text = typeof content === "string" ? content : "";
  return text.trim();
}

function tryExtractJson(text) {
  const s = text.trim();
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

async function listZhSlugs() {
  const entries = await fs.readdir(BLOG_ZH_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".mdx") && !e.name.startsWith("."))
    .map((e) => e.name.replace(/\.mdx$/, ""));
}

async function readExistingEnHash(slug) {
  const p = path.join(BLOG_EN_DIR, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(p, "utf8");
    const parsed = matter(raw);
    const h = parsed.data?.source_hash;
    return typeof h === "string" ? h : "";
  } catch {
    return "";
  }
}

async function writeEnPost(slug, data, body) {
  await fs.mkdir(BLOG_EN_DIR, { recursive: true });
  const fm = {
    title: data.title || slug,
    date: data.date || "",
    summary: data.summary || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    lang: "en",
    source_lang: "zh",
    source_slug: slug,
    source_hash: data.source_hash,
  };
  const out = `---\n${Object.entries(fm)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: [${v.map((x) => JSON.stringify(String(x))).join(", ")}]`;
      return `${k}: ${JSON.stringify(String(v ?? ""))}`;
    })
    .join("\n")}\n---\n\n${body.trim()}\n`;
  await fs.writeFile(path.join(BLOG_EN_DIR, `${slug}.mdx`), out, "utf8");
}

async function translatePost(slug) {
  const zhPath = path.join(BLOG_ZH_DIR, `${slug}.mdx`);
  const rawZh = await fs.readFile(zhPath, "utf8");
  const parsed = matter(rawZh);
  const sourceHash = sha256(rawZh);

  const prevHash = await readExistingEnHash(slug);
  if (prevHash && prevHash === sourceHash) return { slug, status: "skipped" };

  const title = String(parsed.data?.title || slug);
  const date = String(parsed.data?.date || "");
  const summary = String(parsed.data?.summary || "");
  const tags = Array.isArray(parsed.data?.tags) ? parsed.data.tags.map(String) : [];
  const bodyZh = String(parsed.content || "").trim();

  const system =
    "You are a professional bilingual editor. Translate Chinese blog content to natural, polished English. Preserve Markdown/MDX structure, code blocks, inline code, and links. Do not add commentary. Output JSON only.";
  const user = `Translate the following blog post. Return STRICT JSON with keys: title, summary, body.\n\n[Chinese title]\n${title}\n\n[Chinese summary]\n${summary}\n\n[Chinese body (MDX)]\n${bodyZh}`;

  const out = await edgeChat({ system, user });
  const json = tryExtractJson(out);
  if (!json) throw new Error(`TRANSLATE_INVALID_JSON:${slug}`);

  const enTitle = String(json.title || title);
  const enSummary = String(json.summary || summary);
  const enBody = String(json.body || "");
  if (!enBody.trim()) throw new Error(`TRANSLATE_EMPTY_BODY:${slug}`);

  await writeEnPost(
    slug,
    { title: enTitle, summary: enSummary, date, tags, source_hash: sourceHash },
    enBody,
  );
  return { slug, status: "written" };
}

async function main() {
  const slugs = await listZhSlugs();
  let written = 0;
  let skipped = 0;
  for (const slug of slugs) {
    const r = await translatePost(slug);
    if (r.status === "written") written += 1;
    else skipped += 1;
    console.log(`[i18n] ${r.status}: ${slug}`);
  }
  console.log(`[i18n] done. written=${written}, skipped=${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

