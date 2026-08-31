import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { easeBrand } from "../styles/tokens";
import { ICONS } from "./persustainIcons";
import leafArt from "../assets/persustain-leaf.webp";

/**
 * A miniature of the Persustain app playing its own core loop, for the
 * featured project card. The case study frames the real Expo build, which is
 * a few MB and needs a click to load; the homepage card needs something that
 * says what the product *is* in the two seconds someone spends scrolling
 * past it. So this is a recreation rather than a recording: vector-crisp at
 * any size, a few KB, and every number, bar and transition can be animated
 * on the beat instead of played back.
 *
 * It is built from the Figma source (file Sf14iAq3vZfvhbOGhqONLL, page
 * "Persustain - screens"), not from the shipped Expo build — the two have
 * drifted, and the Figma is the newer design. Five beats, five real frames:
 *
 *   0. Measure   — Dashboard (1:15434): footprint counts up against baseline
 *   1. Log       — add activity (1:15946): "What did you do?"
 *   2. Confirm   — add activity- save (8:3768): the estimate before saving
 *   3. Calculate — add activity complete (12:893): 0.09 kg CO₂e, logged
 *   4. Attribute — Dashboard scrolled to "My Impact so far"
 *
 * The dashboard is one continuous column, as in the design, so the last beat
 * is a genuine scroll rather than a different screen — which is what makes
 * the cycle read as a loop and not a slideshow.
 *
 * Two deliberate departures from the file: its Add Activities header reads
 * "ADD ACTIVTIES" (a typo not worth reproducing on a homepage), and the
 * Footprint Movement card sits at x=22.5/w=348 where the two cards above it
 * are x=20/w=353 — all three are set flush here.
 */

/* ------------------------------------------------------------- geometry */

// Everything below is expressed in the Figma frame's own pixels and scaled
// through u(). The mock is a 393x852 screen rendered at SCREEN_W, so any
// value can be copied straight out of the design and stays in proportion.
const FIG_W = 393;
const FIG_H = 852;
const SCREEN_W = 230;
const U = SCREEN_W / FIG_W;
const u = (n) => +(n * U).toFixed(3);

const SCREEN_H = Math.round(FIG_H * U);
const BEZEL = 7;
const PHONE_W = SCREEN_W + BEZEL * 2;
const PHONE_H = SCREEN_H + BEZEL * 2;

const HEADER_H = u(124);
const NAV_H = u(73);
const BODY_H = SCREEN_H - HEADER_H - NAV_H;

/* --------------------------------------------------------------- tokens */

// Persustain's own palette and type, read out of the Figma file's variables
// and text styles. This is a mock of another product's UI, so it uses those
// tokens rather than this site's.
const app = {
  ink: "#1A1B1C",
  ink80: "rgba(26,27,28,0.8)",
  ink70: "rgba(26,27,28,0.7)",
  ink30: "rgba(26,27,28,0.3)",
  ink20: "rgba(26,27,28,0.2)",
  secondary: "#3A3B3D",
  tertiary: "#595A5B",
  muted: "#959697",
  divider: "#D8D9DB",
  navLine: "#F3F4F8",
  blue700: "#1E3CB5",
  blue600: "#2A46C1",
  blue500: "#304ECB",
  blue400: "#5469D4",
  info: "#6366F1",
  info700: "#4338CA",
  blue50: "#E8EAF9",
  success: "#15803D",
  orange: "#EE861E",
  lake50: "#DFF8FD",
  sun50: "#FEFDE8",
  screen: "#F8F9FB",
  card: "#FFFFFF",
  gridline: "#EEEEEE",
  seriesBaseline: "#B4B5B7",
  seriesTransport: "#62C7EE",
  seriesHome: "#E8AB49",
};

// The file's one brand gradient, on fills and (via background-clip) on text.
const GRAD = `linear-gradient(150deg, ${app.blue600} 0%, ${app.info} 94%)`;
const GRAD_GREEN = "linear-gradient(178deg, rgb(0,201,23) 0%, rgb(47,245,87) 94%)";
const GRAD_SUN = "linear-gradient(132deg, rgb(237,130,28) 0%, rgb(242,169,44) 94%)";
const GRAD_LAKE = "linear-gradient(132deg, rgb(0,177,212) 0%, rgb(44,212,242) 94%)";

const gradText = {
  backgroundImage: GRAD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const CARD_SHADOW = "0 2px 7px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04)";

// Raleway text styles, named as they are in the file. Sizes are Figma px.
const type = (size, weight, lh, tracking) => ({
  fontSize: u(size),
  fontWeight: weight,
  lineHeight: `${u(lh)}px`,
  ...(tracking === undefined ? null : { letterSpacing: u(tracking) }),
});
const H3_BOLD = type(28, 700, 36);
const H3_BLACK = type(28, 900, 36);
const H5_BOLD = type(20, 700, 28);
const H6_BOLD = type(18, 700, 24);
const H7 = type(12, 600, 15, 1.117);
const BODY_M_BOLD = type(16, 700, 24);
const BODY_S = type(14, 400, 20);
const BODY_S_BOLD = type(14, 700, 20);
const BODY_XS = type(12, 400, 20);
const BODY_XS_MED = type(12, 500, 20);
const BODY_XS_BOLD = type(12, 700, 20);
const BODY_XXS = type(10, 400, 16);
const BODY_XXS_MED = type(10, 500, 16);
const BODY_XXS_BOLD = type(10, 700, 16);

const CARD = {
  background: app.card,
  borderRadius: u(24),
  padding: `${u(24)}px ${u(16)}px`,
  boxShadow: CARD_SHADOW,
};

/* ---------------------------------------------------------------- beats */

// Dwell per beat. The two form screens carry the most to read; the dashboard
// beats bookend the loop and hold longest.
const BEAT_MS = [3800, 2600, 3200, 2800, 4400];

const BEATS = [
  { label: "01 · Measure", line: "A month's footprint, set against a real baseline." },
  { label: "02 · Log", line: "Describe it in plain words — or log it again." },
  { label: "03 · Confirm", line: "The estimate is shown before anything is saved." },
  { label: "04 · Calculate", line: "Costed through Climatiq, never guessed." },
  { label: "05 · Attribute", line: "It rolls up into a project you can open." },
];

/* ---------------------------------------------------------------- atoms */

// Icons come from the file's exported assets (see persustainIcons.js): the
// source viewBox and per-path stroke width are kept, so an icon scales to
// any size without its weight drifting from the design.
function Icon({ name, size, color = "currentColor", style }) {
  const icon = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.vb}
      fill="none"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      {icon.paths.map((path, i) =>
        path.filled ? (
          <path key={i} d={path.d} fill={color} />
        ) : (
          <path
            key={i}
            d={path.d}
            stroke={color}
            strokeWidth={path.w}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  );
}

// The product mark: seven dots in one blue. Centres and radii are measured
// off the mark exported in the Figma file, as percentages of its box.
const LOGO_DOTS = [
  [29.48, 73.1, 15.67],
  [54.52, 52.71, 12.24],
  [47.67, 17.86, 9.95],
  [70.14, 30.81, 9.29],
  [79, 53.38, 7.1],
  [71.1, 76.19, 5.4],
  [54.52, 87.95, 4.05],
];

function Logo({ size = u(52) }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      {LOGO_DOTS.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={app.blue400} />
      ))}
    </svg>
  );
}

// Counts up on `run`, snaps back to zero on `reset`, and holds in between.
// The two are separate beats on purpose: a value that rewound the moment its
// own beat ended would do it in plain view.
function Counter({ to, decimals = 0, run, reset, startFilled = false, delay = 0.2, duration = 1.1 }) {
  const reduced = useReducedMotion();
  const value = useMotionValue(reduced || startFilled ? to : 0);
  const text = useTransform(value, (n) => n.toFixed(decimals));

  useEffect(() => {
    if (reduced) {
      value.set(to);
      return;
    }
    if (reset) {
      value.set(0);
      return;
    }
    if (!run) return;
    const controls = animate(value, to, { duration, delay, ease: easeBrand });
    return () => controls.stop();
  }, [reduced, run, reset, to, delay, duration, value]);

  return <motion.span>{text}</motion.span>;
}

// The chip that sits on every estimated number in the design.
function Estimated() {
  return (
    <span
      style={{
        ...H7,
        letterSpacing: u(0.797),
        border: `1px solid ${app.blue600}`,
        borderRadius: 9999,
        padding: `${u(4)}px ${u(8)}px`,
        whiteSpace: "nowrap",
        ...gradText,
      }}
    >
      ESTIMATED
    </span>
  );
}

// Section label above each group on the form screens.
function FieldLabel({ children }) {
  return (
    <p style={{ ...H7, margin: 0, color: app.tertiary, textTransform: "uppercase" }}>{children}</p>
  );
}

// A fingertip, on each control the loop actually presses.
function Tap({ style }) {
  const size = u(44);
  return (
    <motion.span
      aria-hidden="true"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1, 1.5], opacity: [0, 0.9, 0] }}
      transition={{ duration: 0.85, ease: "easeOut", times: [0, 0.35, 1] }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: 9999,
        background: "rgba(42,70,193,0.16)",
        border: `1.5px solid rgba(42,70,193,0.45)`,
        pointerEvents: "none",
        zIndex: 6,
        ...style,
      }}
    />
  );
}

// Every screen in the file opens with the same 124px white bar.
function ScreenHeader({ eyebrow, title, caret = false, right }) {
  return (
    <div
      style={{
        height: HEADER_H,
        padding: `${u(48)}px ${u(20)}px ${u(24)}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: app.card,
        filter: "drop-shadow(0 4px 2px rgba(57,57,59,0.02))",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: u(4) }}>
        <p style={{ ...BODY_S, margin: 0, color: app.tertiary }}>{eyebrow}</p>
        <div style={{ display: "flex", alignItems: "center", gap: u(10) }}>
          <p style={{ ...H5_BOLD, margin: 0, color: app.ink }}>{title}</p>
          {caret && <Icon name="caret" size={u(18)} color={app.tertiary} />}
        </div>
      </div>
      {right === undefined ? <Logo /> : right}
    </div>
  );
}

/* ----------------------------------------------------- dashboard: cards */

// Remounted at the top of each cycle (see `cycle` in Phone), so its numbers
// and bars simply play on mount. That instant is the one point in the loop
// where this card is guaranteed to be out of frame — the column is still
// scrolled to the impact card and about to scroll back up — so there is no
// visible rewind to hide.
function FootprintCard() {
  const reduced = useReducedMotion();
  const bars = [
    { label: "Actual", value: "182 kg", pct: (165.156 / 225) * 100, fill: GRAD, delay: 0.35 },
    { label: "Baseline", value: "210 kg", pct: (189.797 / 225) * 100, fill: GRAD_GREEN, delay: 0.5 },
  ];
  return (
    <div style={{ ...CARD, background: app.blue50, boxShadow: "none", display: "flex", flexDirection: "column", gap: u(12) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ ...H6_BOLD, margin: 0, color: app.ink }}>Current Period</p>
        <Estimated />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: u(13) }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: u(8) }}>
          <p
            style={{
              ...type(42, 800, 42, -1.311),
              margin: 0,
              color: app.ink,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <Counter to={182} run />
          </p>
          <p style={{ ...BODY_S, margin: 0, color: app.ink70 }}>kg CO₂</p>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92, y: u(6) }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.95, ease: easeBrand }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: u(6),
            alignSelf: "flex-start",
            height: u(32),
            padding: `0 ${u(13)}px`,
            borderRadius: 9999,
            backgroundImage: GRAD,
          }}
        >
          <Icon name="arrowDown" size={u(12)} color={app.blue50} />
          <p style={{ ...BODY_XS_BOLD, margin: 0, color: app.blue50 }}>13% below baseline</p>
        </motion.div>
      </div>

      <div style={{ height: 1, background: app.ink20 }} />

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: u(6) }}>
            <p style={{ ...BODY_XS, margin: 0, color: app.ink80 }}>Baseline estimate</p>
            <Icon name="info" size={u(12)} color={app.ink} />
          </div>
          <p style={{ ...type(13, 700, 19.5), margin: 0, color: app.ink }}>210 kg CO₂</p>
        </div>

        {bars.map((bar) => (
          <div
            key={bar.label}
            style={{ display: "flex", alignItems: "center", gap: u(8), marginTop: u(12) }}
          >
            <p
              style={{
                ...BODY_XXS,
                margin: 0,
                width: u(44),
                textAlign: "right",
                color: app.ink80,
                letterSpacing: u(0.117),
              }}
            >
              {bar.label}
            </p>
            <div
              style={{
                flex: 1,
                height: u(5),
                borderRadius: 9999,
                background: "rgba(255,255,255,0.4)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${bar.pct}%` }}
                transition={{ duration: 0.9, delay: bar.delay, ease: easeBrand }}
                style={{ height: "100%", borderRadius: 9999, backgroundImage: bar.fill }}
              />
            </div>
            <p
              style={{
                ...BODY_XXS_MED,
                margin: 0,
                width: u(38),
                color: app.ink80,
                letterSpacing: u(0.117),
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {bar.value}
            </p>
          </div>
        ))}
      </div>

      <p style={{ ...type(9.5, 400, 14.25, 0.144), margin: 0, color: app.ink80 }}>
        Methodology-based calculation
      </p>
    </div>
  );
}

// Dashboard > My Impact so far (1:15489).
function ImpactCard({ run, reset }) {
  // Settled on arrival — the loop's first beat shows a month that already
  // has contributions in it, and the count-up belongs to the last beat.
  const tiles = [
    {
      bg: app.lake50,
      width: u(135),
      value: "$ ...",
      lines: ["Value pending verification . USD"],
    },
    {
      bg: app.sun50,
      width: u(167),
      value: "12.5%",
      lines: ["Your Contribution Share", "of project total"],
    },
  ];
  return (
    <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: u(16) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ ...H6_BOLD, margin: 0, color: app.ink }}>My Impact so far</p>
        <Estimated />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: u(8), width: u(217) }}>
        <p style={{ ...BODY_XS, margin: 0, color: app.tertiary }}>
          Here is the impact across all projects
        </p>
        <p style={{ ...BODY_XS_BOLD, margin: 0, color: app.secondary }}>1 project joined</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: u(16) }}>
        {/* The illustration overflows its 90x75 box in the design; the box
            clips it, so both boxes are set rather than fitting the art. */}
        <div style={{ width: u(90), height: u(75), position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <img
            src={leafArt}
            alt=""
            style={{
              position: "absolute",
              left: "-11.11%",
              top: "-10.59%",
              width: "118.52%",
              height: "116.74%",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: u(8) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: u(4) }}>
            <p style={{ ...H3_BLACK, margin: 0, fontVariantNumeric: "tabular-nums", ...gradText }}>
              <Counter to={12} run={run} reset={reset} startFilled delay={0.35} duration={0.9} />
            </p>
            <p style={{ ...BODY_XS_MED, margin: 0, color: app.ink }}>Kg CO₂e logged</p>
          </div>
          <p style={{ ...BODY_XXS, margin: 0, width: u(214), color: app.tertiary }}>
            This is about 22 trees absorbing CO₂ for a day
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {tiles.map((tile) => (
          <div
            key={tile.value}
            style={{
              width: tile.width,
              height: u(87),
              background: tile.bg,
              borderRadius: u(16),
              padding: `${u(8)}px ${u(16)}px`,
              display: "flex",
              flexDirection: "column",
              gap: u(8),
              justifyContent: "center",
            }}
          >
            <p style={{ ...H6_BOLD, margin: 0, ...gradText }}>{tile.value}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: u(3) }}>
              {tile.lines.map((line) => (
                <p key={line} style={{ ...BODY_XXS, margin: 0, color: app.tertiary }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ ...BODY_S_BOLD, margin: 0, color: app.ink }}>See breakdown by project</p>

      <div style={{ display: "flex", flexDirection: "column", gap: u(8) }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p style={{ ...BODY_XXS, margin: 0, color: app.tertiary }}>Feb 1 – Feb 28</p>
          <p style={{ ...BODY_XXS_BOLD, margin: 0, color: app.success }}>+3 Kg this week</p>
        </div>
        <p
          style={{
            ...BODY_XS_BOLD,
            margin: 0,
            color: app.info700,
            textDecoration: "underline",
            textUnderlineOffset: u(2),
          }}
        >
          Community Micro-Greening and Carbon Sequestration Initiative.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: u(4) }}>
          <p style={{ ...BODY_XXS_MED, margin: 0, color: app.secondary }}>62%</p>
          <p style={{ ...BODY_XXS_MED, margin: 0, color: app.secondary }}>Aggregation in progress</p>
        </div>
      </div>
    </div>
  );
}

// Dashboard > Footprint Movement + AI Insight (1:15532). The chart is the
// file's own geometry: the grid, the four series and their label positions
// are the exported vectors, placed in the chart's 316x160 box.
const SERIES = [
  {
    key: "home",
    color: app.seriesHome,
    x: 37,
    y: 38.8,
    d: "M3 3C15.762 5.1 28.524 7.2 41.286 11.4C54.048 15.6 66.81 28.2 79.571 28.2C92.333 28.2 105.095 19.8 117.857 19.8C130.619 19.8 143.381 35.2 156.143 40.8C168.905 46.4 181.667 53.4 194.429 53.4C207.19 53.4 219.952 45 232.714 45C245.476 45 258.238 51.3 271 57.6",
  },
  {
    key: "transport",
    color: app.seriesTransport,
    x: 38,
    y: 43,
    d: "M1.00015 53C7.83348 41.6667 22.5001 22.5 44.5001 15C59.5001 10.5 87.5001 1 106 1C121.5 1 142.4 5.8 162 21C167.167 25.6667 180.8 34.9 194 34.5C208.833 33 239.8 29.1 245 25.5C251 22.6667 264.4 14.7 270 5.5",
  },
  {
    key: "actual",
    color: app.info,
    x: 38.3,
    y: 47.6,
    d: "M0.626759 29.3565C8.29343 35.5232 34.4268 44.9565 77.6268 33.3565C84.9601 29.8565 105.527 23.0565 129.127 23.8565C135.293 25.1898 154.427 24.0565 181.627 8.85649C189.293 5.18983 209.727 -1.34351 230.127 1.85649C238.46 5.35652 258.027 15.2566 269.627 26.8566",
  },
];

const WEEK_X = [40, 78.3, 116.6, 154.9, 193.1, 231.9, 269.7, 308.4];
const Y_TICKS = [
  [65, 3],
  [55, 31.5],
  [45, 61.5],
  [35, 91.5],
  [25, 121.5],
];

function MovementCard({ run }) {
  const reduced = useReducedMotion();
  const legend = [
    ["Actual", app.info],
    ["Baseline", app.seriesBaseline],
    ["Transport", app.seriesTransport],
    ["Home", app.seriesHome],
  ];
  return (
    <div
      style={{
        ...CARD,
        boxShadow: "none",
        filter: "drop-shadow(0 2px 3.5px rgba(0,0,0,0.05)) drop-shadow(0 4px 7px rgba(0,0,0,0.04))",
        display: "flex",
        flexDirection: "column",
        gap: u(8),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ ...H6_BOLD, margin: 0, color: app.ink }}>Footprint Movement</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: u(8),
            width: u(74),
            padding: `${u(2)}px ${u(8)}px`,
            border: `1px solid ${app.divider}`,
            borderRadius: u(4),
          }}
        >
          <p style={{ ...BODY_XS_MED, margin: 0, color: app.muted }}>Filter</p>
          <Icon name="caret" size={u(12)} color={app.muted} />
        </div>
      </div>

      <p style={{ ...BODY_XS, margin: 0, color: app.tertiary }}>8-week period · kg CO₂ per week</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {legend.map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: u(4) }}>
            <span
              style={{ width: u(24), height: u(3), borderRadius: u(4), background: color }}
            />
            <p style={{ ...BODY_XS, margin: 0, color: "#555" }}>{label}</p>
          </div>
        ))}
      </div>

      <svg
        width="100%"
        viewBox="0 0 316 160"
        fill="none"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <g transform="translate(40 7)">
          {[0.5, 29, 88.9, 118.5].map((y) => (
            <path
              key={y}
              d={`M0 ${y}H268`}
              stroke={app.gridline}
              strokeDasharray="4 4"
            />
          ))}
          <path d="M0 59.3H268" stroke={app.seriesBaseline} strokeWidth={2} />
        </g>

        {SERIES.map((series, i) => (
          <motion.path
            key={series.key}
            d={series.d}
            transform={`translate(${series.x} ${series.y})`}
            stroke={series.color}
            strokeWidth={2}
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: run || reduced ? 1 : 0 }}
            transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: "easeInOut" }}
          />
        ))}

        {Y_TICKS.map(([label, y]) => (
          <text
            key={label}
            x={32}
            y={y + 9}
            textAnchor="end"
            fontSize={12}
            fill={app.ink20}
            fontWeight={400}
          >
            {label}
          </text>
        ))}
        {WEEK_X.map((x, i) => (
          <text
            key={x}
            x={x}
            y={147}
            textAnchor="middle"
            fontSize={10}
            fill={app.ink30}
            fontWeight={400}
          >
            {`W${i + 1}`}
          </text>
        ))}
      </svg>

      <p style={{ ...type(10, 400, 15, 0.317), margin: 0, color: app.blue400 }}>
        Simulated · based on logged activities
      </p>

      <p style={{ ...BODY_S_BOLD, margin: 0, color: app.ink }}>AI Insight</p>

      <div style={{ display: "flex", alignItems: "flex-end", gap: u(9) }}>
        <div style={{ display: "flex", alignItems: "center", gap: u(8) }}>
          <Icon name="arrowDown" size={u(32)} color={app.blue600} />
          <p style={{ ...type(32, 900, 40), margin: 0, ...gradText }}>13%</p>
        </div>
        <p style={{ ...BODY_XS_BOLD, margin: 0, width: u(198), ...gradText }}>
          reduction compared to last month
        </p>
      </div>

      <p style={{ ...BODY_XS, margin: 0, color: app.tertiary }}>
        Your transport behaviour is currently your highest impact lever. Small changes here can
        have the biggest effect.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- tab bar */

function TabBar({ active = "Dashboard", tapping }) {
  const tabs = [
    { label: "Dashboard", icon: "tabDashboard" },
    { label: "Activities", icon: "tabActivities" },
    null,
    { label: "Projects", icon: "tabProjects" },
    { label: "Profile", icon: "tabProfile" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: NAV_H,
        background: app.card,
        borderTop: `1px solid ${app.navLine}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: u(16),
        zIndex: 3,
      }}
    >
      {tabs.map((tab) => {
        if (!tab) {
          return (
            <div key="fab" style={{ width: u(54), position: "relative" }}>
              <motion.div
                animate={{ scale: tapping ? [1, 0.86, 1] : 1 }}
                transition={{ duration: 0.5, ease: easeBrand }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: u(-22),
                  marginLeft: u(-26),
                  width: u(52),
                  height: u(52),
                  borderRadius: 9999,
                  backgroundImage: GRAD,
                  boxShadow: "0 4px 18px rgba(79,70,229,0.45), 0 1px 4px rgba(0,0,0,0.1)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon name="plus" size={u(22)} color={app.blue50} />
              </motion.div>
              {tapping && <Tap style={{ left: "50%", top: u(4) }} />}
            </div>
          );
        }
        const on = tab.label === active;
        return (
          <div
            key={tab.label}
            style={{
              width: u(54),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: u(8),
            }}
          >
            <span
              style={{
                width: u(40),
                height: u(3),
                borderRadius: 9999,
                background: app.blue400,
                opacity: on ? 1 : 0,
              }}
            />
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(4) }}
            >
              <Icon name={tab.icon} size={u(24)} color={on ? app.blue400 : app.tertiary} />
              <p
                style={{
                  ...BODY_XXS_MED,
                  margin: 0,
                  color: on ? app.blue400 : app.tertiary,
                  textAlign: "center",
                }}
              >
                {tab.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ overlays */

// Screen: add activity (1:15946). Pushed from the +, so it rises from it.
function AddActivityScreen() {
  // The row is pressed partway through the beat rather than on arrival: the
  // screen has to be readable before the tap that leaves it.
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setPressed(true), 1700);
    return () => clearTimeout(id);
  }, []);

  const recent = [
    { title: "Boiling an electric kettle", sub: "Yesterday . 3 boils", icon: "bolt", grad: GRAD_SUN },
    { title: "Hot shower", sub: "Yesterday . 12 minutes", icon: "bolt", grad: GRAD_SUN },
    { title: "Car journey, petrol", sub: "Monday . 8 km", icon: "car", grad: GRAD_LAKE },
  ];
  const categories = [
    { title: "Transport", sub: "Car, bus, train, bike, walking...", icon: "car", grad: GRAD_LAKE },
    { title: "Home Energy", sub: "Kettle, shower, heating, laundry...", icon: "bolt", grad: GRAD_SUN },
  ];

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 34, mass: 0.9 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        background: app.screen,
        display: "flex",
        flexDirection: "column",
        gap: u(24),
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%" }}>
        <ScreenHeader eyebrow="ADD ACTIVITIES" title="What did you do?" />
      </div>

      <div
        style={{
          width: u(353),
          display: "flex",
          alignItems: "center",
          gap: u(8),
          padding: `${u(12)}px ${u(16)}px ${u(12)}px ${u(12)}px`,
          background: app.card,
          border: `1px solid ${app.blue50}`,
          borderRadius: u(20),
          opacity: 0.8,
        }}
      >
        <Icon name="search" size={u(16)} color={app.tertiary} />
        <p style={{ ...BODY_S, margin: 0, color: app.tertiary }}>e.g. drove to work</p>
      </div>

      <div style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}>
        <FieldLabel>Log again</FieldLabel>
        {recent.map((row, i) => (
          <motion.div
            key={row.title}
            initial={{ opacity: 0, y: u(16) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 + i * 0.07, ease: easeBrand }}
          >
            <motion.div
              animate={{
                scale: pressed && i === 0 ? 0.98 : 1,
                borderColor: pressed && i === 0 ? app.blue600 : app.blue50,
              }}
              transition={{ duration: 0.25, ease: easeBrand }}
              style={{
                height: u(68),
                display: "flex",
                alignItems: "center",
                gap: u(16),
                padding: `${u(13)}px ${u(17)}px`,
                background: app.card,
                border: `1px solid ${app.blue50}`,
                borderRadius: u(16),
              }}
            >
              <div
                style={{
                  width: u(40),
                  height: u(40),
                  borderRadius: u(12),
                  backgroundImage: row.grad,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={row.icon} size={u(22)} color={app.card} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: u(2) }}>
                <p style={{ ...BODY_S_BOLD, margin: 0, color: app.ink }}>{row.title}</p>
                <p style={{ ...BODY_XS_MED, margin: 0, color: app.tertiary }}>{row.sub}</p>
              </div>
              <span
                style={{
                  width: u(24),
                  height: u(24),
                  borderRadius: 9999,
                  background: app.card,
                  border: `2px solid ${app.blue50}`,
                  flexShrink: 0,
                }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}>
        <FieldLabel>Browse categories</FieldLabel>
        {categories.map((row) => (
          <div
            key={row.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: u(16),
              padding: u(16),
              background: app.card,
              borderRadius: u(16),
              filter:
                "drop-shadow(0 2px 3.5px rgba(0,0,0,0.05)) drop-shadow(0 4px 7px rgba(0,0,0,0.04))",
            }}
          >
            <div
              style={{
                width: u(40),
                height: u(40),
                borderRadius: u(12),
                backgroundImage: row.grad,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={row.icon} size={u(22)} color={app.card} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: u(2) }}>
              <p style={{ ...type(14, 700, 24), margin: 0, color: app.ink }}>{row.title}</p>
              <p style={{ ...BODY_XS_MED, margin: 0, color: app.tertiary }}>{row.sub}</p>
            </div>
            <Icon name="chevron" size={u(18)} color="#888888" style={{ transform: "rotate(-90deg)" }} />
          </div>
        ))}
      </div>

      {pressed && <Tap style={{ left: u(57), top: u(305) }} />}
    </motion.div>
  );
}

// Screen: add activity- save (8:3768).
function SaveScreen() {
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSaving(true), 2400);
    return () => clearTimeout(id);
  }, []);

  const counts = [
    { label: "1 boils", w: 68 },
    { label: "2 boils", w: 69 },
    { label: "3 boils", w: 71, on: true },
    { label: "Not sure", w: 81 },
  ];
  const when = [
    { label: "Today", w: 69, on: true },
    { label: "Yesterday", w: 91 },
    { label: "Calendar", w: 125, icon: "calendar" },
  ];
  // The file gives each chip a fixed width with its label overflowing the
  // padding box slightly; a minimum width plus the design's own padding
  // lands within a pixel of that and keeps every label on one line.
  const chip = (item) => ({
    minWidth: u(item.w),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: u(8),
    padding: u(item.on ? 17 : 16),
    background: app.card,
    borderRadius: u(16),
    border: item.on ? `1px solid ${app.blue600}` : "none",
    filter: "drop-shadow(0 2px 3.5px rgba(0,0,0,0.05)) drop-shadow(0 4px 7px rgba(0,0,0,0.04))",
  });

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-30%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 32, mass: 0.9 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        background: app.screen,
        display: "flex",
        flexDirection: "column",
        gap: u(24),
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          background: app.card,
          padding: `${u(48)}px ${u(20)}px ${u(24)}px`,
          display: "flex",
          flexDirection: "column",
          gap: u(16),
          filter: "drop-shadow(0 4px 2px rgba(57,57,59,0.02))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Icon name="chevron" size={u(16)} color={app.ink} style={{ transform: "rotate(90deg)" }} />
          <Logo />
        </div>
        <p style={{ ...type(24, 700, 32), margin: 0, color: app.ink }}>Boiling an electric kettle</p>
        <div
          style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            gap: u(4),
            height: u(20.5),
            padding: `0 ${u(9)}px`,
            border: `1px solid ${app.orange}`,
            borderRadius: u(20),
          }}
        >
          <Icon name="bolt" size={u(11)} color={app.orange} />
          <p style={{ ...type(10, 600, 16.5, 0.065), margin: 0, color: app.orange }}>Home energy</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: u(4), height: u(14) }}>
          <Icon name="sparkles" size={u(14)} color="#4555D8" />
          <p style={{ ...BODY_XS_MED, margin: 0, ...gradText }}>
            Matched from “boiled the kettle twice”
          </p>
        </div>
      </div>

      <div style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}>
        <FieldLabel>How many times</FieldLabel>
        <div style={{ display: "flex", gap: u(16) }}>
          {counts.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: u(10) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.14 + i * 0.05, ease: easeBrand }}
              style={chip(item)}
            >
              <p
                style={{
                  ...BODY_XS_BOLD,
                  margin: 0,
                  whiteSpace: "nowrap",
                  ...(item.on ? gradText : { color: app.ink }),
                }}
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: app.card,
            borderRadius: u(16),
            boxShadow: CARD_SHADOW,
            overflow: "hidden",
          }}
        >
          <p style={{ ...BODY_S, margin: 0, flex: 1, padding: u(16), color: app.tertiary }}>
            or add the number of times manually
          </p>
          <p
            style={{
              ...BODY_S_BOLD,
              margin: 0,
              padding: `0 ${u(16)}px`,
              borderLeft: `1px solid ${app.blue50}`,
              color: app.tertiary,
            }}
          >
            boils
          </p>
        </div>
      </div>

      <div style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}>
        <FieldLabel>When</FieldLabel>
        <div style={{ display: "flex", gap: u(16) }}>
          {when.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: u(10) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.24 + i * 0.05, ease: easeBrand }}
              style={chip(item)}
            >
              {item.icon && <Icon name={item.icon} size={u(22)} color={app.ink} />}
              <p
                style={{
                  ...BODY_XS_BOLD,
                  margin: 0,
                  whiteSpace: "nowrap",
                  ...(item.on ? gradText : { color: app.ink }),
                }}
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div
        style={{
          width: u(353),
          background: app.card,
          borderRadius: u(24),
          padding: `${u(24)}px ${u(20)}px`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          gap: u(24),
        }}
      >
        <div style={{ display: "flex", gap: u(16) }}>
          <span
            style={{
              width: u(4),
              borderRadius: 9999,
              backgroundImage: `linear-gradient(180deg, ${app.blue700}, ${app.info})`,
            }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: u(16) }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ ...BODY_S_BOLD, margin: 0, color: app.ink }}>Calculated Footprint</p>
              <Estimated />
            </div>
            <p style={{ margin: 0, display: "flex", alignItems: "baseline", gap: u(4) }}>
              <span style={{ ...type(20, 800, 20), color: app.ink, fontVariantNumeric: "tabular-nums" }}>
                <Counter to={0.09} decimals={2} run delay={0.25} duration={0.7} />
              </span>
              <span style={{ ...BODY_XS, color: app.tertiary }}>kg CO₂e</span>
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: u(16) }}>
          <span style={{ height: 1, background: app.blue50 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: u(4) }}>
            <Icon name="helpCircle" size={u(14)} color={app.blue400} />
            <p style={{ ...BODY_XS_MED, margin: 0, ...gradText }}>How this number is calculated?</p>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ scale: saving ? 0.97 : 1 }}
        transition={{ duration: 0.25, ease: easeBrand }}
        style={{
          position: "absolute",
          left: "50%",
          marginLeft: u(-176.5),
          top: u(755),
          width: u(353),
          height: u(49),
          borderRadius: u(16),
          backgroundImage: GRAD,
          display: "grid",
          placeItems: "center",
        }}
      >
        <p style={{ ...BODY_M_BOLD, margin: 0, color: "#fff" }}>Save</p>
      </motion.div>
      {saving && <Tap style={{ left: "50%", bottom: u(18), top: "auto" }} />}
    </motion.div>
  );
}

// Screen: add activity complete (12:893).
function CompleteScreen() {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 32, mass: 0.9 }}
      style={{ position: "absolute", inset: 0, zIndex: 5, background: app.screen }}
    >
      <motion.div
        initial={{ opacity: 0, y: u(14) }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.36, ease: easeBrand }}
        style={{
          position: "absolute",
          left: u(91),
          top: u(197),
          width: u(211),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: u(16),
        }}
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.26 }}
          style={{
            width: u(80),
            height: u(80),
            borderRadius: 9999,
            backgroundImage: GRAD,
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width={u(34)} height={u(34)} viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <motion.path
              d="M28.3333 8.5L12.75 24.0833L5.66667 17"
              stroke="white"
              strokeWidth={3.54167}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
        <p style={{ ...H3_BOLD, margin: 0, color: app.ink, textAlign: "center" }}>Activity Logged</p>
        <p style={{ ...BODY_S, margin: 0, color: app.tertiary, textAlign: "center" }}>
          Your activity has been recorded.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: u(18) }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.46, ease: easeBrand }}
        style={{
          position: "absolute",
          left: "50%",
          marginLeft: u(-176.5),
          top: u(404),
          width: u(353),
          background: app.card,
          borderRadius: u(24),
          padding: `${u(24)}px ${u(16)}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: u(16),
          filter:
            "drop-shadow(0 2px 3.5px rgba(0,0,0,0.05)) drop-shadow(0 4px 7px rgba(0,0,0,0.04))",
        }}
      >
        <Estimated />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(24) }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(4) }}>
            <p style={{ margin: 0, textAlign: "center" }}>
              <span style={{ ...type(24, 700, 24), color: app.ink }}>0.09</span>
              <span style={{ ...type(16, 700, 24), color: app.ink }}> · </span>
              <span style={{ ...type(16, 400, 24), color: app.tertiary }}>kg CO₂e</span>
            </p>
            <p style={{ ...BODY_S, margin: 0, color: app.tertiary, textAlign: "center" }}>
              3 boils · Boiling an electric kettle · Today
            </p>
          </div>
          <p style={{ ...BODY_S, margin: 0, color: app.ink, textAlign: "center" }}>
            Calculated by Climatiq
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        style={{
          ...BODY_S_BOLD,
          position: "absolute",
          left: 0,
          right: 0,
          top: u(606),
          margin: 0,
          color: app.blue500,
          textAlign: "center",
        }}
      >
        View impact details
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: u(14) }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.54, ease: easeBrand }}
        style={{
          position: "absolute",
          left: "50%",
          marginLeft: u(-176.5),
          top: u(755),
          width: u(353),
          height: u(49),
          borderRadius: u(16),
          backgroundImage: GRAD,
          display: "grid",
          placeItems: "center",
        }}
      >
        <p style={{ ...BODY_M_BOLD, margin: 0, color: "#fff" }}>Done</p>
      </motion.div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- phone */

function Phone({ beat }) {
  const columnRef = useRef(null);
  const impactRef = useRef(null);
  const [scrollTo, setScrollTo] = useState(0);

  const atImpact = beat === 4;

  // Bumped every time the loop comes back round to the dashboard, purely to
  // remount FootprintCard and replay it from zero. That instant is the one
  // point in the loop where the card is guaranteed to be out of frame.
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (beat === 0) setCycle((c) => c + 1);
  }, [beat]);

  // Measured rather than hardcoded, so editing any card's copy can't quietly
  // leave the impact card cut off on the last beat. Re-measured per beat so
  // a late font load can't leave the target stale.
  useLayoutEffect(() => {
    const column = columnRef.current;
    const impact = impactRef.current;
    if (!column || !impact) return;
    const measure = () => {
      const max = Math.max(0, column.scrollHeight - BODY_H);
      setScrollTo(Math.min(max, Math.max(0, impact.offsetTop - u(24))));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(column);
    return () => observer.disconnect();
  }, [beat]);

  return (
    <div
      style={{
        position: "relative",
        width: PHONE_W,
        height: PHONE_H,
        padding: BEZEL,
        borderRadius: 36,
        background: "#101114",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,.14), 0 26px 60px rgba(8,4,22,.55), 0 6px 18px rgba(8,4,22,.4)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 29,
          overflow: "hidden",
          background: app.screen,
          fontFamily: "'Raleway', var(--font-sans)",
          color: app.ink,
        }}
      >
        <ScreenHeader eyebrow="MY FOOTPRINT" title="February 2026" caret />

        {/* One continuous column, scrolled — not a set of swapped screens. */}
        <div
          style={{
            position: "absolute",
            top: HEADER_H,
            left: 0,
            right: 0,
            height: BODY_H,
            overflow: "hidden",
          }}
        >
          <motion.div
            ref={columnRef}
            initial={false}
            animate={{ y: atImpact ? -scrollTo : 0 }}
            transition={{ duration: 1, ease: easeBrand }}
            style={{
              // Bottom inset is the tab bar's own height, as in the design —
              // and it guarantees enough scroll range to put the footprint
              // card fully out of frame on the last beat.
              padding: `${u(24)}px ${u(20)}px ${u(97)}px`,
              display: "flex",
              flexDirection: "column",
              gap: u(24),
            }}
          >
            <FootprintCard key={cycle} />
            {/* The impact card can't take the same treatment: its top half is
                on screen for most of the loop, so it rewinds on beat 2,
                behind the save screen, and counts up on beat 4 as the column
                scrolls it into full view. */}
            <div ref={impactRef}>
              <ImpactCard run={atImpact} reset={beat === 2} />
            </div>
            <MovementCard run={atImpact} />
          </motion.div>
        </div>

        <TabBar tapping={beat === 1} />

        <AnimatePresence>{beat === 1 && <AddActivityScreen key="add" />}</AnimatePresence>
        <AnimatePresence>{beat === 2 && <SaveScreen key="save" />}</AnimatePresence>
        <AnimatePresence>{beat === 3 && <CompleteScreen key="done" />}</AnimatePresence>

        {/* Dynamic island, over every screen. */}
        <div
          style={{
            position: "absolute",
            top: u(12),
            left: "50%",
            marginLeft: u(-39),
            width: u(78),
            height: u(16),
            borderRadius: 9999,
            background: "#101114",
            zIndex: 7,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- component */

export default function PersustainPreview({ variant = "featured" }) {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  // Nothing animates until the card is actually on screen: this sits well
  // below the fold, and a loop running the whole time someone reads the hero
  // is work for no one.
  const inView = useInView(rootRef, { amount: 0.4 });
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setTimeout(() => setBeat((b) => (b + 1) % BEATS.length), BEAT_MS[beat]);
    return () => clearTimeout(id);
  }, [beat, inView, reduced]);

  // The mock is drawn once at its intrinsic size and scaled to whatever the
  // card gives it, so type and spacing keep their proportions rather than
  // reflowing into a different, worse layout at each breakpoint. Measured
  // instead of expressed in CSS because container query units are lengths —
  // there is no way to divide one into the unitless number scale() needs.
  // The compact card's tag pills sit in its top-right corner, hence the
  // larger inset there: the phone is centred in the space below them.
  const { pad, cap } = variant === "compact" ? { pad: 76, cap: 0.86 } : { pad: 80, cap: 0.9 };
  const [scale, setScale] = useState(cap);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () =>
      setScale(Math.max(0.28, Math.min(cap, (el.clientHeight - pad) / PHONE_H)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pad, cap]);

  const stage = (
    <div className="pp-box" style={{ "--pp-s": scale, "--pp-w": `${PHONE_W}px`, "--pp-h": `${PHONE_H}px` }}>
      <div className="pp-stage">
        <Phone beat={beat} />
      </div>
    </div>
  );

  if (variant === "compact") {
    return (
      <div
        ref={rootRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] grid place-items-center pt-[52px] pb-3"
      >
        {stage}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center gap-16 px-10"
    >
      <div className="w-[330px] shrink-0">
        <h4
          className="font-georgia text-[28px] font-bold leading-tight"
          style={{ color: "#FFFDF7" }}
        >
          The loop, running.
        </h4>

        {/* Fixed height: the lines differ in length, and the block sits above
            the progress dots, which must not shuffle on every beat. */}
        <div className="relative mt-6 h-[76px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={beat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: easeBrand }}
            >
              <p
                className="type-label font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#FFE4A8" }}
              >
                {BEATS[beat].label}
              </p>
              <p className="mt-2 text-[17px] leading-relaxed" style={{ color: "#FFF7E8" }}>
                {BEATS[beat].line}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-2 flex gap-2">
          {BEATS.map((b, i) => (
            <motion.span
              key={b.label}
              initial={false}
              animate={{ width: i === beat ? 26 : 10, opacity: i === beat ? 1 : 0.4 }}
              transition={{ duration: 0.4, ease: easeBrand }}
              className="h-[3px] rounded-full"
              style={{ background: "#FFE4A8" }}
            />
          ))}
        </div>
      </div>

      {stage}
    </div>
  );
}
