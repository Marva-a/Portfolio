import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import AwemeScreen from "./AwemeScreen";
import { FLOW, SCREEN_H, SCREEN_W } from "./flow";

/**
 * AweMe's project card. Same contract as PersustainShowcase — run the loop,
 * pause it only when the card scrolls out of view, scale one fixed-size
 * composition to whatever footprint the card gives it — but AweMe's story
 * is the product itself rather than a system around it, so there's no field
 * beside the screen and no caption under it. See AwemeScreen.jsx.
 */

export default function AwemeShowcase({ variant = "featured" }) {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { amount: 0.35 });
  const enabled = !reduced;

  const [index, setIndex] = useState(0);
  const remaining = useRef(FLOW[0].ms);
  const startedAt = useRef(0);
  const advanced = useRef(false);

  // Banks elapsed time when the card scrolls away, so a screen that stopped
  // halfway picks up where it left off instead of restarting.
  useEffect(() => {
    if (!enabled || !inView) return;
    advanced.current = false;
    startedAt.current = performance.now();
    const id = setTimeout(() => {
      advanced.current = true;
      setIndex((i) => {
        const next = (i + 1) % FLOW.length;
        remaining.current = FLOW[next].ms;
        return next;
      });
    }, remaining.current);
    return () => {
      clearTimeout(id);
      if (advanced.current) return;
      remaining.current = Math.max(250, remaining.current - (performance.now() - startedAt.current));
    };
  }, [index, inView, enabled]);

  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      setScale(Math.max(0.2, Math.min(1, el.clientWidth / SCREEN_W, el.clientHeight / SCREEN_H)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`pointer-events-none absolute z-[1] grid place-items-center ${variant === "compact" ? "inset-5" : "inset-8"}`}
    >
      <div className="pp-box" style={{ "--pp-w": `${SCREEN_W}px`, "--pp-h": `${SCREEN_H}px`, "--pp-s": scale }}>
        <div className="pp-stage">
          <AwemeScreen state={index} playing={inView && enabled} />
        </div>
      </div>
    </div>
  );
}
