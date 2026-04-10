"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Projects.module.css";
import SectionGlass from "./SectionGlass";
import { readClientLang } from "../../lib/i18n/client";
import { t } from "../../lib/i18n/strings";

type ProjectId = "selfintro" | "logistics" | "firecar";
type ProjectCard = { id: ProjectId; learnMoreHref: string; codeHref: string };

const FEATURED_PROJECTS: ProjectCard[] = [
  {
    id: "selfintro",
    learnMoreHref: "/blog/hello",
    codeHref: "https://github.com/TonyDDcui/Self_Introduction",
  },
  {
    id: "logistics",
    learnMoreHref: "/blog/logistics-truck",
    codeHref: "https://github.com/TonyDDcui/Logistics-truck",
  },
  {
    id: "firecar",
    learnMoreHref: "/blog/fire-car-ercc",
    codeHref: "https://github.com/TonyDDcui/Fire_Car-ERCC",
  },
];

export default function Projects() {
  const lang = readClientLang();
  const router = useRouter();

  return (
    <section
      id="projects"
      className={styles.section}
      aria-label="Featured projects section"
      data-reveal
      data-delay="80"
    >
      <SectionGlass>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h2 className={styles.title}>{t(lang, "section.projects.title")}</h2>
            <p className={styles.subtitle}>{t(lang, "section.projects.subtitle")}</p>
          </header>

          <div className={styles.grid}>
            {FEATURED_PROJECTS.map((p) => (
              <article
                key={p.id}
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={() => router.push(p.learnMoreHref)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(p.learnMoreHref);
                  }
                }}
              >
                <h3 className={styles.cardTitle}>
                  {t(lang, `section.projects.items.${p.id}.title` as never)}
                </h3>
                <p className={styles.cardDesc}>
                  {t(lang, `section.projects.items.${p.id}.desc` as never)}
                </p>

                <div className={styles.cardCtas}>
                  <Link
                    className={styles.pillLink}
                    href={p.learnMoreHref}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t(lang, "section.projects.cta.learnMore")}
                  </Link>
                  <Link
                    className={styles.pillLinkOutline}
                    href={p.codeHref}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t(lang, "section.projects.cta.viewCode")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </SectionGlass>

    </section>
  );
}
