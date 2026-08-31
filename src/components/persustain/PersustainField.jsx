import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { easeBrand } from "../../styles/tokens";
import { LIFECYCLE, stage } from "./tokens";

/**
 * The system around the product — the half of the story a screen can't tell.
 *
 * One anchor holds all three of its beats together: the shared project node.
 * Beat 02 sends the contribution into it, beat 03 unfolds the lifecycle that
 * makes the contribution trustworthy, beat 04 pulls back to the other people
 * feeding the same node. Keeping one anchor is what stops the sequence
 * reading as four unrelated slides.
 *
 * Everything is laid out in a fixed 1152x420 space and scaled as a whole by
 * the parent, so these coordinates are stable design decisions rather than
 * values that drift with the viewport.
 */

export const FIELD_W = 1152;
export const FIELD_H = 420;

const NODE = { x: 648, y: 200, r: 34 };
// Leaves the phone's right edge (stage x 424) and arrives at the node's rim.
const FLOW = "M424 190 C 500 190, 540 200, 612 200";

const PLATE = { x: 812, w: 292, h: 46, top: 47, gap: 56 };
const SPINE_X = 782;
const plateMid = (i) => PLATE.top + i * PLATE.gap + PLATE.h / 2;

// Hand-placed rather than generated: an even ring reads as a diagram, and a
// composed scatter reads as people. The first is "you" — the contribution
// the loop has just followed, nearest the phone it came from.
const CONTRIBUTORS = [
  { x: 470, y: 236, you: true },
  { x: 500, y: 92 },
  { x: 508, y: 330 },
  { x: 632, y: 392 },
  { x: 770, y: 356 },
  { x: 852, y: 244 },
  { x: 838, y: 118 },
  { x: 726, y: 46 },
  { x: 592, y: 44 },
  { x: 948, y: 330 },
  { x: 986, y: 168 },
  { x: 906, y: 60 },
];

// A slight bow on each path, perpendicular to its run, so nine lines meeting
// one point read as flow rather than as a starburst.
const converge = ({ x, y }) => {
  const mx = (x + NODE.x) / 2;
  const my = (y + NODE.y) / 2;
  const dx = NODE.x - x;
  const dy = NODE.y - y;
  const len = Math.hypot(dx, dy) || 1;
  const bow = 26;
  return `M${x} ${y} Q ${mx - (dy / len) * bow} ${my + (dx / len) * bow} ${NODE.x} ${NODE.y}`;
};

function Label({ children, style, ...rest }) {
  return (
    <motion.p
      {...rest}
      style={{
        position: "absolute",
        margin: 0,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </motion.p>
  );
}

export default function PersustainField({ state }) {
  const reduced = useReducedMotion();
  const flowing = state >= 1;
  const trusting = state === 2;
  const collective = state === 3;
  const anim = !reduced;

  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: FIELD_W, height: FIELD_H }}
    >
      <svg
        width={FIELD_W}
        height={FIELD_H}
        viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
        fill="none"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="pp-flow" x1="424" y1="192" x2="654" y2="206" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={stage.accent} stopOpacity="0" />
            <stop offset="40%" stopColor={stage.accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={stage.accent} stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="pp-halo">
            <stop offset="0%" stopColor={stage.accent} stopOpacity="0.30" />
            <stop offset="70%" stopColor={stage.accent} stopOpacity="0.05" />
            <stop offset="100%" stopColor={stage.accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Halo — the only thing in the field during beat 01, so the node is
            already present as a place before anything travels to it. */}
        <motion.circle
          cx={NODE.x}
          cy={NODE.y}
          r={128}
          fill="url(#pp-halo)"
          initial={false}
          animate={{ opacity: state === 0 ? 0.5 : 1, scale: collective ? 1.15 : 1 }}
          transition={{ duration: 1, ease: easeBrand }}
          style={{ transformOrigin: `${NODE.x}px ${NODE.y}px` }}
        />

        {/* Beat 04's expanding rings, read as the project's reach widening. */}
        <AnimatePresence>
          {collective &&
            anim &&
            [0, 1].map((i) => (
              <motion.circle
                key={`ring-${i}`}
                cx={NODE.x}
                cy={NODE.y}
                r={NODE.r}
                stroke={stage.accent}
                strokeWidth={1}
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 5.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.4, delay: 0.5 + i * 0.7, ease: "easeOut" }}
                style={{ transformOrigin: `${NODE.x}px ${NODE.y}px` }}
              />
            ))}
        </AnimatePresence>

        {/* Beat 02 — one contribution enters the shared project. */}
        <motion.path
          d={FLOW}
          stroke="url(#pp-flow)"
          strokeWidth={1.25}
          initial={false}
          animate={{ pathLength: flowing ? 1 : 0, opacity: flowing ? 1 : 0 }}
          transition={{ duration: anim ? 0.9 : 0, ease: easeBrand }}
        />
        <AnimatePresence>
          {state === 1 && anim && (
            <motion.circle
              key="parcel"
              r={4}
              fill={stage.accent}
              initial={{ opacity: 0, offsetDistance: "0%" }}
              animate={{ opacity: [0, 1, 1, 0], offsetDistance: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, delay: 0.45, ease: "easeInOut", times: [0, 0.15, 0.8, 1] }}
              style={{ offsetPath: `path("${FLOW}")`, filter: `drop-shadow(0 0 6px ${stage.accent})` }}
            />
          )}
        </AnimatePresence>

        {/* Present in every beat at a whisper, so the wide half of the card
            is never empty and beat 04 reads as pulling back rather than as
            something new appearing. */}
        <motion.g
          initial={false}
          animate={{ opacity: state >= 2 ? 0 : 1 }}
          transition={{ duration: 0.5, ease: easeBrand }}
        >
          {CONTRIBUTORS.map((point) => (
            <circle
              key={`ghost-${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r={2.6}
              fill="#FFFDF7"
              fillOpacity={0.14}
            />
          ))}
        </motion.g>

        {/* Beat 04 — the same node, seen from far enough back to show the
            others feeding it. */}
        <AnimatePresence>
          {collective &&
            CONTRIBUTORS.map((point, i) => (
              <motion.g key={`c-${point.x}-${point.y}`} exit={{ opacity: 0 }}>
                <motion.path
                  d={converge(point)}
                  stroke={point.you ? stage.accent : "#FFFFFF"}
                  strokeOpacity={point.you ? 0.5 : 0.16}
                  strokeWidth={point.you ? 1.1 : 0.9}
                  initial={anim ? { pathLength: 0 } : false}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: anim ? 0.25 + i * 0.07 : 0, ease: easeBrand }}
                />
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={point.you ? 5 : 3.4}
                  fill={point.you ? stage.accent : "#FFFDF7"}
                  fillOpacity={point.you ? 1 : 0.45}
                  initial={anim ? { scale: 0, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: anim ? 0.2 + i * 0.07 : 0, ease: easeBrand }}
                  style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                />
              </motion.g>
            ))}
        </AnimatePresence>

        {/* Beat 03 — the spine the lifecycle hangs from. */}
        <AnimatePresence>
          {trusting && (
            <motion.g key="spine" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <motion.path
                d={`M${NODE.x + NODE.r} ${NODE.y} C ${NODE.x + 66} ${NODE.y}, ${SPINE_X - 30} ${plateMid(0)}, ${SPINE_X} ${plateMid(0)}`}
                stroke={stage.accent}
                strokeOpacity={0.45}
                strokeWidth={1}
                initial={anim ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: easeBrand }}
              />
              <motion.path
                d={`M${SPINE_X} ${plateMid(0)} V ${plateMid(LIFECYCLE.length - 1)}`}
                stroke="#FFFFFF"
                strokeOpacity={0.2}
                strokeWidth={1}
                initial={anim ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: easeBrand }}
              />
              {LIFECYCLE.map((row, i) => (
                <motion.path
                  key={row.name}
                  d={`M${SPINE_X} ${plateMid(i)} H ${PLATE.x}`}
                  stroke={row.tone}
                  strokeOpacity={0.55}
                  strokeWidth={1}
                  initial={anim ? { pathLength: 0 } : false}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.28, delay: anim ? 0.45 + i * 0.11 : 0 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* The shared project. Present from the first frame, so the loop has
            somewhere to be going before it goes there. */}
        <motion.circle
          cx={NODE.x}
          cy={NODE.y}
          r={NODE.r + 12}
          stroke="#FFFFFF"
          strokeOpacity={0.14}
          strokeWidth={1}
          initial={false}
          animate={{ scale: collective ? 1.08 : 1 }}
          transition={{ duration: 0.9, ease: easeBrand }}
          style={{ transformOrigin: `${NODE.x}px ${NODE.y}px` }}
        />
        <motion.circle
          cx={NODE.x}
          cy={NODE.y}
          r={NODE.r}
          fill="rgba(255,255,255,0.06)"
          stroke={stage.accent}
          initial={false}
          animate={{
            strokeOpacity: state === 0 ? 0.22 : 0.6,
            scale: collective ? 1.08 : 1,
          }}
          transition={{ duration: 0.9, ease: easeBrand }}
          style={{ transformOrigin: `${NODE.x}px ${NODE.y}px` }}
        />

        {/* The project's mark, drawn rather than placed: the illustration in
            the design file is a raster on an opaque white ground and cannot
            sit on a dark node. */}
        <g transform={`translate(${NODE.x - 16} ${NODE.y - 17}) scale(1.35)`}>
          <motion.g
            initial={false}
            animate={{ opacity: state === 0 ? 0.45 : 1 }}
            transition={{ duration: 0.9, ease: easeBrand }}
          >
            <path
              d="M11.8 13.4C8.2 13.4 5.5 10.7 5.5 7.1c3.6 0 6.3 2.7 6.3 6.3Z"
              fill={stage.accent}
              fillOpacity={0.22}
              stroke={stage.accent}
              strokeWidth={1.3}
              strokeLinejoin="round"
            />
            <path
              d="M12.2 12.2c0-4 2.7-6.7 6.3-6.7 0 3.6-2.7 6.7-6.3 6.7Z"
              fill={stage.accent}
              fillOpacity={0.35}
              stroke={stage.accent}
              strokeWidth={1.3}
              strokeLinejoin="round"
            />
            <path
              d="M12 20.5V11.4"
              stroke={stage.accent}
              strokeWidth={1.3}
              strokeLinecap="round"
            />
          </motion.g>
        </g>
      </svg>

      <AnimatePresence>
        {state === 1 && (
          <Label
            key="yours"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: easeBrand }}
            style={{ left: 452, top: 158, color: stage.accent }}
          >
            Your contribution
          </Label>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state >= 1 && (
          <Label
            key="project"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.72, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: easeBrand }}
            style={{
              left: NODE.x,
              top: NODE.y + 50,
              // A motion component composes its transform from motion values
              // rather than passing a raw transform string through — setting
              // `transform` here is silently dropped, which is why this sat
              // flush against the node's left edge instead of centred under
              // it. `x` is the motion-value equivalent of translateX.
              x: "-50%",
              fontSize: 9.5,
              color: stage.textMuted,
            }}
          >
            Shared Climate Project
          </Label>
        )}
      </AnimatePresence>

      {/* The payoff: one figure, at the end, in the card's own warm accent. */}
      <AnimatePresence>
        {collective && (
          <motion.p
            key="total"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: easeBrand }}
            style={{
              position: "absolute",
              left: NODE.x,
              top: NODE.y + 80,
              x: "-50%",
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: stage.accent,
              whiteSpace: "nowrap",
            }}
          >
            96 <span style={{ fontSize: 13, opacity: 0.7 }}>kg CO₂e</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Beat 03 — Project, Evidence, Verification, Certificate, each with
          the trust state it is actually in. */}
      <AnimatePresence>
        {trusting &&
          LIFECYCLE.map((row, i) => {
            const last = i === LIFECYCLE.length - 1;
            return (
              <motion.div
                key={row.name}
                initial={anim ? { opacity: 0, x: 18 } : false}
                animate={{ opacity: row.live ? 1 : 0.58, x: 0 }}
                exit={{ opacity: 0, x: 12, transition: { duration: 0.3, delay: i * 0.03 } }}
                transition={{ duration: 0.45, delay: anim ? 0.45 + i * 0.11 : 0, ease: easeBrand }}
                style={{
                  position: "absolute",
                  left: PLATE.x,
                  top: PLATE.top + i * PLATE.gap,
                  width: PLATE.w,
                  height: PLATE.h,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: `1px solid ${last ? "rgba(255,228,168,0.26)" : stage.plateEdge}`,
                  background: last ? "rgba(255,228,168,0.06)" : stage.plate,
                }}
              >
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 9.5,
                    lineHeight: 1,
                    letterSpacing: "0.08em",
                    color: "rgba(255,253,247,0.45)",
                    flexShrink: 0,
                  }}
                >
                  {row.step}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.15,
                    color: stage.text,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {row.name}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 8px",
                    borderRadius: 9999,
                    border: `1px solid ${stage.hairline}`,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 9,
                    lineHeight: 1,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,247,232,0.78)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{ width: 5, height: 5, borderRadius: 9999, background: row.tone, flexShrink: 0 }}
                  />
                  {row.status}
                </span>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
