"use client";

import { useState } from "react";

import styles from "./AboutAvatar.module.css";

const AVATAR_URL = "https://github.com/TonyDDcui.png?size=256";
const FALLBACK_LETTER = "T";

export default function AboutAvatar() {
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.wrapper} aria-label="GitHub avatar">
      {failed ? (
        <div className={styles.fallback} role="img" aria-label="Avatar placeholder">
          {FALLBACK_LETTER}
        </div>
      ) : (
        // Use <img> instead of next/image to avoid remotePatterns config.
        <img
          className={styles.image}
          src={AVATAR_URL}
          alt="GitHub avatar"
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

