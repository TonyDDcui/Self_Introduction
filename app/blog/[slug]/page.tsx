type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <main style={{ padding: 24 }}>
      <h1>Blog Post</h1>
      <p>
        slug: <code>{params.slug}</code>
      </p>
    </main>
  );
}

