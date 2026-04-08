import Link from "next/link";
import { getAllPostsMeta } from "../../src/lib/blog/fs";

export default async function BlogIndexPage() {
  const posts = await getAllPostsMeta();

  return (
    <main style={{ padding: 24 }}>
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p>暂无文章。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
          {posts.map((post) => (
            <li
              key={post.slug}
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              {post.date ? (
                <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
                  <time dateTime={post.date}>{post.date}</time>
                </p>
              ) : null}
              {post.summary ? (
                <p style={{ margin: "8px 0 0" }}>{post.summary}</p>
              ) : null}
              {post.tags.length ? (
                <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
                  {post.tags.map((t) => `#${t}`).join(" ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
