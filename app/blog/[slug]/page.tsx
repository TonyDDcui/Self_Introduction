import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import ReadingProgress from "../../../src/components/blog/ReadingProgress";
import PostImage from "../../../src/components/blog/PostImage";
import RepoImage from "../../../src/components/media/RepoImage";
import { getAllPostsMeta, getPostBySlug } from "../../../src/lib/blog/fs";
import styles from "../../../src/styles/blog.module.css";
import { getServerLang } from "../../../src/lib/i18n/server";
import { t } from "../../../src/lib/i18n/strings";

// 默认组件映射：先保持为空，后续可在此处扩展（例如自定义 Image / Callout 等）
const mdxComponents = { RepoImage, img: PostImage };

export const preferredRegion = ["hkg1"];

export async function generateStaticParams() {
  const zh = await getAllPostsMeta("zh");
  const en = await getAllPostsMeta("en");
  const set = new Set([...zh, ...en].map((p) => p.slug));
  return Array.from(set).map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const lang = getServerLang();

  let post: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    post = await getPostBySlug(slug, lang);
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  return (
    <main className={styles.main}>
      <ReadingProgress targetSelector={`.${styles.prose}`} />
      <p className={styles.backLink}>
        <Link href="/blog">{t(lang, "blog.back")}</Link>
      </p>

      <header className={styles.postHeader}>
        <h1 className={styles.postTitle}>{post.meta.title}</h1>
        {post.meta.date ? (
          <p className={styles.postMeta}>
            <time dateTime={post.meta.date}>{post.meta.date}</time>
          </p>
        ) : null}
        {post.meta.summary ? (
          <p className={styles.postSummary}>{post.meta.summary}</p>
        ) : null}
        {post.meta.tags.length ? (
          <p className={styles.postTags}>
            {post.meta.tags.map((t) => `#${t}`).join(" ")}
          </p>
        ) : null}
      </header>

      <div className={styles.postBody}>
        <article className={styles.prose}>{content}</article>
        {post.meta.source_url ? (
          <div className={styles.sourceBlock}>
            阅读原文（CSDN）：{" "}
            <a
              className={styles.sourceLink}
              href={post.meta.source_url}
              target="_blank"
              rel="noreferrer"
            >
              {post.meta.source_url}
            </a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
