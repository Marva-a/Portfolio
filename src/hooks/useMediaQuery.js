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

// Distinguishes "no hover hardware" from "narrow window" — a desktop browser
// resized to phone width still has a mouse and should keep hover affordances.
export const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";
