import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "pillOutline";

export default function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant: Variant }
) {
  const { variant, className, ...rest } = props;
  const variantClass = variant === "primary" ? styles.primary : styles.pillOutline;
  return (
    <button
      {...rest}
      className={[styles.base, variantClass, className].filter(Boolean).join(" ")}
    />
  );
}

