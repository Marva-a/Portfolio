import { color } from "../../styles/tokens";

// The eyebrow + h2 + description opener shared by Selected Work and About
// (and, structurally, by every section on the page — Expertise and Contact
// hand-roll their own version because each has a real reason to: Expertise
// swaps in two different headings by breakpoint for screen-reader
// correctness, and Contact's heading lives inside the intro/form grid
// rather than standing alone above it. See DESIGN_SYSTEM.md).
export default function SectionHeading({
  id,
  eyebrow,
  description,
  descriptionClassName = "",
  tone = "light", // "light" — on the cream/card surfaces | "ink" — on the dark sections
  className = "",
  children,
}) {
  const isInk = tone === "ink";
  const eyebrowColor = isInk ? color.textOnInkMuted : color.textMuted;
  const headingColor = isInk ? color.textOnInk : color.textPrimary;
  const descriptionColor = isInk ? color.textOnInkMuted : color.textMuted;

  return (
    <div className={className}>
      <p
        id={id}
        className="scroll-mt-8 text-[12px] font-medium uppercase tracking-[0.15em] md:scroll-mt-10 md:text-[14px] md:tracking-[0.2em]"
        style={{ color: eyebrowColor }}
      >
        {eyebrow}
      </p>
      <h2
        className="font-georgia fluid-section-title mt-3 font-bold"
        style={{ color: headingColor }}
      >
        {children}
      </h2>
      {description && (
        <p
          className={`mt-3 max-w-[72ch] text-[17px] md:text-[20px] xl:max-w-none ${descriptionClassName}`.trim()}
          style={{ color: descriptionColor }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
