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

// Everything this file draws is stated in the frames' own 1728px units and
// run through px(), exactly like the rects in flow.js — not in rendered
// pixels. A rendered-pixel constant is only ever right at one size, and this
// composition is scaled twice: once from 1728 down to SCREEN_W, and again by
// the card (--pp-s, about 0.83 in the wide grid card and 0.55 in the square
// carousel slide). Chrome sized in rendered pixels therefore grew relative
// to the design at every step — the cursor was drawn at 20px, which is a
// 52px pointer on a 1728px screen, and the ring's 5px breathing room was
// wide enough to cross the form labels above and below whatever it sat on.
const CURSOR = 34;
// Breathing room tight enough to stay inside the design's own spacing. The
// binding case is the questionnaire, whose answer options sit 11 frame px
// apart — inset plus halo comes to 9, so a ring around one of them still
// stops short of the next. The signup fields, 87 apart, have room to spare.
const RING_INSET = 5;
const RING_STROKE = 4;
const RING_HALO = 4;
const TAP = 76;
const ADVANCE_SPINNER = 38;

// The inputs, measured off the exports rather than guessed: text ink starts
// 14 frame px in from the field's left edge, and the placeholder's cap-to-
// descender band is 15 frame px, which puts its type at about 16. The old
// overlay had no padding at all and floored its size at 6 rendered px, so
// typed text sat hard against the field's border a size larger than the
// design's own — the two most visible tells that the field was a patch.
const FIELD_PAD = 14;
const FIELD_TEXT = 16;

// The typed overlay's font — nothing in the exported screens is real text
// we can match exactly, so this is tuned to sit close to the geometric
// sans the designs render in.
const FIELD_FONT = '-apple-system, "Inter", "Helvetica Neue", Arial, sans-serif';

// The ring the cursor puts around a target, and the radius that ring needs
// to stay concentric with the control inside it. See `pill` / `radius` in
// flow.js for where the shapes come from.
function ringBox(target) {
  const [x, y, w, h] = target.rect;
  const inset = px(RING_INSET);
  const box = { left: px(x) - inset, top: px(y) - inset, width: px(w) + inset * 2, height: px(h) + inset * 2 };
  return { ...box, radius: target.pill ? box.height / 2 : px((target.radius ?? 8) + RING_INSET) };
}

// A ring that springs from one target to the next reads as attention moving
// down a form, which is what most of these screens ask for. It stops reading
// that way when the next target is most of a screen away and a different
// shape: the to-do screen goes from a 630-wide task row on the left to a
// 138-wide button in the guidance panel and back, and every frame in between
// is a large rectangle sliding across content it has nothing to do with. A
// move that long releases the ring and re-forms it on the new target instead
// — the cursor still travels, since a pointer crossing the screen is exactly
// what a hand does.
const LONG_MOVE = 0.3;

function legOf(targets, i) {
  let leg = 0;
  for (let k = 1; k <= i; k += 1) {
    const [ax, ay] = targets[k - 1].rect;
    const [bx, by] = targets[k].rect;
    if (Math.hypot(bx - ax, by - ay) > FRAME_W * LONG_MOVE) leg += 1;
  }
  return leg;
}

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

    // `pressed` is deliberately not a dependency, and the reset lives inside
    // the effect rather than in the handover timeout. With `pressed` in the
    // deps this effect re-ran the moment the press landed, and re-running it
    // cleared and re-armed the handover timer from zero — so every step
    // actually took its hold plus the fraction it had already spent, about
    // 1.6x what flow.js budgeted. The screen's own clock in AwemeShowcase
    // still advanced on the honest sum, which meant the cursor was cut off
    // partway down each screen: signup reached the password field of five
    // targets, intake never reached "Next". The click that every screen is
    // built around — "the click is what takes the flow to the next screen" —
    // and the ripple, checkbox tick and loading beat hanging off it, had no
    // opportunity to play at all.
    setPressed(false);

    const { hold, pressFrac } = stepTiming(i, holds[i]);
    // The press lands partway through the hold — the cursor arrives, sits
    // for a moment the way a hand does, and only then commits.
    const press = setTimeout(() => setPressed(true), hold * pressFrac);
    const next =
      i < targets.length - 1 ? setTimeout(() => setI((v) => v + 1), hold) : null;

    return () => {
      clearTimeout(press);
      if (next) clearTimeout(next);
    };
  }, [i, targets, holds, playing, anim]);

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

function TypedField({ rect, radius, text, mask, active }) {
  const chars = useTypedText(text, active);
  const [x, y, w, h] = rect;
  const shown = mask ? "•".repeat(chars) : text.slice(0, chars);
  // Both of these are the design's own numbers rather than a fraction of the
  // patch, so a 46px signup field and a 50px intake field set their text at
  // the same size — which is what the file does, and what the fields either
  // side of the one being typed into keep showing.
  const fontSize = px(FIELD_TEXT);
  const pad = px(FIELD_PAD);
  // Inset by the field's own hairline rather than a flat 2px: at this scale
  // 2px is more than a tenth of the field's height, so the patch used to
  // stop well short of the border and leave a rim of the original showing.
  const hairline = px(1.5);

  return (
    <div
      style={{
        position: "absolute",
        left: px(x) + hairline,
        top: px(y) + hairline,
        width: px(w) - hairline * 2,
        height: px(h) - hairline * 2,
        borderRadius: px(radius ?? 6),
        background: app.field,
        display: "flex",
        alignItems: "center",
        paddingLeft: pad,
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: FIELD_FONT,
        fontSize,
        letterSpacing: mask ? px(2) : 0,
        color: app.ink,
        whiteSpace: "nowrap",
      }}
    >
      {shown}
      {active && chars < text.length && (
        <motion.span
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          style={{ width: Math.max(0.75, px(2)), height: fontSize, marginLeft: px(2), background: app.ink }}
        />
      )}
    </div>
  );
}

// Persustain's fingertip, in AweMe's teal: a halo that springs open under
// the press and spends itself outward. Same choreography as the phone's own
// Tap — 0.5 to 1 to 1.5 with the opacity peaking a third of the way in — so
// the two cards read as one hand working, rather than two different ideas of
// what a tap looks like. Sized in frame px, so it stays a click on a desktop
// screen rather than the thumb-sized ring a phone mock wants.
function Tap({ x, y }) {
  const size = px(TAP);
  return (
    <motion.span
      aria-hidden="true"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1, 1.5], opacity: [0, 0.9, 0] }}
      transition={{ duration: 0.85, ease: "easeOut", times: [0, 0.35, 1] }}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: 9999,
        background: "rgba(67,134,146,0.16)",
        border: `${Math.max(0.75, px(5))}px solid rgba(67,134,146,0.45)`,
      }}
    />
  );
}

// The other half of Persustain's press language. On the phone the control
// itself takes the press — a chip scales to 0.94 under the finger and comes
// back. Here the control is part of a flat export, so this restates just its
// rectangle: the same screen image, clipped to the target and offset so it
// lines up pixel-for-pixel with what is already underneath, and scaled on
// the press. Invisible at rest, and on the press the real button is the
// thing that moves rather than only the ring drawn around it.
function PressSlice({ src, rect, radius, pressed }) {
  const [x, y, w, h] = rect;
  return (
    <motion.div
      animate={{ scale: pressed ? 0.965 : 1 }}
      transition={{ duration: 0.16, ease: easeBrand }}
      style={{
        position: "absolute",
        left: px(x),
        top: px(y),
        width: px(w),
        height: px(h),
        borderRadius: radius,
        overflow: "hidden",
      }}
    >
      <img
        src={src}
        alt=""
        decoding="async"
        // maxWidth has to be cleared explicitly: the global preflight caps
        // every img at 100% of its container, and this one is deliberately
        // far wider than the target it is clipped to — without this it gets
        // squashed to the target's own width and the slice shows a crop of
        // some other part of the screen instead of the control underneath it.
        style={{
          position: "absolute",
          left: -px(x),
          top: -px(y),
          width: SCREEN_W,
          maxWidth: "none",
          height: SCREEN_H,
          objectFit: "cover",
        }}
      />
    </motion.div>
  );
}

// Stands in for a dropdown opening: a couple of options fly in under the
// field while the cursor sits on it, "Kindergarten" already picked out,
// then it folds away right as the press that would close it lands.
function SelectFlyout({ rect, open }) {
  const [x, y, w, h] = rect;
  // In the frame's units like everything else here. The old floor of 16
  // rendered px happened to land close at this size, but it described a
  // 42-frame-px menu row — taller than the 50px field opening it.
  const rowH = px(44);

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
            left: px(x),
            top: px(y) + px(h) + px(8),
            width: px(w),
            borderRadius: px(12),
            background: "#fffefb",
            border: `${Math.max(0.5, px(2))}px solid ${app.border}`,
            boxShadow: `0 ${px(24)}px ${px(56)}px -${px(24)}px rgba(31,31,31,0.35)`,
            overflow: "hidden",
            fontFamily: FIELD_FONT,
            fontSize: px(FIELD_TEXT),
            transformOrigin: "top center",
          }}
        >
          <div
            style={{
              height: rowH,
              display: "flex",
              alignItems: "center",
              padding: `0 ${px(FIELD_PAD)}px`,
              background: "rgba(67,134,146,0.14)",
              color: app.teal,
              fontWeight: 600,
            }}
          >
            Kindergarten
          </div>
          <div style={{ height: rowH, display: "flex", alignItems: "center", padding: `0 ${px(FIELD_PAD)}px`, color: app.ink }}>
            1st Grade
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// A spinning ring, centred on (x, y) — the trailing beat on a control that's
// actually taking the flow somewhere (small, appearing after a short delay
// so it doesn't flash on every ordinary tap), and the bigger one standing in
// for the processing screen's own "this is working" loader (present from
// the moment it mounts, no delay, since the whole screen is the loader).
function RingSpinner({ x, y, size = 14, strokeWidth = 2, color = app.teal, delay = 0 }) {
  const r = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * r;
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, rotate: 360 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.16, delay },
        rotate: { duration: 0.9, repeat: Infinity, ease: "linear" },
      }}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", left: x - size / 2, top: y - size / 2 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.42} ${circumference}`}
      />
    </motion.svg>
  );
}

// The export shows this radio option already picked — a real one starts
// empty. This covers it with a plain circle and only draws the dot in once
// the press that would have picked it actually lands, so the pick reads as
// something that happens rather than something that was always true.
function RadioOverlay({ rect, selected }) {
  const [x, y, w, h] = rect;
  return (
    <motion.div
      initial={false}
      animate={{ borderColor: selected ? app.brown : app.border }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        left: px(x),
        top: px(y),
        width: px(w),
        height: px(h),
        borderRadius: "50%",
        background: "#ffffff",
        borderWidth: Math.max(0.5, px(3)),
        borderStyle: "solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.span
        initial={false}
        animate={{ scale: selected ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 16 }}
        style={{ width: "46%", height: "46%", borderRadius: "50%", background: app.brown, display: "block" }}
      />
    </motion.div>
  );
}

// Same idea as the radio, for the one checkbox the export shows already
// ticked — starts as a plain box and only fills in, teal with a white
// check, once the press lands.
function CheckboxOverlay({ rect, checked }) {
  const [x, y, w, h] = rect;
  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: checked ? app.teal : "#ffffff", borderColor: checked ? app.teal : app.control }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        left: px(x),
        top: px(y),
        width: px(w),
        height: px(h),
        // Both of these in the box's own proportion. A 3px floor on the radius
        // was more than a third of this control's rendered width, which
        // rounded the design's square checkbox into a circle.
        borderRadius: px(w * 0.22),
        borderWidth: Math.max(0.5, px(3)),
        borderStyle: "solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.svg
        initial={false}
        animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        width="70%"
        height="70%"
        viewBox="0 0 12 10"
      >
        <path d="M1 5.2 4.3 8.5 11 1.2" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </motion.div>
  );
}

// A step bar that actually steps: the export bakes in its finished width, so
// this covers the whole track and regrows the fill from zero on every visit
// to the screen, rather than a progress bar that's silently always done.
function ProgressBar({ track, fill }) {
  const [x, y, w, h] = track;
  return (
    <div
      style={{
        position: "absolute",
        left: px(x),
        top: px(y),
        width: px(w),
        height: px(h),
        borderRadius: px(h) / 2,
        background: "#e9e2d3",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: px(fill) }}
        transition={{ duration: 1.1, ease: easeBrand, delay: 0.3 }}
        style={{ height: "100%", borderRadius: "inherit", background: app.teal }}
      />
    </div>
  );
}

function Pointer({ x, y, pressed }) {
  // A pointer stated in the frame's own units: 34 of them, which is about
  // what a real cursor measures on a 1728px screen. The old fixed 20 rendered
  // px worked out at 52 frame px — a cursor as tall as the form fields it was
  // pointing at, and proportionally larger again on the smaller card.
  const size = px(CURSOR);
  return (
    // Fade and position are two separate motion values on two separate
    // elements on purpose — Framer collapses a duration-based fade into an
    // instant cut when it shares a transition object with a spring on a
    // property that isn't actually moving (mount-time x/y equal their own
    // target), so the fade gets its own wrapper with nothing else going on.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <motion.div
        initial={false}
        animate={{ x, y }}
        transition={{ x: POINTER_SPRING, y: POINTER_SPRING }}
        style={{ position: "absolute", left: 0, top: 0, width: size, height: size }}
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
          width={size}
          height={size}
          viewBox="0 0 20 20"
          style={{ filter: `drop-shadow(0 ${px(4)}px ${px(8)}px rgba(31,31,31,0.45))` }}
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
    </motion.div>
  );
}

// The radios and checkboxes an export bakes in as already picked, drawn back
// as untouched — and drawn inside the screen's own layer rather than in the
// overlay above it. They have to fade in with the image they belong to: an
// overlay that fades on its own clock is only half-opaque while its screen is
// arriving, so for the first fraction of a second of every visit the export's
// pre-ticked checkbox showed straight through the thing covering it, which is
// the one state this whole mechanism exists to avoid. The live copies in
// Guide below, which actually tick, sit on top of these and start from the
// same untouched state, so there is nothing to see between the two.
function ScreenCovers({ targets }) {
  return (
    <>
      {targets.map(
        (t, i) => t.bakedOn && t.radioRect && <RadioOverlay key={`radio-${i}`} rect={t.radioRect} selected={false} />
      )}
      {targets.map(
        (t, i) =>
          t.bakedOn && t.checkboxRect && <CheckboxOverlay key={`checkbox-${i}`} rect={t.checkboxRect} checked={false} />
      )}
    </>
  );
}

function Guide({ src, targets, holds, playing, anim }) {
  const { index, pressed } = useSteps(targets, holds, playing, anim);
  if (!anim || targets.length === 0) return null;

  const target = targets[index];
  const [x, y, w, h] = target.rect;
  const { radius: ringRadius, ...ring } = ringBox(target);
  // The pointer sits just inside the target rather than dead centre, so a
  // wide card doesn't get a cursor stranded in the middle of its own text.
  const tipX = px(x) + Math.min(px(w) * 0.5, px(120));
  const tipY = px(y) + Math.min(px(h) * 0.62, px(78));
  const clicking = pressed && target.click;
  // The click that actually leaves the screen — the last target in the
  // list — is the one that earns a loading beat; a mid-screen tap (marking
  // a to-do done, picking a radio option) doesn't go anywhere, so it stays
  // just a tap.
  const advancing = clicking && index === targets.length - 1;

  return (
    <>
      {/* Under everything else the overlay puts on the screen, so the typed
          text, the checkbox and the ring all ride the press with it. Only a
          target that is actually clicked gets one. */}
      {target.click && <PressSlice src={src} rect={target.rect} radius={ringRadius} pressed={clicking} />}

      {/* Fields already typed keep showing what they typed — only the
          field the cursor is on right now is still filling in. */}
      {targets.map(
        (t, i) =>
          t.type &&
          i <= index && (
            <TypedField key={i} rect={t.rect} radius={t.radius} text={t.type} mask={t.mask} active={i === index} />
          )
      )}

      {target.select && <SelectFlyout rect={target.rect} open={!pressed} />}

      {/* Marks render for every step of the screen, not just their own: one
          the cursor makes on step two has to stay made through step three,
          the same way a field that's been typed into keeps what it holds. A
          `bakedOn` mark is also drawn *before* its own step, unpicked, to
          cover what the export already shows. One that isn't has nothing to
          cover, so nothing is drawn over it until the press lands and the
          export's own control is what stays on screen — a redrawn copy
          sitting among untouched neighbours never quite matches them. */}
      {targets.map((t, i) => {
        const made = i < index || (i === index && pressed);
        return (
          t.radioRect &&
          (t.bakedOn || made) && <RadioOverlay key={`radio-${i}`} rect={t.radioRect} selected={made} />
        );
      })}
      {targets.map((t, i) => {
        const made = i < index || (i === index && pressed);
        return (
          t.checkboxRect &&
          (t.bakedOn || made) && <CheckboxOverlay key={`checkbox-${i}`} rect={t.checkboxRect} checked={made} />
        );
      })}

      {/* Not there the instant the screen appears — it only settles in a
          beat later, the way a real focus ring follows attention rather
          than pre-empting it. The fade lives on its own wrapper (see
          Pointer above for why) so it isn't cut short by the position
          spring on the ring inside it; that inner spring only kicks in on a
          move to the next target within the same screen. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <AnimatePresence>
          {/* Keyed by leg, not by step: consecutive targets close enough to
              belong to one gesture share a key, so the element persists and
              the springs below carry it. A long move changes the key, and
              this one is released where it stands while the next fades up
              already in place. */}
          <motion.div
            key={`ring-${legOf(targets, index)}`}
            initial={{ opacity: 0, ...ring }}
            animate={{ opacity: 1, ...ring, scale: clicking ? 0.97 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              left: RING_SPRING,
              top: RING_SPRING,
              width: RING_SPRING,
              height: RING_SPRING,
              scale: { duration: 0.12 },
              opacity: { duration: 0.22, ease: easeBrand },
            }}
            style={{
              position: "absolute",
              borderRadius: ringRadius,
              border: `${Math.max(0.75, px(RING_STROKE))}px solid ${app.teal}`,
              boxShadow: `0 0 0 ${px(RING_HALO)}px rgba(67,134,146,0.14), 0 ${px(12)}px ${px(36)}px rgba(67,134,146,0.18)`,
            }}
          />
        </AnimatePresence>
      </motion.div>

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
            style={{ ...ring, position: "absolute", borderRadius: ringRadius, background: "rgba(67,134,146,0.16)" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{clicking && <Tap key={`${index}-tap`} x={tipX} y={tipY} />}</AnimatePresence>

      <AnimatePresence>
        {advancing && (
          <RingSpinner
            key={`${index}-spinner`}
            x={px(x) + px(w) - px(ADVANCE_SPINNER)}
            y={px(y) + px(h) / 2}
            size={px(ADVANCE_SPINNER)}
            strokeWidth={Math.max(1, px(6))}
            delay={0.2}
          />
        )}
      </AnimatePresence>

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
      {/* Every frame stays mounted and changes on opacity: they're all
          fetched up front (348KB for the set), so no screen in the loop can
          arrive as a blank rectangle the first time it comes round.

          The next screen paints over the one before it rather than the two
          dissolving through each other. These are nine dense, full-page
          layouts that share almost no structure, so a symmetric crossfade put
          both on screen at half strength for the better part of half a
          second and read as a double exposure — one screen's headings and
          form rows showing straight through another's. Here the outgoing
          frame holds full opacity underneath and is only dropped once it is
          completely covered, which is how a real page navigation lands and
          leaves no moment where the card is empty. Ordering is explicit
          rather than left to the DOM, since the loop wraps from the last
          screen back to the first. The incoming frame settles the last
          fraction of a percent of its scale on the way in — the same "this
          is the outcome of what just happened" entrance Persustain's
          confirmation screen uses. */}
      {FLOW.map((f, i) => {
        const current = i === state;
        // The one screen with nothing to click still needs to look alive
        // rather than frozen — a slow breathing scale stands in for "this
        // is thinking", the way a spinner or a skeleton shimmer would.
        const thinking = current && f.targets.length === 0;
        return (
          <motion.div
            key={f.id}
            initial={false}
            animate={{ opacity: current ? 1 : 0, scale: thinking ? [1, 1.012, 1] : current ? 1 : 1.012 }}
            transition={{
              opacity: current
                ? { duration: 0.28, ease: easeBrand }
                : { duration: 0, delay: 0.28 },
              scale: thinking
                ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.5, ease: easeBrand },
            }}
            style={{ position: "absolute", inset: 0, zIndex: current ? 2 : 1 }}
          >
            <img
              src={f.src}
              alt=""
              decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            {anim && <ScreenCovers targets={f.targets} />}
          </motion.div>
        );
      })}

      <AnimatePresence mode="wait">
        <motion.div
          key={screen.id}
          initial={anim ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Matched to the image swap above: mode="wait" runs the exit and
          // then the enter, so the outgoing screen's overlay is gone by the
          // time that screen has finished fading, and the incoming one
          // arrives with its own. They used to run on separate clocks — a
          // 0.28s overlay against a 0.45s crossfade — which left the previous
          // screen's field patches, ring and cursor sitting over the new
          // screen at coordinates that belonged to the old one.
          transition={{ duration: 0.22, ease: easeBrand }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }}
        >
          {/* These two are the page's own motion, not the cursor's — they
              play every time the screen is entered, whether or not a hand
              is doing anything on it. */}
          {anim && screen.progress && <ProgressBar track={screen.progress.track} fill={screen.progress.fill} />}
          {anim && screen.spinner && (
            <RingSpinner
              x={px(screen.spinner.rect[0]) + px(screen.spinner.rect[2]) / 2}
              y={px(screen.spinner.rect[1]) + px(screen.spinner.rect[3]) / 2}
              size={px(screen.spinner.rect[2])}
              strokeWidth={3}
              color={app.teal}
            />
          )}
          <Guide src={screen.src} targets={screen.targets} holds={screen.holds} playing={playing} anim={anim} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
