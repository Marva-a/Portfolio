import { color } from "../../styles/tokens";

// The "01 / 05" swipe-progress readout, shared by the project carousel and
// the career-chapter carousel. aria-live so it's announced as the visitor
// swipes, same as both call sites already did independently.
export default function SlideCounter({ current, total, tone = "light", className = "" }) {
  const textColor = tone === "ink" ? color.textOnInk : color.textPrimary;
  return (
    <p
      aria-live="polite"
      className={`type-label font-semibold tabular-nums ${className}`.trim()}
      style={{ color: textColor }}
    >
      {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </p>
  );
}
