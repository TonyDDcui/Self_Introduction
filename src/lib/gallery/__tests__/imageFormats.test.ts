import { describe, expect, it } from "vitest";

import { isHeicLike, isHeicUrl, toJpegFilename } from "../imageFormats";

describe("imageFormats", () => {
  it("detects heic/heif by mime", () => {
    expect(isHeicLike({ name: "x.jpg", type: "image/heic" })).toBe(true);
    expect(isHeicLike({ name: "x.jpg", type: "image/heif" })).toBe(true);
    expect(isHeicLike({ name: "x.jpg", type: "image/jpeg" })).toBe(false);
  });

  it("detects heic/heif by filename extension", () => {
    expect(isHeicLike({ name: "a.heic", type: "" })).toBe(true);
    expect(isHeicLike({ name: "b.HEIF", type: "" })).toBe(true);
    expect(isHeicLike({ name: "c.jpeg", type: "" })).toBe(false);
  });

  it("converts filename to .jpg", () => {
    expect(toJpegFilename("a.heic")).toBe("a.jpg");
    expect(toJpegFilename("b.heif")).toBe("b.jpg");
    expect(toJpegFilename("c.png")).toBe("c.jpg");
    expect(toJpegFilename("noext")).toBe("noext.jpg");
  });

  it("detects heic/heif by url", () => {
    expect(isHeicUrl("https://x.test/a.heic")).toBe(true);
    expect(isHeicUrl("https://x.test/a.HEIF")).toBe(true);
    expect(isHeicUrl("https://x.test/a.jpg")).toBe(false);
  });
});
