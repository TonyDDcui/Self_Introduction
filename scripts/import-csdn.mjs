import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
const RSS_URL = "https://blog.csdn.net/DDTony03/rss/list";
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function slugifyAscii(input) {
  return String(input)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      accept: "*/*",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return await res.text();
}

function stripCdata(s) {
  return String(s || "")
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

function parseRssItems(xml) {
  const items = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const b of blocks) {
    const title = stripCdata((b.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || [])[1]);
    const link = (b.match(/<link>([\s\S]*?)<\/link>/) || [])[1]?.trim() || "";
    const pubDate = (b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1]?.trim() || "";
    const description = stripCdata(
      (b.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || [])[1],
    );
    if (!title || !link) continue;
    items.push({ title, link, pubDate, description });
  }
  return items;
}

function toFrontmatter(obj) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => JSON.stringify(x)).join(", ")}]`);
    } else {
      lines.push(`${k}: ${JSON.stringify(v ?? "")}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

async function writePost({ slug, frontmatter, body }) {
  await fs.mkdir(BLOG_DIR, { recursive: true });
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  await fs.writeFile(filePath, `${frontmatter}\n\n${body}\n`, "utf8");
  return filePath;
}

async function loadExistingBySourceUrl() {
  const map = new Map();
  let entries = [];
  try {
    entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  } catch {
    return map;
  }
  const mdxs = entries.filter((e) => e.isFile() && e.name.endsWith(".mdx")).map((e) => e.name);
  for (const name of mdxs) {
    const raw = await fs.readFile(path.join(BLOG_DIR, name), "utf8");
    const mUrl = raw.match(/^source_url:\s*["']?(.+?)["']?\s*$/m);
    const mHash = raw.match(/^source_hash:\s*["']?([a-f0-9]{64})["']?\s*$/m);
    if (mUrl) map.set(mUrl[1], { filename: name, source_hash: mHash?.[1] || "" });
  }
  return map;
}

function parseRssDateToYmd(pubDate) {
  const s = String(pubDate || "").trim();
  // Example: "Thu, 16 Nov 2023 02:46:34 +0800"
  const m = s.match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(20\d{2})\b/i);
  if (!m) return "";
  const dd = String(m[1]).padStart(2, "0");
  const mon = m[2].toLowerCase();
  const yyyy = m[3];
  const map = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };
  const mm = map[mon] || "";
  if (!mm) return "";
  return `${yyyy}-${mm}-${dd}`;
}

async function main() {
  console.log(`[csdn] fetching rss: ${RSS_URL}`);
  const rssXml = await fetchText(RSS_URL);
  const items = parseRssItems(rssXml);
  if (!items.length) throw new Error("No RSS items found.");
  console.log(`[csdn] rss items: ${items.length}`);

  const existing = await loadExistingBySourceUrl();

  let written = 0;
  let skipped = 0;
  for (const it of items) {
    const url = it.link;
    const date = parseRssDateToYmd(it.pubDate);
    const sourceHash = sha256(`${it.title}\n${it.pubDate}\n${date}\n${it.description}`);
    const prev = existing.get(url);
    if (prev?.source_hash && prev.source_hash === sourceHash) {
      skipped += 1;
      continue;
    }
    const title = it.title;
    // 使用 RSS 自带的 +0800 日期（避免被转为 UTC 导致日期 -1）
    const tags = ["csdn"];
    const summary = it.description || "";

    const id = url.split("/").pop();
    const baseSlug = slugifyAscii(title) || String(id || "post");
    const slug = baseSlug.startsWith("csdn-") ? baseSlug : `csdn-${baseSlug}`;

    const fm = toFrontmatter({
      title,
      date,
      summary,
      tags,
      source_url: url,
      source_hash: sourceHash,
    });

    const body = `${it.description || ""}\n`;

    await writePost({ slug, frontmatter: fm, body });
    written += 1;
  }

  console.log(`[csdn] written: ${written}, skipped: ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
