import { useEffect, useState } from "react";

// Ignore sub-pixel and rubber-band jitter — without a threshold the
// direction flickers during a slow drag or an iOS bounce, and anything
// keyed off it strobes.
const THRESHOLD = 6;

// Above this the page always reports "up", so the header furniture is on
// screen whenever the visitor is at the top, regardless of which way they
// were last moving.
const TOP_ZONE = 80;

/**
 * Which way the page is currently moving: "up" (or at rest near the top) and
 * "down". Used to give mobile the usual app behaviour of letting the chrome
 * retreat while reading forward and bringing it back the moment the visitor
 * scrolls back up.
 *
 * `enabled` is a parameter rather than a caller-side `if` because hooks
 * can't be called conditionally; passing false parks it at "up" and skips
 * the listener entirely, which is what desktop wants.
 */
export default function useScrollDirection(enabled = true) {
  const [direction, setDirection] = useState("up");

  useEffect(() => {
    if (!enabled) {
      setDirection("up");
      return;
    }

    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      if (y <= TOP_ZONE) {
        last = y;
        setDirection("up");
        return;
      }

      const delta = y - last;
      if (Math.abs(delta) < THRESHOLD) return;

      last = y;
      setDirection(delta > 0 ? "down" : "up");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return direction;
}
