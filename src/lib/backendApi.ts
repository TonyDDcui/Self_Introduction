export type LatestBlogItem = {
  id: number;
  date: string;
  url: string;
  title: string;
};

function resolveApiBase() {
  return process.env.BACKEND_API_BASE_URL || "http://localhost:8000";
}

export async function fetchLatestBlogsFromBackend(
  limit = 5,
): Promise<LatestBlogItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${resolveApiBase()}/api/blog/latest?limit=${limit}`, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json)) return [];
    return json
      .map((item) => ({
        id: Number(item?.id ?? 0),
        date: String(item?.date ?? ""),
        url: String(item?.url ?? ""),
        title: String(item?.title ?? ""),
      }))
      .filter((item) => item.id > 0 && item.url && item.title);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
