"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";
import Button from "../ui/Button";
import SectionGlass from "./SectionGlass";

export default function Hero() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount (respects prefers-reduced-motion via CSS).
    setEntered(true);
  }, []);

  return (
    <section className={styles.hero} aria-label="Home hero">
      <SectionGlass>
        <div className={`${styles.inner} ${entered ? styles.entered : ""}`}>
          <h1 className={styles.title}>箫</h1>
          <p className={styles.subtitle}>
            嵌入式 / 硬件 / 软件开发工程师。<br />
            科技与摄影是日常，文学与日落是背景音乐。
          </p>

          <div className={styles.ctaRow}>
            <Button
              variant="appleBlue"
              className={styles.cta}
              onClick={() => router.push("/blog")}
            >
              Blog
            </Button>
            <Button
              variant="applePill"
              className={styles.cta}
              onClick={() => {
                const el = document.getElementById("about");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                window.location.hash = "about";
              }}
            >
              Learn more
            </Button>
          </div>
        </div>
      </SectionGlass>
    </section>
  );
}
