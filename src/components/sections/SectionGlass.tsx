import type { ReactNode } from "react";
import styles from "./SectionGlass.module.css";

export default function SectionGlass(props: { children: ReactNode }) {
  return <div className={styles.glass}>{props.children}</div>;
}

