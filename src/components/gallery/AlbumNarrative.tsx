import styles from "./AlbumNarrative.module.css";

function splitParagraphs(text: string) {
  return text
    .split(/\n\s*\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AlbumNarrative(props: { narrative: string }) {
  const parts = splitParagraphs(props.narrative);
  if (!parts.length) return null;

  return (
    <section className={styles.wrap} aria-label="相册配文">
      {parts.map((p, idx) => (
        <p key={idx} className={styles.p}>
          {p}
        </p>
      ))}
    </section>
  );
}

