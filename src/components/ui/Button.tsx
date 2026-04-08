import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "pillOutline" | "appleBlue" | "applePill";

export default function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant: Variant }
) {
  const { variant, className, ...rest } = props;
  const variantClass =
    variant === "primary"
      ? styles.primary
      : variant === "pillOutline"
        ? styles.pillOutline
        : variant === "appleBlue"
          ? styles.appleBlue
          : styles.applePill;
  return (
    <button
      {...rest}
      className={[styles.base, variantClass, className].filter(Boolean).join(" ")}
    />
  );
}
