import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllPostsMeta, getPostBySlug } from "../../../src/lib/blog/fs";

// 默认组件映射：先保持为空，后续可在此处扩展（例如自定义 Image / Callout 等）
const mdxComponents = {};

export async function generateStaticParams() {
  const posts = await getAllPostsMeta();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  let post: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <p style={{ margin: "0 0 16px" }}>
        <Link href="/blog">← 返回列表</Link>
      </p>

      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>{post.meta.title}</h1>
        {post.meta.date ? (
          <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
            <time dateTime={post.meta.date}>{post.meta.date}</time>
          </p>
        ) : null}
        {post.meta.summary ? (
          <p style={{ margin: "8px 0 0" }}>{post.meta.summary}</p>
        ) : null}
        {post.meta.tags.length ? (
          <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
            {post.meta.tags.map((t) => `#${t}`).join(" ")}
          </p>
        ) : null}
      </header>

      <article>{content}</article>
    </main>
  );
}

