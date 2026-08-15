// JS mirror of src/styles/tokens.css's colour tokens, for the many places
// components set colour via inline `style={{ color: ... }}` rather than a
// class — the existing convention in this codebase (Hero, About and
// Expertise each declared their own local DARK/MUTED hex constants before
// this file existed). Keep the two files in sync by hand; there are few
// enough tokens that a build step to generate one from the other isn't
// worth the indirection.

export const color = {
  brandTeal: "#69debe",
  brandSky: "#7cd2f2",
  brandViolet: "#8f74ff",
  brandCoral: "#ff806e",

  pageBg: "#fff7e8",
  surface: "#fffdf7",
  surfaceInk: "#24174a",
  surfaceInkHover: "#2c1d5c",

  textPrimary: "#1c1833",
  textMuted: "#4d476a",
  textMutedStrong: "#38324f",
  textOnInk: "#fffdf7",
  textOnInkMuted: "#fff7e8",
  textOnBrand: "#0b0a14",

  borderSubtle: "rgba(28,24,51,0.1)",
  border: "rgba(28,24,51,0.12)",
  borderStrong: "rgba(28,24,51,0.2)",

  statusError: "#ffb4a8",
  focusRing: "#8f74ff",

  pillMint: "#e8fff6",
  pillSky: "#e6f6ff",
  pillViolet: "#f0e9ff",
  pillCoral: "#ffe1d6",
};

// The four pastel pill backgrounds, in the order they're cycled through
// across the site (hero pills, expertise tags, career chapter tags).
export const pillPalette = [
  color.pillMint,
  color.pillSky,
  color.pillViolet,
  color.pillCoral,
];

// cubic-bezier(0.22, 1, 0.36, 1) — the one easing curve every hand-tuned
// transition on the site uses (badge glide, nav compact, photo settle,
// btn-shine sweep). Durations are left per-callsite: each was tuned against
// what it's animating, not a shared scale.
export const easeBrand = [0.22, 1, 0.36, 1];
export const easeBrandCss = "cubic-bezier(0.22, 1, 0.36, 1)";
