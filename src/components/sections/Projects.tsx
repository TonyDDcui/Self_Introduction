import Link from "next/link";
import styles from "./Projects.module.css";

type ProjectCard = {
  title: string;
  description: string;
  cta1: { label: string; href: string };
  cta2?: { label: string; href: string };
};

const PLACEHOLDER_PROJECTS: ProjectCard[] = [
  {
    title: "Project Alpha（占位）",
    description:
      "一个偏产品化的 Web 体验实验：强调动效、排版与信息层级。后续会从 content/projects 接入真实数据。",
    cta1: { label: "Learn more", href: "#" },
    cta2: { label: "View code", href: "#" },
  },
  {
    title: "Design System Notes（占位）",
    description:
      "整理 tokens、组件规范与可复用布局模块，服务于个人站点与内容发布流。",
    cta1: { label: "Learn more", href: "#" },
    cta2: { label: "View code", href: "#" },
  },
  {
    title: "MDX Blog Tooling（占位）",
    description:
      "围绕 MDX 的内容工作流：元信息、静态生成、组件映射与图片资源管理。",
    cta1: { label: "Learn more", href: "#" },
  },
];

export default function Projects() {
  return (
    <section
      id="projects"
      className={styles.section}
      aria-label="Featured projects section"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>Featured Projects</h2>
          <p className={styles.subtitle}>
            2–3 个项目卡占位，未来将从 content/projects 接入。保持深色背景与轻量边框。
          </p>
        </header>

        <div className={styles.grid}>
          {PLACEHOLDER_PROJECTS.map((p) => (
            <article key={p.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardDesc}>{p.description}</p>

              <div className={styles.cardCtas}>
                <Link className={styles.pillLink} href={p.cta1.href}>
                  {p.cta1.label}
                </Link>
                {p.cta2 ? (
                  <Link className={styles.pillLinkOutline} href={p.cta2.href}>
                    {p.cta2.label}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
