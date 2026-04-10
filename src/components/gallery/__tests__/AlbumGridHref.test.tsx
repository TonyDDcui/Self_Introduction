import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import AlbumGrid from "../AlbumGrid";

describe("AlbumGrid href encoding", () => {
  it("encodes non-ascii slugs (e.g. 迎春)", () => {
    render(
      <AlbumGrid
        albums={[
          {
            slug: "迎春",
            title: "迎春",
            count: 3,
            coverUrl: null,
            coverAlt: "迎春",
          },
        ]}
      />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(`/gallery/albums/${encodeURIComponent("迎春")}`);
  });
});

