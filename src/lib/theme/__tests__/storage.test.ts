import { beforeEach, describe, expect, it } from "vitest";

import { readMode, readTheme, writeMode, writeTheme } from "../storage";

describe("theme storage", () => {
  beforeEach(() => localStorage.clear());

  it("reads/writes theme", () => {
    expect(readTheme()).toBeNull();
    writeTheme("claude");
    expect(readTheme()).toBe("claude");
  });

  it("reads/writes mode", () => {
    expect(readMode()).toBeNull();
    writeMode("dark");
    expect(readMode()).toBe("dark");
  });

  it("returns null for invalid values", () => {
    localStorage.setItem("site.theme", "nope");
    localStorage.setItem("site.mode", "nope");
    expect(readTheme()).toBeNull();
    expect(readMode()).toBeNull();
  });
});

