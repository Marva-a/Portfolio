import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { easeBrand } from "../../styles/tokens";
import { ACTIVITY, app, gradText, GRAD, IMPACT, LIFECYCLE, LOGO_DOTS } from "./tokens";
import leafArt from "../../assets/persustain-leaf.webp";

/**
 * The product itself, at the centre of the composition.
 *
 * Every measurement below is a Figma pixel run through u() — the same
 * technique the pixel-matched replica in design-archive/ used, just at a
 * smaller SCREEN_W. u(n) = n * (SCREEN_W / 393), where 393 is the frame's own
 * design width, so every gap, padding and radius stays in the exact
 * proportion the file specifies instead of being eyeballed at this size.
 * That includes the canvas itself: SCREEN_H is 393:852 (the frame's real
 * aspect ratio), so a screen with empty space beneath its content in Figma —
 * both of these do — keeps that same empty space here, at the same fraction
 * of the screen, rather than being cropped to fit.
 *
 *   measure — two frames in sequence, matching the file's own flow: add
 *             activity (1:15946), "What did you do?" with the search field
 *             and the Log Again list, the kettle row picked — then add
 *             activity- save (8:3768), absolute-positioned exactly as the
 *             frame lays it out: header in flow, Save pinned near the
 *             bottom of the canvas with the gap that implies
 *   logged  — add activity complete (12:893), same treatment: the
 *             confirmation block, the link and Done all sit at the frame's
 *             own absolute y-coordinates
 *   trust   — the product's own six-step lifecycle (not a single Figma
 *             frame — see tokens.js), styled with the same card radius,
 *             shadow and 16/24px rhythm the real screens use, so it doesn't
 *             read as a different design system dropped into the phone
 *   impact  — Dashboard > My Impact so far (1:15489), in full
 *
 * The frame around all four is the same soft, chrome-free device treatment
 * the case study uses for its own interactive prototype.
 */

// The frame's own design width — every u() value below is this many Figma
// pixels, scaled down. 852 (the frame's height) only shows up once, in the
// PHONE_H comment below, since nothing else needs it as a number.
const FIG_W = 393;

export const PHONE_W = 186;
// The frame's own 393:852 aspect ratio at PHONE_W, rounded to a whole pixel —
// a literal rather than a computed export so this file exports only
// components and plain constants (oxlint's react/only-export-components
// otherwise treats a computed export as a possible non-component and warns).
export const PHONE_H = 403;
const U = PHONE_W / FIG_W;
const u = (n) => +(n * U).toFixed(3);

const type = (size, weight, lh, tracking) => ({
  fontSize: u(size),
  fontWeight: weight,
  lineHeight: `${u(lh)}px`,
  ...(tracking === undefined ? null : { letterSpacing: u(tracking) }),
});
const H3_BOLD = type(28, 700, 36);
const H3_BLACK = type(28, 900, 36);
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

const CARD_SHADOW = "0 2px 7px rgba(26,27,28,0.05), 0 4px 14px rgba(26,27,28,0.04)";
// The file uses a visibly lighter shadow ("shadow-xsmall") on chips and
// small buttons than the one big cards get ("Cards shadow", CARD_SHADOW
// above) — two distinct tokens, not one shadow reused at two sizes.
const CHIP_SHADOW = "0 4px 7px rgba(26,27,28,0.04), 0 2px 3.5px rgba(26,27,28,0.05)";
const CARD = {
  background: app.card,
  borderRadius: u(24),
  padding: `${u(24)}px ${u(16)}px`,
  boxShadow: CARD_SHADOW,
};

function Logo({ size = u(52) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      {LOGO_DOTS.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={app.blue400} />
      ))}
    </svg>
  );
}

function ChevronLeft({ size = u(16), color = app.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon({ size = u(11), color = app.orange }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M12.8333 1.83333L3.66667 12.8333H11L9.16667 20.1667L18.3333 9.16667H11L12.8333 1.83333Z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ size = u(22), color = app.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke={color} strokeWidth={1.6} />
      <path d="M3.5 9.5h17M8 3.5v4M16 3.5v4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ size = u(16), color = app.tertiary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.7 11.7l3 3M13.3 7.3a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CarIcon({ size = u(22), color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M4.6 15.6h13c.5 0 .9-.4.9-.9v-2.7c0-.8-.5-1.5-1.3-1.7l-2.1-.5-1.6-2.6a1.8 1.8 0 0 0-1.6-.9H6.5c-.5 0-.9.4-.9.9v7.5c0 .5.4.9.9.9Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx="7.3" cy="15.9" r="1.7" fill={color} />
      <circle cx="15" cy="15.9" r="1.7" fill={color} />
    </svg>
  );
}

// A fingertip on the row the catalog beat "picks" — the one moment the
// measure beat shows a tap rather than just settled content.
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
        border: "1.5px solid rgba(42,70,193,0.45)",
        pointerEvents: "none",
        zIndex: 2,
        ...style,
      }}
    />
  );
}

function SparklesIcon({ size = u(14), color = "#4555D8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1v3M7 10v3M1 7h3M10 7h3M3.2 3.2l1.6 1.6M9.2 9.2l1.6 1.6M10.8 3.2l-1.6 1.6M4.8 9.2l-1.6 1.6"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  );
}

function HelpCircleIcon({ size = u(14), color = app.blue400 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.7} />
      <path d="M9.3 9.3a2.7 2.7 0 1 1 3.8 2.5c-.7.3-1.1.9-1.1 1.6v.3" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="1" fill={color} />
    </svg>
  );
}

// Section label above each group on the form and card views.
function FieldLabel({ children }) {
  return <p style={{ ...H7, margin: 0, color: app.tertiary, textTransform: "uppercase" }}>{children}</p>;
}

// Persustain's own estimate chip — the smallest piece of its trust language.
function Estimated() {
  return (
    <span
      style={{
        ...gradText,
        ...H7,
        letterSpacing: u(0.797),
        border: `1px solid ${app.blue600}`,
        borderRadius: 9999,
        padding: `${u(4)}px ${u(8)}px`,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      ESTIMATED
    </span>
  );
}

function Counter({ to, decimals = 0, delay = 0, duration = 0.8 }) {
  const reduced = useReducedMotion();
  const value = useMotionValue(reduced ? to : 0);
  const text = useTransform(value, (n) => n.toFixed(decimals));

  useEffect(() => {
    if (reduced) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration, delay, ease: easeBrand });
    return () => controls.stop();
  }, [reduced, to, delay, duration, value]);

  return <motion.span>{text}</motion.span>;
}

/* --------------------------------------------------- 01 measure, 02 logged */

const COUNTS = [
  { label: "1 boils", w: 68 },
  { label: "2 boils", w: 69 },
  { label: "3 boils", w: 71 },
  { label: "Not sure", w: 81 },
];
const WHEN = [
  { label: "Today", w: 69 },
  { label: "Yesterday", w: 91 },
  { label: "Calendar", w: 125, icon: true },
];

// The file gives each chip a fixed width with its label overflowing the
// padding box slightly; a minimum width plus the design's own padding lands
// within a pixel of that and keeps every label on one line. `selected` is
// the live, animated state — which chip is picked — rather than a fact
// baked into the data, since this beat now shows the picking happen.
function chipStyle(item, selected) {
  return {
    position: "relative",
    minWidth: u(item.w),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: u(8),
    padding: u(selected ? 17 : 16),
    background: app.card,
    borderRadius: u(16),
    border: selected ? `1px solid ${app.blue600}` : "none",
    boxShadow: CHIP_SHADOW,
    whiteSpace: "nowrap",
  };
}

function ChevronRight({ size = u(18), color = "#888888" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5l7 7-7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A gradient tile shared by every catalog/search row and category button —
// the two gradients the file actually uses (harvest-sun for bolt, morning-
// lake for car), at the one size (40x40, icon 22x22) every instance shares.
function IconTile({ icon }) {
  return (
    <div
      style={{
        width: u(40),
        height: u(40),
        borderRadius: u(12),
        backgroundImage:
          icon === "bolt"
            ? "linear-gradient(132deg, rgb(237,130,28), rgb(242,169,44))"
            : "linear-gradient(132deg, rgb(0,177,212), rgb(44,212,242))",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {icon === "bolt" ? <BoltIcon size={u(22)} color="#fff" /> : <CarIcon size={u(22)} />}
    </div>
  );
}

// The header both the catalog and the search-result screen share — same
// eyebrow, same title, same logo, mid-interaction.
function CatalogHeader() {
  return (
    <div
      style={{
        width: "100%",
        background: app.card,
        padding: `${u(48)}px ${u(20)}px ${u(24)}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        {/* The file's own eyebrow text, typo included ("ACTIVTIES") — kept
            verbatim rather than silently corrected, since the ask here is
            exact fidelity to the frame. */}
        <p style={{ ...BODY_S, margin: 0, color: app.tertiary }}>ADD ACTIVTIES</p>
        <p style={{ ...type(20, 700, 28), margin: `${u(4)}px 0 0`, color: app.ink }}>
          What did you do?
        </p>
      </div>
      <Logo />
    </div>
  );
}

// add activity (1:15946), "What did you do?" — the unfocused search field,
// the Log Again list, and Browse Categories underneath it.
const RECENT = [
  { title: "Boiling an electric kettle", sub: "Yesterday · 3 boils", icon: "bolt" },
  { title: "Hot shower", sub: "Yesterday · 12 minutes", icon: "bolt" },
  { title: "Car journey, petrol", sub: "Monday · 8 km", icon: "car" },
];

const CATEGORIES = [
  { title: "Transport", sub: "Car, bus, train, bike, walking...", icon: "car" },
  { title: "Home Energy", sub: "Kettle, shower, heating, laundry...", icon: "bolt" },
];

// Everything below the header for the base catalog screen (1:15946). Split
// out from the header so MeasureView can keep CatalogHeader mounted, static,
// across the catalog→search transition — those two frames share one real
// header in the file, so it shouldn't refade just because the list beneath
// it changes.
// The search field itself, mounted once for both the catalog and search
// phases and never remounted between them — only its props change. Real
// typing has to land in a box that was already there before the first
// character appeared, or it reads as two different fields swapped mid-cut
// rather than one field being typed into.
function CatalogSearchBar({ focused, typed, typingDone, reduced }) {
  return (
    <motion.div
      // Every border-related value lives in `animate`, none in the static
      // style, so framer-motion's own updates are the single source of
      // truth for it — a border set both places fights itself over which
      // one the browser actually keeps.
      animate={{
        opacity: focused ? 1 : 0.8,
        borderColor: focused ? app.blue400 : app.blue50,
        borderWidth: focused ? u(1.5) : u(1),
      }}
      transition={{ duration: 0.35, ease: easeBrand }}
      style={{
        width: u(353),
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: u(8),
        padding: `${u(12)}px ${u(16)}px ${u(12)}px ${u(12)}px`,
        background: app.card,
        borderStyle: "solid",
        borderRadius: u(20),
      }}
    >
      <SearchIcon color={focused ? app.ink : app.tertiary} />
      <p
        style={{
          ...BODY_S,
          margin: 0,
          flex: 1,
          display: "flex",
          alignItems: "center",
          color: focused ? app.ink : app.tertiary,
        }}
      >
        {focused ? typed : "e.g. drove to work"}
        {focused && !reduced && !typingDone && (
          <motion.span
            aria-hidden="true"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
            style={{ display: "inline-block", width: 1, height: u(15), marginLeft: 1, background: app.ink }}
          />
        )}
      </p>
      {focused && typed.length > 0 && (
        <p style={{ ...BODY_S, margin: 0, color: app.ink, whiteSpace: "nowrap" }}>Clear</p>
      )}
    </motion.div>
  );
}

// add activity (1:15946) — everything below the shared search bar: the Log
// Again list and Browse Categories.
function CatalogRows() {
  return (
    <motion.div
      key="catalog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: "flex", flexDirection: "column", gap: u(24), alignItems: "center", width: "100%" }}
    >
      <div style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}>
        <FieldLabel>Log again</FieldLabel>
        {RECENT.map((row, i) => (
          <motion.div
            key={row.title}
            initial={{ opacity: 0, y: u(16) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 + i * 0.06, ease: easeBrand }}
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
            <IconTile icon={row.icon} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: u(2), minWidth: 0 }}>
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
        ))}
      </div>

      <div style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}>
        <FieldLabel>Browse categories</FieldLabel>
        {CATEGORIES.map((row, i) => (
          <motion.div
            key={row.title}
            initial={{ opacity: 0, y: u(16) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.06, ease: easeBrand }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: u(16),
              padding: u(16),
              background: app.card,
              borderRadius: u(16),
              boxShadow: CHIP_SHADOW,
            }}
          >
            <IconTile icon={row.icon} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: u(2), minWidth: 0 }}>
              <p style={{ ...type(14, 700, 24), margin: 0, color: app.ink }}>{row.title}</p>
              <p style={{ ...BODY_XS_MED, margin: 0, color: app.tertiary }}>{row.sub}</p>
            </div>
            <ChevronRight />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// add activity-search result (5:1563) — the search field focused, "boiled
// kettle" typed, and the one AI-suggested match it turns up. The typing
// itself lives in the persistent CatalogSearchBar above (MeasureView owns
// the shared timing); this is just what the typing reveals.
const QUERY = "boiled kettle";
const TYPE_MS = 68;
const REVEAL_DELAY = 260;
const PICK_DELAY = 950;
const SETTLE_MS = 550;

function SearchMatch({ revealed, picked, reduced }) {
  return (
    <motion.div
      key="search"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}
    >
      <AnimatePresence>
        {revealed && (
          <motion.div
            key="result"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: u(16) }}
          >
            <FieldLabel>Suggested match</FieldLabel>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: u(16) }}
              animate={{ opacity: 1, y: 0, scale: picked ? 0.98 : 1 }}
              transition={
                picked
                  ? { duration: 0.25, ease: easeBrand }
                  : { duration: 0.4, ease: easeBrand }
              }
              style={{
                position: "relative",
                height: u(68),
                display: "flex",
                alignItems: "center",
                gap: u(16),
                padding: `${u(13)}px ${u(17)}px`,
                background: app.card,
                border: `1px solid ${picked ? app.blue600 : app.blue50}`,
                borderRadius: u(16),
              }}
            >
              <IconTile icon="bolt" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: u(2), minWidth: 0 }}>
                <p style={{ ...BODY_S_BOLD, margin: 0, color: app.ink }}>Boiling an electric kettle</p>
                <p style={{ ...BODY_XS_MED, margin: 0, color: app.tertiary }}>Home energy</p>
              </div>
              <span
                style={{
                  width: u(24),
                  height: u(24),
                  borderRadius: 9999,
                  background: picked ? app.blue600 : app.card,
                  border: `2px solid ${picked ? app.blue600 : app.blue50}`,
                  flexShrink: 0,
                }}
              />
              {picked && <Tap style={{ left: u(345), top: u(34) }} />}
            </motion.div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: u(4) }}>
              <HelpCircleIcon />
              <p style={{ ...BODY_XS_MED, margin: 0, ...gradText }}>
                AI matched your words to a catalogue activity.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
// add activity- save (8:3768), positioned exactly as the frame lays it out.
function DetailBody() {
  const reduced = useReducedMotion();
  // The two picks and the save each land at their own moment rather than
  // arriving already made — the same "reveal, then choose" language the
  // catalog and search beats use, carried into this one.
  const [timesPicked, setTimesPicked] = useState(reduced);
  const [whenPicked, setWhenPicked] = useState(reduced);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const timesTimer = setTimeout(() => setTimesPicked(true), 950);
    const whenTimer = setTimeout(() => setWhenPicked(true), 1650);
    const pressTimer = setTimeout(() => setSaving(true), 2500);
    const releaseTimer = setTimeout(() => setSaving(false), 2760);
    return () => {
      clearTimeout(timesTimer);
      clearTimeout(whenTimer);
      clearTimeout(pressTimer);
      clearTimeout(releaseTimer);
    };
  }, [reduced]);

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: u(24), alignItems: "center" }}
    >
      <div
        style={{
          width: "100%",
          background: app.card,
          padding: `${u(48)}px ${u(20)}px ${u(24)}px`,
          display: "flex",
          flexDirection: "column",
          gap: u(16),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <ChevronLeft />
          <Logo />
        </div>
        <p style={{ ...type(24, 700, 32), margin: 0, color: app.ink }}>{ACTIVITY.title}</p>
        <div
          style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            gap: u(4),
            height: u(20.5),
            padding: `${u(5)}px ${u(9)}px`,
            border: `1px solid ${app.orange}`,
            borderRadius: u(20),
          }}
        >
          <BoltIcon />
          <p style={{ ...type(10, 600, 16.5, 0.065), margin: 0, color: app.orange }}>{ACTIVITY.category}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: u(4) }}>
          <SparklesIcon />
          <p style={{ ...BODY_XS_MED, margin: 0, ...gradText }}>{ACTIVITY.matched}</p>
        </div>
      </div>

      <div style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}>
        <FieldLabel>How many times</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: u(16) }}>
          {COUNTS.map((item) => {
            const selected = item.label === "3 boils" && timesPicked;
            return (
              <motion.div
                key={item.label}
                animate={{ scale: selected ? [1, 0.94, 1] : 1 }}
                transition={{ duration: 0.32, ease: easeBrand }}
                style={chipStyle(item, selected)}
              >
                <p style={{ ...BODY_XS_BOLD, margin: 0, ...(selected ? gradText : { color: app.ink }) }}>
                  {item.label}
                </p>
                {selected && <Tap style={{ left: "50%", top: "50%" }} />}
              </motion.div>
            );
          })}
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
          {WHEN.map((item) => {
            const selected = item.label === "Today" && whenPicked;
            return (
              <motion.div
                key={item.label}
                animate={{ scale: selected ? [1, 0.94, 1] : 1 }}
                transition={{ duration: 0.32, ease: easeBrand }}
                style={chipStyle(item, selected)}
              >
                {item.icon && <CalendarIcon />}
                <p style={{ ...BODY_XS_BOLD, margin: 0, ...(selected ? gradText : { color: app.ink }) }}>
                  {item.label}
                </p>
                {selected && <Tap style={{ left: "50%", top: "50%" }} />}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Calculated Footprint (12:865). */}
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
              alignSelf: "stretch",
            }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: u(16) }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ ...BODY_S_BOLD, margin: 0, color: app.ink, whiteSpace: "nowrap" }}>
                Calculated Footprint
              </p>
              <Estimated />
            </div>
            <p style={{ margin: 0, display: "flex", alignItems: "baseline", gap: u(4) }}>
              <span style={{ ...type(20, 800, 20), color: app.ink, fontVariantNumeric: "tabular-nums" }}>
                {/* Waits for both picks to land — the number is a
                    consequence of choosing 3 boils and Today, not something
                    that was already true before either was picked. */}
                <Counter to={ACTIVITY.amount} decimals={2} delay={reduced ? 0.25 : 1.9} duration={0.6} />
              </span>
              <span style={{ ...BODY_XS, color: app.tertiary }}>{ACTIVITY.unit}</span>
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: u(16) }}>
          <span style={{ height: 1, background: app.blue50 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: u(4) }}>
            <HelpCircleIcon />
            <p style={{ ...BODY_XS_MED, margin: 0, ...gradText }}>How this number is calculated?</p>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ scale: saving ? 0.96 : 1 }}
        transition={{ duration: 0.18, ease: easeBrand }}
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
        {saving && <Tap style={{ left: "50%", top: "50%" }} />}
      </motion.div>
    </motion.div>
  );
}

// Measure, in full: it starts from the catalog — searching, picking the
// kettle row — then crosses into the costed detail screen the pick opens.
// Both are real frames from the file; this just plays them in the order the
// product actually presents them, rather than dropping straight into the
// middle of the flow.
// The file's own order for this beat: browse the catalog, search narrows it
// to one AI-suggested match, picking that match opens the costed detail
// screen. Four real frames — 1:15946, 5:1563, 8:3768 — played in sequence
// rather than dropped into the middle of the flow.
const MEASURE_PHASES = ["catalog", "search", "detail"];
// The search phase's own dwell has to fit SearchResultBody's full internal
// choreography — type the query, reveal the match, pick it, then hold a
// moment on the result — since that body paces itself independent of this
// clock (see TYPE_MS / REVEAL_DELAY / PICK_DELAY / SETTLE_MS above it).
const PHASE_MS = {
  catalog: 1500,
  search: QUERY.length * TYPE_MS + REVEAL_DELAY + PICK_DELAY + SETTLE_MS,
};

function MeasureView() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState("catalog");
  // Typing state lives here, above both the search bar and the match list
  // it reveals, since a real search box and its results are driven by the
  // same live query — not by two components independently guessing at it.
  const [typed, setTyped] = useState(reduced ? QUERY : "");
  const [revealed, setRevealed] = useState(reduced);
  const [picked, setPicked] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setPhase("detail");
      return;
    }
    if (phase === "detail") return;
    const phaseTimer = setTimeout(() => {
      setPhase(MEASURE_PHASES[MEASURE_PHASES.indexOf(phase) + 1]);
    }, PHASE_MS[phase]);
    return () => clearTimeout(phaseTimer);
  }, [reduced, phase]);

  // The typing itself starts the moment the search phase begins — one
  // character at a time, into the box that was already on screen.
  useEffect(() => {
    if (reduced || phase !== "search") return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(QUERY.slice(0, i));
      if (i >= QUERY.length) clearInterval(id);
    }, TYPE_MS);
    return () => clearInterval(id);
  }, [reduced, phase]);

  // The match and the pick each wait for typing to actually finish, rather
  // than running on a clock of their own that might overtake it.
  useEffect(() => {
    if (reduced || phase !== "search" || typed.length < QUERY.length) return;
    const revealTimer = setTimeout(() => setRevealed(true), REVEAL_DELAY);
    const pickTimer = setTimeout(() => setPicked(true), REVEAL_DELAY + PICK_DELAY);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(pickTimer);
    };
  }, [reduced, phase, typed]);

  const focused = phase === "search";
  const typingDone = typed.length === QUERY.length;

  return (
    <motion.div
      key="measure"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* The outer swap only ever happens once — into the detail screen,
          which has its own, different header. Catalog and search share one
          real header AND one real search field in the file, so that pair
          lives in a single shell that never itself remounts: the header and
          the search bar are mounted once and just change props; only the
          list beneath them cross-fades between Log Again and the match. */}
      <AnimatePresence mode="wait">
        {phase === "detail" ? (
          <DetailBody key="detail" />
        ) : (
          <motion.div
            key="catalog-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: u(24), alignItems: "center" }}
          >
            <CatalogHeader />
            <CatalogSearchBar focused={focused} typed={typed} typingDone={typingDone} reduced={reduced} />
            <AnimatePresence mode="wait">
              {phase === "catalog" && <CatalogRows key="catalog" />}
              {phase === "search" && <SearchMatch key="search" revealed={revealed} picked={picked} reduced={reduced} />}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// add activity complete (12:893), at the frame's own absolute y-coordinates.
function LoggedView() {
  const reduced = useReducedMotion();
  const cardRef = useRef(null);
  // "View impact details" sits a fixed 24px under the confirmation card in
  // the file — but the card's own height there follows straight from
  // Raleway's real line boxes, which don't round to the same pixel our u()
  // arithmetic does. Measuring the rendered card and placing the link
  // exactly 24px under it keeps that gap true regardless of the mismatch,
  // rather than baking in a guessed absolute y that drifts out of sync.
  const [linkTop, setLinkTop] = useState(u(404) + u(178) + u(24));

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const measure = () => setLinkTop(u(404) + card.offsetHeight + u(24));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      key="logged"
      // A settle rather than a flat fade — the confirmation reads as the
      // direct outcome of the Save press DetailBody just showed, not an
      // unrelated screen that happens to appear next.
      initial={reduced ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: easeBrand }}
      style={{ position: "absolute", inset: 0 }}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: u(14) }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduced ? 0 : 0.2, ease: easeBrand }}
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
          initial={reduced ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18, delay: reduced ? 0 : 0.32 }}
          style={{
            width: u(80),
            height: u(80),
            borderRadius: 9999,
            backgroundImage: GRAD,
            display: "grid",
            placeItems: "center",
          }}
        >
          {/* Fully formed rather than stroke-drawn: at this icon's actual
              rendered size (~16px) a pathLength scrub has no length to show —
              it only risks being caught, mid-draw, looking like a bare dot
              rather than a check. A plain fade reads cleanly at any instant. */}
          <motion.svg
            width={u(34)}
            height={u(34)}
            viewBox="0 0 34 34"
            fill="none"
            aria-hidden="true"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: reduced ? 0 : 0.5 }}
          >
            <path
              d="M28.3333 8.5L12.75 24.0833L5.66667 17"
              stroke="white"
              strokeWidth={3.54167}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
        <p style={{ ...H3_BOLD, margin: 0, color: app.ink, textAlign: "center" }}>Activity Logged</p>
        <p style={{ ...BODY_S, margin: 0, color: app.tertiary, textAlign: "center" }}>
          Your activity has been recorded.
        </p>
      </motion.div>

      <div
        ref={cardRef}
        style={{
          position: "absolute",
          left: "50%",
          marginLeft: u(-176.5),
          top: u(404),
          width: u(353),
          background: app.card,
          borderRadius: u(24),
          padding: `${u(24)}px ${u(16)}px`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: u(16),
        }}
      >
        <Estimated />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(24) }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(4) }}>
            <p style={{ margin: 0, textAlign: "center" }}>
              <span style={{ ...type(24, 700, 24), color: app.ink }}>{ACTIVITY.amount}</span>
              <span style={{ ...type(16, 700, 24), color: app.ink }}> · </span>
              <span style={{ ...type(16, 400, 24), color: app.tertiary }}>{ACTIVITY.unit}</span>
            </p>
            <p style={{ ...BODY_S, margin: 0, color: app.tertiary, textAlign: "center" }}>
              {ACTIVITY.detail}
            </p>
          </div>
          <p style={{ ...BODY_S, margin: 0, color: app.ink, textAlign: "center" }}>{ACTIVITY.source}</p>
        </div>
      </div>

      <p
        style={{
          ...BODY_S_BOLD,
          position: "absolute",
          left: 0,
          right: 0,
          top: linkTop,
          margin: 0,
          color: app.blue500,
          textAlign: "center",
        }}
      >
        View impact details
      </p>

      <div
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
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------- 03 and 04, compact */

// The product's own six-step lifecycle. Not a single Figma frame (see
// tokens.js), so it borrows the real screens' own card radius, shadow and
// 16px rhythm rather than inventing a different one.
function TrustView() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      key="trust"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}
    >
      <FieldLabel>How this works</FieldLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: u(12) }}>
        {LIFECYCLE.map((row, i) => (
          <motion.div
            key={row.name}
            initial={reduced ? false : { opacity: 0, x: u(-16) }}
            animate={{ opacity: row.live ? 1 : 0.55, x: 0 }}
            transition={{ duration: 0.4, delay: reduced ? 0 : 0.1 + i * 0.08, ease: easeBrand }}
            style={{
              background: app.card,
              borderRadius: u(16),
              boxShadow: CARD_SHADOW,
              padding: `${u(12)}px ${u(16)}px`,
              display: "flex",
              alignItems: "center",
              gap: u(12),
            }}
          >
            <span style={{ ...BODY_XXS_BOLD, color: app.muted, lineHeight: 1 }}>{row.step}</span>
            <span style={{ ...BODY_S_BOLD, flex: 1, color: app.ink, lineHeight: 1.15 }}>{row.name}</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: u(6),
                ...BODY_XXS_MED,
                lineHeight: 1,
                letterSpacing: u(0.6),
                textTransform: "uppercase",
                color: app.tertiary,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ width: u(6), height: u(6), borderRadius: 9999, background: row.tone, flexShrink: 0 }} />
              {row.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Dashboard > My Impact so far (1:15489), in full.
function ImpactView() {
  const tiles = [
    { bg: app.lake50, width: u(135), value: "$ ...", lines: [IMPACT.valuePending] },
    { bg: app.sun50, width: u(167), value: IMPACT.share, lines: [IMPACT.shareLabel, IMPACT.shareSub] },
  ];
  return (
    <motion.div
      key="impact"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ ...CARD, width: u(353), display: "flex", flexDirection: "column", gap: u(16) }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ ...H6_BOLD, margin: 0, color: app.ink }}>My Impact so far</p>
        <Estimated />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: u(8) }}>
        <p style={{ ...BODY_XS, margin: 0, color: app.tertiary }}>{IMPACT.eyebrow}</p>
        <p style={{ ...BODY_XS_BOLD, margin: 0, color: app.ink }}>{IMPACT.projects}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: u(16) }}>
        <div style={{ width: u(90), height: u(75), position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <img
            src={leafArt}
            alt=""
            style={{ position: "absolute", left: "-11.11%", top: "-10.59%", width: "118.52%", height: "116.74%" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: u(8), minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: u(4) }}>
            <p style={{ ...H3_BLACK, margin: 0, fontVariantNumeric: "tabular-nums", ...gradText }}>
              <Counter to={IMPACT.logged} delay={0.3} duration={0.9} />
            </p>
            <p style={{ ...BODY_XS_MED, margin: 0, color: app.ink }}>{IMPACT.unit}</p>
          </div>
          <p style={{ ...BODY_XXS, margin: 0, color: app.tertiary }}>{IMPACT.treeLine}</p>
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

      <p style={{ ...BODY_S_BOLD, margin: 0, color: app.ink }}>{IMPACT.breakdown}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: u(8) }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p style={{ ...BODY_XXS, margin: 0, color: app.tertiary }}>{IMPACT.period}</p>
          <p style={{ ...BODY_XXS_BOLD, margin: 0, color: app.success }}>{IMPACT.weekDelta}</p>
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
          {IMPACT.project}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: u(4) }}>
          <p style={{ ...BODY_XXS_MED, margin: 0, color: app.ink }}>{IMPACT.progress}</p>
          <p style={{ ...BODY_XXS_MED, margin: 0, color: app.ink }}>{IMPACT.progressLabel}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- shell */

export default function PersustainPhone({ state, carriesAllStates = false }) {
  // On the wide card the field takes over after beat 02, so the phone holds
  // its beat-02 state and steps back rather than repeating what is already
  // being said larger beside it.
  const view = carriesAllStates ? state : Math.min(state, 1);
  const receded = !carriesAllStates && state > 1;

  return (
    <motion.div
      animate={{ scale: receded ? 0.965 : 1, opacity: receded ? 0.45 : 1 }}
      transition={{ duration: 0.7, ease: easeBrand }}
      style={{
        // The same soft, chrome-free screen the case study frames its live
        // prototype in — a rounded rectangle with a hairline ring and a
        // shadow, not a bezel-and-notch device shell.
        position: "relative",
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: u(34),
        overflow: "hidden",
        background: app.screen,
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.16), 0 26px 60px rgba(8,4,22,0.55), 0 8px 20px rgba(8,4,22,0.4)",
        fontFamily: "'Raleway', var(--font-sans)",
      }}
    >
      {/* Trust and Impact aren't absolute-positioned Figma frames, so they
          get a centred flow container; Measure and Logged position
          themselves against the full canvas directly (position: absolute,
          inset: 0, set on each view itself). */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: view >= 2 ? "flex" : "contents",
          alignItems: "center",
          justifyContent: "center",
          padding: view >= 2 ? u(20) : 0,
        }}
      >
        <AnimatePresence mode="wait">
          {view === 0 && <MeasureView />}
          {view === 1 && <LoggedView />}
          {view === 2 && <TrustView />}
          {view === 3 && <ImpactView />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
