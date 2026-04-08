import Link from "next/link";

export default function BlogIndexPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Blog</h1>
      <p>这是 Blog 列表页（路由骨架）。</p>
      <ul>
        <li>
          <Link href="/blog/hello-world">hello-world</Link>
        </li>
      </ul>
    </main>
  );
}

