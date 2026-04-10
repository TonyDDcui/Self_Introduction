import { describe, expect, it } from "vitest";

import { GLOBAL_TRANSLATION_LOCK_KEY } from "../locks";

describe("i18n locks", () => {
  it("uses a stable global lock key", () => {
    expect(typeof GLOBAL_TRANSLATION_LOCK_KEY).toBe("string");
    expect(GLOBAL_TRANSLATION_LOCK_KEY.length).toBeGreaterThan(5);
  });
});
