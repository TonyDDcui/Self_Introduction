import { describe, expect, it } from "vitest";
import { isHeicCandidate } from "../heicBatch";

describe("heic batch", () => {
  it("matches heic/heif urls", () => {
    expect(isHeicCandidate({ blob_url: "https://x/a.heic", blob_pathname: "" })).toBe(true);
    expect(isHeicCandidate({ blob_url: "https://x/a.HEIF", blob_pathname: "" })).toBe(true);
    expect(isHeicCandidate({ blob_url: "https://x/a.jpg", blob_pathname: "" })).toBe(false);
  });
});

