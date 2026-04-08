import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button variant="primary">Blog</Button>);
    expect(screen.getByRole("button", { name: "Blog" })).toBeInTheDocument();
  });
});

