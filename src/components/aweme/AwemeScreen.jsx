import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { easeBrand } from "../../styles/tokens";
import { app } from "./tokens";
import { FLOW, FRAME_W, SCREEN_H, SCREEN_W } from "./flow";

/**
 * AweMe's product, walked end to end — nine real screens from the Figma
 * file, exported as-is, in the order a parent actually meets them.
 *
 * Nothing narrates it. The one thing doing the talking is a cursor: it
 * moves to whatever a parent would look at or reach for next, rings it,
 * clicks it, and the click is what takes the flow to the next screen. A
 * loading screen gets no cursor, because there is nothing there to do.
 *
 * The overlay is laid out in the frames' own 1728x1117 space and scaled by
 * one factor, so a ring drawn around the "Next" button stays around the
 * "Next" button whatever size the card is.
 */

const S = SCREEN_W / FRAME_W;

const px = (n) => n * S;

/* ------------------------------------------------------------------ cursor */

// Walks a screen's targets one at a time while `playing`, holding on the
// last rather than looping, so nothing snaps back to the first target right
// before the screen crossfades away.
function useSteps(targets, dwell, playing, anim) {
  const [i, setI] = useState(0);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!anim || !playing || targets.length === 0) return;
    if (i >= targets.length - 1 && pressed) return;

    // The press lands partway through the dwell — the cursor arrives, sits
    // for a moment the way a hand does, and only then commits.
    const press = setTimeout(() => setPressed(true), dwell * 0.62);
    const next =
      i < targets.length - 1
        ? setTimeout(() => {
            setPressed(false);
            setI((v) => v + 1);
          }, dwell)
        : null;

    return () => {
      clearTimeout(press);
      if (next) clearTimeout(next);
    };
  }, [i, pressed, targets, dwell, playing, anim]);

  return { index: i, pressed };
}

function Pointer({ x, y, pressed }) {
  return (
    <motion.svg
      initial={false}
      animate={{ x, y, scale: pressed ? 0.86 : 1 }}
      transition={{
        x: { duration: 0.5, ease: easeBrand },
        y: { duration: 0.5, ease: easeBrand },
        scale: { duration: 0.14 },
      }}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      style={{ position: "absolute", left: 0, top: 0, filter: "drop-shadow(0 2px 4px rgba(31,31,31,0.45))" }}
    >
      <path
        d="M2 1.6l6.1 15.2 2.4-6.2 6.2-2.4L2 1.6Z"
        fill={app.ink}
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

function Guide({ targets, dwell, playing, anim }) {
  const { index, pressed } = useSteps(targets, dwell, playing, anim);
  if (!anim || targets.length === 0) return null;

  const target = targets[index];
  const [x, y, w, h] = target.rect;
  const ring = { left: px(x) - 5, top: px(y) - 5, width: px(w) + 10, height: px(h) + 10 };
  // The pointer sits just inside the target rather than dead centre, so a
  // wide card doesn't get a cursor stranded in the middle of its own text.
  const tipX = px(x) + Math.min(px(w) * 0.5, 46);
  const tipY = px(y) + Math.min(px(h) * 0.62, 30);

  return (
    <>
      <motion.div
        initial={false}
        animate={ring}
        transition={{ duration: 0.5, ease: easeBrand }}
        style={{
          position: "absolute",
          borderRadius: 10,
          border: `1.5px solid ${app.teal}`,
          boxShadow: `0 0 0 3px rgba(67,134,146,0.14), 0 6px 18px rgba(67,134,146,0.18)`,
        }}
      />

      <AnimatePresence>
        {pressed && target.click && (
          <motion.span
            key={index}
            initial={{ opacity: 0.45, scale: 0.4 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: tipX - 14,
              top: tipY - 14,
              width: 28,
              height: 28,
              borderRadius: 999,
              background: app.teal,
            }}
          />
        )}
      </AnimatePresence>

      <Pointer x={tipX} y={tipY} pressed={pressed && target.click} />
    </>
  );
}

/* ------------------------------------------------------------------ screen */

export default function AwemeScreen({ state, playing = true }) {
  const reduced = useReducedMotion();
  const anim = !reduced;
  const screen = FLOW[state];

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: 14,
        overflow: "hidden",
        background: app.bg,
        boxShadow: "0 30px 60px -25px rgba(20,14,8,0.55)",
      }}
    >
      {/* Every frame stays mounted and crossfades on opacity: they're all
          fetched up front (348KB for the set), so no screen in the loop can
          arrive as a blank rectangle the first time it comes round. */}
      {FLOW.map((f, i) => (
        <motion.img
          key={f.id}
          src={f.src}
          alt=""
          decoding="async"
          initial={false}
          animate={{ opacity: i === state ? 1 : 0 }}
          transition={{ duration: 0.45, ease: easeBrand }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ))}

      <AnimatePresence mode="wait">
        <motion.div
          key={screen.id}
          initial={anim ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: easeBrand }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <Guide targets={screen.targets} dwell={screen.dwell} playing={playing} anim={anim} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
