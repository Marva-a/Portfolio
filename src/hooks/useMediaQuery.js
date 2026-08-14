import { useEffect, useState } from "react";

/**
 * Subscribes to a media query. Used for the few places where mobile needs a
 * genuinely different structure rather than different styling — the career
 * timeline becoming an accordion, and the cursor-following "View Case Study"
 * pill being switched off for touch. Anything achievable with responsive
 * classes is done in CSS instead, so this stays rare.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Tailwind's `md` breakpoint, so JS-driven swaps line up exactly with the
// class-driven ones and nothing changes at a slightly different width.
export const MOBILE_QUERY = "(max-width: 767px)";

// Tailwind's `xl`. Where the *desktop composition* begins — a separate line
// from MOBILE_QUERY, because "is this a phone" and "is there room for the
// two-column layouts" are different questions and tablets answer them
// differently. The desktop layout is built around a 1232px content column;
// measured at 1024 it leaves the About bio a 292px, 29-character ribbon, so
// everything below 1280 gets the single-column composition instead. That
// covers every portrait tablet (768–1024) and landscape iPads up to 1194,
// while real desktops — 1366, 1536, 1920 — are all comfortably above it.
export const DESKTOP_QUERY = "(min-width: 1280px)";

// Distinguishes "no hover hardware" from "narrow window" — a desktop browser
// resized to phone width still has a mouse and should keep hover affordances.
export const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";
