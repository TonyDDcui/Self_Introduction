"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Projects.module.css";

type ProjectCard = {
  title: string;
  description: string;
  cta1: { label: string; href: string };
  cta2?: { label: string; href: string };
};

const FEATURED_PROJECTS: ProjectCard[] = [
  {
    title: "Self_Introduction（个人主页 + 博客）",
    description:
      "以 Apple 风格为灵感的个人站点：Home 分镜、MDX 博客、仓库图片自动接入与图库页。",
    cta1: { label: "Learn more", href: "/blog/hello" },
    cta2: { label: "View code", href: "https://github.com/TonyDDcui/Self_Introduction" },
  },
  {
    title: "Logistics-truck（路径学习搬运物流车）",
    description:
      "低成本物流车项目（预算 1200 元）：围绕嵌入式控制与驱动层搭建，聚焦可实现与可维护。",
    cta1: { label: "Learn more", href: "/blog/logistics-truck" },
    cta2: { label: "View code", href: "https://github.com/TonyDDcui/Logistics-truck" },
  },
  {
    title: "Fire_Car-ERCC（ERCC 消防车项目）",
    description:
      "面向 ERCC 竞赛的消防车项目：以 C 语言为主，包含运动控制、传感器与工程文件。",
    cta1: { label: "Learn more", href: "/blog/fire-car-ercc" },
    cta2: { label: "View code", href: "https://github.com/TonyDDcui/Fire_Car-ERCC" },
  },
];

export default function Projects() {
  const router = useRouter();

  return (
    <section
      id="projects"
      className={styles.section}
      aria-label="Featured projects section"
      data-reveal
      data-delay="80"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>Featured Projects</h2>
          <p className={styles.subtitle}>
            一些真实项目与实践记录。后续可以补充“项目实际展示”（照片/视频/文档）到 Gallery。
          </p>
        </header>

        <div className={styles.grid}>
          {FEATURED_PROJECTS.map((p) => (
            <article
              key={p.title}
              className={styles.card}
              role="button"
              tabIndex={0}
              onClick={() => router.push(p.cta1.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(p.cta1.href);
                }
              }}
            >
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardDesc}>{p.description}</p>

              <div className={styles.cardCtas}>
                <Link
                  className={styles.pillLink}
                  href={p.cta1.href}
                  onClick={(e) => e.stopPropagation()}
                >
                  {p.cta1.label}
                </Link>
                {p.cta2 ? (
                  <Link
                    className={styles.pillLinkOutline}
                    href={p.cta2.href}
                    onClick={(e) => e.stopPropagation()}
                  >
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
