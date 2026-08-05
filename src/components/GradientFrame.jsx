export default function GradientFrame({
  className = "",
  innerClassName = "",
  padding = "1px",
  radius = "9999px",
  transparent = false,
  children,
}) {
  return (
    <div
      className={`gradient-border-anim ${className}`}
      style={{
        borderRadius: radius,
        padding,
      }}
    >
      <div
        className={`h-full w-full ${innerClassName}`}
        style={{
          background: transparent ? "transparent" : "#fffdf7",
          borderRadius: radius,
        }}
      >
        {children}
      </div>
    </div>
  );
}
