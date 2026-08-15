import { color } from "../../styles/tokens";

// Contact's five underline fields (four inputs + the message textarea) were
// four copies of the same label+input markup plus one near-identical
// textarea. `as` picks the field element; everything else — label, the
// underline, the focus/blur colour swap — is shared.
export default function FormField({
  label,
  id,
  as = "input",
  className = "",
  ...rest
}) {
  const Field = as;
  return (
    <div>
      <label className="text-[18px]" style={{ color: color.textOnInk }} htmlFor={id}>
        {label}
      </label>
      <Field
        id={id}
        className={`mt-3 w-full border-0 border-b bg-transparent pb-2 text-[16px] outline-none transition ${
          as === "textarea" ? "resize-none " : ""
        }${className}`.trim()}
        style={{ borderColor: "rgba(255,253,247,0.3)", color: color.textOnInk }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,253,247,0.8)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,253,247,0.3)";
        }}
        {...rest}
      />
    </div>
  );
}
