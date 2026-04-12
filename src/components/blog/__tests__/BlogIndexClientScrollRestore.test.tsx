import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

import BlogIndexClient from "../BlogIndexClient";

describe("BlogIndexClient scroll restore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not scroll after unmount", () => {
    const scrollTo = vi.fn();
    // @ts-expect-error test override
    window.scrollTo = scrollTo;

    const rafCallbacks: Array<FrameRequestCallback> = [];
    const originalRaf = window.requestAnimationFrame;
    // @ts-expect-error test override
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    };

    const key = "blog:index:state:zh";
    sessionStorage.setItem(
      key,
      JSON.stringify({
        ts: Date.now(),
        scrollY: 222,
        openYear: "2026",
        query: "",
        returnToIndex: true,
      }),
    );

    const view = render(<BlogIndexClient lang="zh" initialPosts={[]} />);
    view.unmount();

    // Execute any pending timeouts and RAFs
    vi.runAllTimers();
    while (rafCallbacks.length) {
      const cb = rafCallbacks.shift()!;
      cb(0);
    }

    expect(scrollTo).not.toHaveBeenCalled();

    // restore
    window.requestAnimationFrame = originalRaf;
  });
});

