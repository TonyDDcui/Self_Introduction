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
                  <a
                    className={styles.githubMark}
                    href={p.codeHref}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <svg
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    <span className={styles.githubTip}>GitHub</span>
                  </a>
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
