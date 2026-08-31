import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { easeBrand } from "../../styles/tokens";
import { STATES, stage } from "./tokens";
import PersustainPhone, { PHONE_H, PHONE_W } from "./PersustainPhone";
import PersustainField, { FIELD_H, FIELD_W } from "./PersustainField";

/**
 * The featured project card's centrepiece: a four-beat loop that walks the
 * Persustain product system — measure, connect, build trust, see impact —
 * and returns to the start without a seam.
 *
 * It is composed rather than assembled. The phone is the focal point only
 * while the story is about one person's action; from beat 02 the system
 * expands past the device and the phone steps back. Read at any instant it
 * should still look like a finished frame, which is why every beat holds
 * one idea and nothing is mid-transition for long.
 *
 * Two layouts share one state machine: the wide card gets the full spatial
 * composition, and the square carousel slide — where a field would be
 * illegible — gets the phone alone, carrying all four beats on its screen,
 * plus a one-line stand-in for the field's own connect-beat story (see
 * ConnectLine below).
 */

const RAIL_W = 190;
const PHONE_X = 238;
// The compact caption block: padding, the caption line, and the segments
// stacked under it — a square card has no room to set them side by side.
const CAPTION_ROW_H = 50;
// The compact card's connect-beat line, reserved whether or not it's showing
// text, so the phone above it doesn't change size as the line appears and
// disappears each loop.
const CONNECT_ROW_H = 20;

// Runs the loop, banking elapsed time when `playing` drops so a beat that
// stopped — because the card scrolled out of view — picks up where it left
// off instead of restarting. Hover never stops it; only visibility does.
function useLoop({ playing, enabled }) {
  const [index, setIndex] = useState(0);
  const remaining = useRef(STATES[0].ms);
  const startedAt = useRef(0);
  const advanced = useRef(false);

  useEffect(() => {
    if (!enabled || !playing) return;
    advanced.current = false;
    startedAt.current = performance.now();
    const id = setTimeout(() => {
      advanced.current = true;
      setIndex((i) => {
        const next = (i + 1) % STATES.length;
        remaining.current = STATES[next].ms;
        return next;
      });
    }, remaining.current);
    return () => {
      clearTimeout(id);
      if (advanced.current) return;
      const elapsed = performance.now() - startedAt.current;
      remaining.current = Math.max(250, remaining.current - elapsed);
    };
  }, [index, playing, enabled]);

  return index;
}

// Four segments: filled for beats already passed, sweeping for the current
// one, empty ahead. The sweep is a CSS animation so it pauses in place with
// the timer rather than drifting out of step with it.
function Progress({ index, playing, enabled, inline = false }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: inline ? 0 : 18 }}>
      {STATES.map((state, i) => (
        <span
          key={state.id}
          style={{
            width: 34,
            height: 2,
            borderRadius: 2,
            overflow: "hidden",
            background: "rgba(255,255,255,0.16)",
          }}
        >
          <span
            key={i === index ? `run-${index}` : "idle"}
            style={{
              display: "block",
              height: "100%",
              background: stage.accent,
              transformOrigin: "left center",
              transform: i < index ? "scaleX(1)" : "scaleX(0)",
              opacity: i < index ? 0.45 : 1,
              ...(i === index && enabled
                ? {
                    animation: `pp-progress ${state.ms}ms linear forwards`,
                    animationPlayState: playing ? "running" : "paused",
                  }
                : null),
              ...(i === index && !enabled ? { transform: "scaleX(1)" } : null),
            }}
          />
        </span>
      ))}
    </div>
  );
}

function StateLabel({ index, enabled }) {
  const state = STATES[index];
  return (
    <div style={{ height: 18, position: "relative" }}>
      <AnimatePresence mode="wait">
        <motion.p
          key={state.id}
          initial={enabled ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease: easeBrand }}
          className="type-label-mono"
          style={{
            position: "absolute",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: stage.text,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: stage.accent }}>{state.index}</span>
          <span style={{ opacity: 0.35, padding: "0 6px" }}>/</span>
          {state.name}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// The compact card's stand-in for what the wide field shows with motion:
// the contribution named, and where it's headed. Reserved space either way
// so its appearance on the connect beat doesn't nudge the phone above it.
function ConnectLine({ show, enabled }) {
  return (
    <div style={{ height: CONNECT_ROW_H, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <AnimatePresence>
        {show && (
          <motion.p
            initial={enabled ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: easeBrand }}
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 9.5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              color: stage.textMuted,
            }}
          >
            <span style={{ color: stage.accent }}>Your contribution</span>
            <motion.span
              aria-hidden="true"
              animate={enabled ? { x: [0, 3, 0] } : undefined}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              style={{ color: stage.accent, opacity: 0.7 }}
            >
              →
            </motion.span>
            <span>Shared Climate Project</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PersustainShowcase({ variant = "featured" }) {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  // Nothing runs until the card is on screen: this sits well below the fold,
  // and a loop running the whole time someone reads the hero is work for no
  // one.
  const inView = useInView(rootRef, { amount: 0.35 });
  const enabled = !reduced;
  const index = useLoop({ playing: inView, enabled });

  const compact = variant === "compact";
  const [scale, setScale] = useState(1);

  // The composition is laid out once at a fixed size and scaled as a whole,
  // so its proportions hold at every width instead of reflowing into a
  // different — and worse — arrangement per breakpoint.
  const boxW = compact ? PHONE_W : FIELD_W;
  const boxH = compact ? PHONE_H : FIELD_H;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const h = el.clientHeight - (compact ? CAPTION_ROW_H + CONNECT_ROW_H : 0);
      setScale(Math.max(0.2, Math.min(1, el.clientWidth / boxW, h / boxH)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [boxW, boxH, compact]);

  const box = (
    <div className="pp-box" style={{ "--pp-s": scale, "--pp-w": `${boxW}px`, "--pp-h": `${boxH}px` }}>
      <div className="pp-stage">
        {compact ? (
          <PersustainPhone state={index} carriesAllStates />
        ) : (
          <div style={{ position: "relative", width: FIELD_W, height: FIELD_H }}>
            <PersustainField state={index} />

            <div style={{ position: "absolute", left: PHONE_X, top: (FIELD_H - PHONE_H) / 2 }}>
              <PersustainPhone state={index} />
            </div>

            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: RAIL_W,
                height: FIELD_H,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <StateLabel index={index} enabled={enabled} />
              <Progress index={index} playing={inView} enabled={enabled} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div
        ref={rootRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-5 z-[1] flex flex-col"
      >
        <div className="grid flex-1 place-items-center">{box}</div>
        <ConnectLine show={index === 1} enabled={enabled} />
        <div className="pt-2">
          <StateLabel index={index} enabled={enabled} />
          <div className="mt-2">
            <Progress index={index} playing={inView} enabled={enabled} inline />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-10 z-[1] grid place-items-center"
    >
      {box}
    </div>
  );
}
