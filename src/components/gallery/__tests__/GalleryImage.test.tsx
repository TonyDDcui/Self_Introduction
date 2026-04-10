import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import GalleryImage from "../GalleryImage";

describe("GalleryImage", () => {
  it("renders a plain img to avoid next/image optimizer hop", () => {
    render(
      <div style={{ width: 200, height: 120 }}>
        <GalleryImage
          src="https://example.com/a.jpg"
          alt="a"
          downloadHref="https://example.com/a.jpg"
        />
      </div>,
    );

    const img = screen.getByRole("img");
    expect(img.tagName.toLowerCase()).toBe("img");
    expect(img.getAttribute("src")).toBe("https://example.com/a.jpg");
  });
});

