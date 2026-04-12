import { describe, expect, it } from "vitest";

import { pickPhotoSrc } from "../thumbnails";

describe("pickPhotoSrc", () => {
  it("prefers thumb_url when present", () => {
    expect(pickPhotoSrc({ blob_url: "a", thumb_url: "t" })).toBe("t");
  });

  it("falls back to blob_url when thumb missing", () => {
    expect(pickPhotoSrc({ blob_url: "a", thumb_url: null })).toBe("a");
  });
});

