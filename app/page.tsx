import Hero from "../src/components/sections/Hero";

export default function Page() {
  return (
    <main>
      <Hero />

      <section
        id="about"
        style={{
          background: "var(--bg-light)",
          padding: "72px 0",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.1 }}>
            About（占位）
          </h2>
          <p
            style={{
              margin: "14px 0 0",
              color: "var(--text-secondary-on-light)",
            }}
          >
            这里将放置自我介绍内容。当前为 Task6 的 about section 占位，用于 Hero
            内 “Learn more” 锚点跳转验证。
          </p>
        </div>
      </section>
    </main>
  );
}
