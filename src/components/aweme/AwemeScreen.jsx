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

// The typed overlay's font — nothing in the exported screens is real text
// we can match exactly, so this is tuned to sit close to the geometric
// sans the designs render in.
const FIELD_FONT = '-apple-system, "Inter", "Helvetica Neue", Arial, sans-serif';

// A real hand doesn't glide at one fixed speed and it doesn't sit dead
// still between moves — this is the physics and the jitter that stand in
// for that, both derived from the step index so they're stable across
// re-renders rather than re-rolled (and re-triggering effects) on every one.
const POINTER_SPRING = { type: "spring", stiffness: 210, damping: 20, mass: 0.9 };
const RING_SPRING = { type: "spring", stiffness: 190, damping: 24, mass: 1 };

// +/-8% on the hold and a few percent on where in it the press lands, so
// consecutive steps don't read as one metronome tick repeating.
function stepTiming(i, hold) {
  const holdJitter = (((i * 53 + 7) % 17) - 8) / 100;
  const pressFrac = 0.58 + ((i * 31 + 11) % 9) / 100;
  return { hold: hold * (1 + holdJitter), pressFrac };
}

/* ------------------------------------------------------------------ cursor */

// Walks a screen's targets one at a time while `playing`, holding on the
// last rather than looping, so nothing snaps back to the first target right
// before the screen crossfades away. Each target keeps its own hold length
// (flow.js gives typed fields more room than a plain stop) rather than one
// dwell shared across the whole screen.
function useSteps(targets, holds, playing, anim) {
  const [i, setI] = useState(0);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!anim || !playing || targets.length === 0) return;
    if (i >= targets.length - 1 && pressed) return;

    const { hold, pressFrac } = stepTiming(i, holds[i]);
    // The press lands partway through the hold — the cursor arrives, sits
    // for a moment the way a hand does, and only then commits.
    const press = setTimeout(() => setPressed(true), hold * pressFrac);
    const next =
      i < targets.length - 1
        ? setTimeout(() => {
            setPressed(false);
            setI((v) => v + 1);
          }, hold)
        : null;

    return () => {
      clearTimeout(press);
      if (next) clearTimeout(next);
    };
  }, [i, pressed, targets, holds, playing, anim]);

  return { index: i, pressed };
}

// Reveals `text` a character at a time while `active`, the way a field
// looks mid-type — pauses are a little longer after a space or punctuation
// mark, since that's where a real typist actually hesitates. A field that's
// been passed (not active, but already visited) just holds its full value:
// nothing a parent already typed should look like it un-types itself.
function useTypedText(text, active) {
  const [chars, setChars] = useState(active ? 0 : text.length);

  useEffect(() => {
    if (!active) {
      setChars(text.length);
      return;
    }
    setChars(0);
    let cancelled = false;
    let timer;
    let n = 0;
    const tick = () => {
      if (cancelled) return;
      n += 1;
      setChars(n);
      if (n < text.length) {
        const justTyped = text[n - 1];
        const delay = /[\s@.]/.test(justTyped) ? 120 + Math.random() * 60 : 40 + Math.random() * 55;
        timer = setTimeout(tick, delay);
      }
    };
    timer = setTimeout(tick, 160);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, text]);

  return chars;
}

function TypedField({ rect, text, mask, active }) {
  const chars = useTypedText(text, active);
  const [x, y, w, h] = rect;
  const shown = mask ? "•".repeat(chars) : text.slice(0, chars);
  const fontSize = Math.max(9, px(h) * 0.56);

  return (
    <div
      style={{
        position: "absolute",
        left: px(x) + 2,
        top: px(y) + 2,
        width: px(w) - 4,
        height: px(h) - 4,
        borderRadius: Math.max(4, px(h) * 0.22),
        background: app.bg,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: FIELD_FONT,
        fontSize,
        letterSpacing: mask ? 1 : 0,
        color: app.ink,
        whiteSpace: "nowrap",
      }}
    >
      {shown}
      {active && chars < text.length && (
        <motion.span
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          style={{ width: 1.5, height: "58%", marginLeft: 1, background: app.ink }}
        />
      )}
    </div>
  );
}

// Stands in for a dropdown opening: a couple of options fly in under the
// field while the cursor sits on it, "Kindergarten" already picked out,
// then it folds away right as the press that would close it lands.
function SelectFlyout({ rect, open }) {
  const [x, y, w, h] = rect;
  const rowH = Math.max(16, px(h) * 0.44);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: easeBrand }}
          style={{
            position: "absolute",
            left: px(x) + 2,
            top: px(y) + px(h) + 4,
            width: px(w) - 4,
            borderRadius: 8,
            background: "#fffefb",
            border: `1px solid ${app.border}`,
            boxShadow: "0 10px 24px -10px rgba(31,31,31,0.35)",
            overflow: "hidden",
            fontFamily: FIELD_FONT,
            fontSize: Math.max(9, rowH * 0.48),
            transformOrigin: "top center",
          }}
        >
          <div
            style={{
              height: rowH,
              display: "flex",
              alignItems: "center",
              padding: `0 ${rowH * 0.4}px`,
              background: "rgba(67,134,146,0.14)",
              color: app.teal,
              fontWeight: 600,
            }}
          >
            Kindergarten
          </div>
          <div style={{ height: rowH, display: "flex", alignItems: "center", padding: `0 ${rowH * 0.4}px`, color: app.ink }}>
            1st Grade
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// A trailing spinner on the control that's actually taking the flow
// somewhere — a beat of "working on it" before the screen cuts, the way a
// real submit button doesn't advance the instant it's clicked.
function LoadingSpinner({ x, y }) {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, rotate: 360 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.16, delay: 0.2 },
        rotate: { duration: 0.85, repeat: Infinity, ease: "linear" },
      }}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      style={{ position: "absolute", left: x - 7, top: y - 7 }}
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        fill="none"
        stroke={app.teal}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="17 40"
      />
    </motion.svg>
  );
}

function Pointer({ x, y, pressed }) {
  return (
    <motion.div
      initial={false}
      animate={{ x, y }}
      transition={{ x: POINTER_SPRING, y: POINTER_SPRING }}
      style={{ position: "absolute", left: 0, top: 0, width: 20, height: 20 }}
    >
      {/* A hand hovering over a target isn't a tripod — the faint tremor
          reads as a real cursor waiting, and drops out the instant it
          commits to a click. */}
      <motion.svg
        animate={{
          scale: pressed ? 0.86 : 1,
          rotate: pressed ? 0 : [0, -3, 2, 0],
        }}
        transition={{
          scale: { duration: 0.14 },
          rotate: pressed
            ? { duration: 0.1 }
            : { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
        }}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        style={{ filter: "drop-shadow(0 2px 4px rgba(31,31,31,0.45))" }}
      >
        <path
          d="M2 1.6l6.1 15.2 2.4-6.2 6.2-2.4L2 1.6Z"
          fill={app.ink}
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}

function Guide({ targets, holds, playing, anim }) {
  const { index, pressed } = useSteps(targets, holds, playing, anim);
  if (!anim || targets.length === 0) return null;

  const target = targets[index];
  const [x, y, w, h] = target.rect;
  const ring = { left: px(x) - 5, top: px(y) - 5, width: px(w) + 10, height: px(h) + 10 };
  // The pointer sits just inside the target rather than dead centre, so a
  // wide card doesn't get a cursor stranded in the middle of its own text.
  const tipX = px(x) + Math.min(px(w) * 0.5, 46);
  const tipY = px(y) + Math.min(px(h) * 0.62, 30);
  const clicking = pressed && target.click;
  // The click that actually leaves the screen — the last target in the
  // list — is the one that earns a loading beat; a mid-screen tap (marking
  // a to-do done, picking a radio option) doesn't go anywhere, so it stays
  // just a tap.
  const advancing = clicking && index === targets.length - 1;

  return (
    <>
      {/* Fields already typed keep showing what they typed — only the
          field the cursor is on right now is still filling in. */}
      {targets.map(
        (t, i) =>
          t.type &&
          i <= index && <TypedField key={i} rect={t.rect} text={t.type} mask={t.mask} active={i === index} />
      )}

      {target.select && <SelectFlyout rect={target.rect} open={!pressed} />}

      <motion.div
        initial={false}
        animate={{ ...ring, scale: clicking ? 0.97 : 1 }}
        transition={{ left: RING_SPRING, top: RING_SPRING, width: RING_SPRING, height: RING_SPRING, scale: { duration: 0.12 } }}
        style={{
          position: "absolute",
          borderRadius: 10,
          border: `1.5px solid ${app.teal}`,
          boxShadow: `0 0 0 3px rgba(67,134,146,0.14), 0 6px 18px rgba(67,134,146,0.18)`,
        }}
      />

      {/* The tap itself reads as two things at once, the way a real button
          press does: the control it lands on picks up a soft highlight for
          an instant, and a ripple spends itself outward from underneath
          the fingertip. */}
      <AnimatePresence>
        {clicking && (
          <motion.div
            key={`${index}-flash`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ ...ring, position: "absolute", borderRadius: 10, background: "rgba(67,134,146,0.16)" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {clicking && (
          <motion.span
            key={`${index}-ripple`}
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

      <AnimatePresence>{advancing && <LoadingSpinner key={`${index}-spinner`} x={px(x) + px(w) - 16} y={px(y) + px(h) / 2} />}</AnimatePresence>

      <Pointer x={tipX} y={tipY} pressed={clicking} />
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
      {FLOW.map((f, i) => {
        // The one screen with nothing to click still needs to look alive
        // rather than frozen — a slow breathing scale stands in for "this
        // is thinking", the way a spinner or a skeleton shimmer would.
        const thinking = i === state && f.targets.length === 0;
        return (
          <motion.img
            key={f.id}
            src={f.src}
            alt=""
            decoding="async"
            initial={false}
            animate={{ opacity: i === state ? 1 : 0, scale: thinking ? [1, 1.012, 1] : 1 }}
            transition={{
              opacity: { duration: 0.45, ease: easeBrand },
              scale: thinking ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 },
            }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        );
      })}

      <AnimatePresence mode="wait">
        <motion.div
          key={screen.id}
          initial={anim ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: easeBrand }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <Guide targets={screen.targets} holds={screen.holds} playing={playing} anim={anim} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
