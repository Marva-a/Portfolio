import { AnimatePresence, motion } from "framer-motion";

const FULL_NAME = "Marva Abouei";

const CHARS = FULL_NAME.split("").map((ch, i) => ({
  ch,
  // The "M" of Marva and the "A" of Abouei are the two letters that survive
  // into the compact state — they keep a stable key so Framer Motion glides
  // them to their new spot instead of cross-fading a whole new word.
  key: i === 0 ? "brand-m" : i === 6 ? "brand-a" : `c${i}`,
}));

// This transition governs more than just the M/A glide — Framer's layout
// projection couples it to the ancestor pill's width shrink too (the pill's
// own `animate={{ width }}` transition is overridden by this one), so it's
// the single dial for the whole collapse/expand pace.
const GLIDE_TRANSITION = { type: "tween", duration: 0.42, ease: [0.22, 1, 0.36, 1] };

export default function BrandBadge({ expanded }) {
  const visible = expanded
    ? CHARS
    : CHARS.filter((c) => c.key === "brand-m" || c.key === "brand-a");

  return (
    <motion.span layout="position" className="inline-flex">
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map(({ ch, key }, i) => {
          const isAnchor = key === "brand-m" || key === "brand-a";
          return (
            <motion.span
              key={key}
              layout={isAnchor}
              // The `layout` transition only ever matters for M/A (the only
              // ones with `layout` on), so it's safe to set at the top level.
              transition={isAnchor ? { layout: GLIDE_TRANSITION } : undefined}
              initial={{ opacity: 0, scale: 0.4, filter: "blur(4px)" }}
              // Nesting `transition` inside `animate`/`exit` (rather than
              // relying on the component's top-level `transition` prop) is
              // what makes this correct: Framer snapshots a letter's props
              // from its *last* render before it's removed — which still had
              // expanded=true — so a top-level transition keyed off
              // `expanded` silently used the entrance timing for exits too.
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                transition: { duration: 0.16, delay: isAnchor ? 0 : i * 0.012 },
              }}
              // Exiting letters vanish immediately — no fade to watch, so
              // there's nothing left to look "off" while the pill shrinks
              // and M/A glide together.
              exit={{
                opacity: 0,
                transition: { duration: 0 },
              }}
              style={{
                display: "inline-block",
                whiteSpace: ch === " " ? "pre" : "normal",
              }}
            >
              {ch}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </motion.span>
  );
}
