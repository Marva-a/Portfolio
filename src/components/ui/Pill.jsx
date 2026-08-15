// The colourful rounded label used across the site: hero tags, project
// tags, expertise/chapter tags, the accordion's status pill, the photo
// stack's caption. All nine call sites shared the same shape — tag-shadow +
// pill-pad + rounded-full, a background colour and a text colour — so this
// is that shape, with typography (size/weight/tracking) left to the caller
// via `className` since it genuinely varies by context (a hero pill and a
// caption chip are different sizes on purpose).
export default function Pill({
  as: Component = "span",
  bg,
  color,
  shadow = true,
  className = "",
  style,
  children,
  ...rest
}) {
  return (
    <Component
      className={`pill-pad rounded-full ${shadow ? "tag-shadow " : ""}${className}`.trim()}
      style={{ backgroundColor: bg, color, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
}
