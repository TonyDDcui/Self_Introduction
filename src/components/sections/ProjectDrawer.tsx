"use client";

import { useEffect } from "react";
import styles from "./ProjectDrawer.module.css";

export type ProjectDrawerProject = {
  title: string;
  description: string;
  cta1: { label: string; href: string };
  cta2?: { label: string; href: string };
};

function deriveBullets(description: string): string[] {
  const chunks = description
    .split(/[。；;.!]\s*|：/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const picked = chunks.slice(0, 4);
  if (picked.length >= 2) return picked;
  return [description].filter(Boolean);
}

export default function ProjectDrawer(props: {
  project: ProjectDrawerProject | null;
  onClose: () => void;
}) {
  const { project, onClose } = props;

  useEffect(() => {
    if (!project) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const bullets = deriveBullets(project.description);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <button
        className={styles.scrim}
        type="button"
        aria-label="关闭"
        onClick={onClose}
      />

      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitleWrap}>
            <h3 className={styles.panelTitle}>{project.title}</h3>
            <p className={styles.panelSubtitle}>{project.description}</p>
          </div>
          <button
            className={styles.close}
            type="button"
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className={styles.panelBody}>
          <ul className={styles.bullets}>
            {bullets.map((b) => (
              <li key={b} className={styles.bullet}>
                {b}
              </li>
            ))}
          </ul>

          <div className={styles.ctas}>
            <a className={styles.primary} href={project.cta1.href}>
              {project.cta1.label}
            </a>
            {project.cta2 ? (
              <a className={styles.secondary} href={project.cta2.href}>
                {project.cta2.label}
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
