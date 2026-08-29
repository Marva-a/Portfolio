import { color } from "../../styles/tokens";

// Two button treatments actually exist on the site: the animated-gradient
// "primary" CTA (currently just Contact's Send button) and the outlined
// "secondary" pill (Expertise's Previous/Next chapter controls). Both were
// hand-rolled per call site with no shared focus-visible ring — this adds
// one consistent brand-coloured ring to both, closing that accessibility
// gap in the same pass as deduplicating the markup.
const VARIANTS = {
  primary:
    "gradient-border-anim btn-shine relative min-h-[48px] rounded-full px-8 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#24174A] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none",
  secondary:
    "type-label focus-ring-pill shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 font-medium transition disabled:opacity-40",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  className = "",
  style,
  children,
  ...rest
}) {
  const variantStyle =
    variant === "secondary"
      ? { border: `1px solid ${color.border}`, color: color.textMuted, ...style }
      : { color: color.textOnBrand, ...style };

  return (
    <Component
      className={`${VARIANTS[variant]} ${className}`.trim()}
      style={variantStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
