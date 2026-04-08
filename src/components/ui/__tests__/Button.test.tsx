import { render, screen } from "@testing-library/react";
import Button from "../Button";
import styles from "../Button.module.css";

describe("Button", () => {
  it("renders children", () => {
    render(<Button variant="primary">Blog</Button>);
    expect(screen.getByRole("button", { name: "Blog" })).toBeInTheDocument();
  });

  it("supports appleBlue variant", () => {
    render(<Button variant="appleBlue">Apple Blue</Button>);
    const btn = screen.getByRole("button", { name: "Apple Blue" });
    expect(btn).toHaveClass(styles.appleBlue);
  });

  it("supports applePill variant", () => {
    render(<Button variant="applePill">Apple Pill</Button>);
    const btn = screen.getByRole("button", { name: "Apple Pill" });
    expect(btn).toHaveClass(styles.applePill);
  });
});
