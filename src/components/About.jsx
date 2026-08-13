import { useEffect, useRef, useState } from "react";
import heroPhoto from "../assets/hero-photo.jpg";
import marvaDog from "../assets/marva-dog.jpg";
import scottPhoto from "../assets/Scott.jpeg";
import GradientFrame from "./GradientFrame";

const DARK = "#1c1833";
const MUTED = "#4d476a";

// The other three slots are still placeholders (reusing the headshot) until
// real photos are supplied to swap in.
const stackPhotos = [
  { id: "a", src: marvaDog, caption: "My co-pilot 🐾" },
  { id: "b", src: heroPhoto, caption: "In the studio" },
  { id: "c", src: heroPhoto, caption: "Chasing daylight" },
  { id: "d", src: heroPhoto, caption: "Behind the scenes" },
];

const stats = [
  { value: 6, suffix: "+", label: "Years of work experience" },
  { value: 10, suffix: "+", label: "Products shaped from idea to delivery" },
  { value: 20, suffix: "+", label: "Teams & clients partnered with" },
];

// Only the first entry is a real endorsement. The rest are empty slots kept
// deliberately blank — writing filler praise here would put words in real
// people's mouths on a public page. Swap in the actual quote, name, role and
// photo as they come in; delete any slot you don't need and the avatar row
// resizes itself.
const testimonials = [
  {
    id: "scott",
    name: "Scott Mallory",
    role: "Founder & Director of Design @ ISM Creative",
    photo: scottPhoto,
    quote:
      "Marva wrangles and decodes abstract ideas, rapidly streamlines them through design thinking, and then makes the solutions relevant to a client's businesses in an analytical and practical way, far beyond just waiting for instructions. She is sharp at articulating and communicating connections between design and business for clients based on research, and adapting to clients' preferences.",
  },
  {
    id: "slot-2",
    name: "Add a name",
    role: "Role @ Company",
    photo: null,
    quote: "This slot is empty — add the testimonial text here.",
  },
  {
    id: "slot-3",
    name: "Add a name",
    role: "Role @ Company",
    photo: null,
    quote: "This slot is empty — add the testimonial text here.",
  },
  {
    id: "slot-4",
    name: "Add a name",
    role: "Role @ Company",
    photo: null,
    quote: "This slot is empty — add the testimonial text here.",
  },
  {
    id: "slot-5",
    name: "Add a name",
    role: "Role @ Company",
    photo: null,
    quote: "This slot is empty — add the testimonial text here.",
  },
];

const SWIPE_MIN = 60; // px of horizontal drag before it counts as a swipe

const COUNT_DURATION = 1400;

// Counts up from zero the first time the number scrolls into view, then
// stays put — it's an accent on arrival, not something that replays every
// time you scroll past.
function CountUp({ to, suffix }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return undefined;
    }

    let frame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / COUNT_DURATION, 1);
          // easeOutCubic: quick off the mark, gently settling on the value
          setValue(Math.round((1 - Math.pow(1 - t, 3)) * to));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

const CARD_WIDTH = 380;
const CARD_HEIGHT = 500;
// White border around each photo. Shared so the "Swipe or tap" hint below can
// be centred on the card's true outer width rather than guessing at it.
const CARD_PADDING = 16;

// Available content width is 100vw minus the section's px-6 padding (48px)
// minus the 64px the wrapper adds for the fanned cards behind the front one.
// Capped at the desktop 380px, so nothing changes from md up.
const CARD_W = `min(${CARD_WIDTH}px, calc(100vw - 112px))`;
const CARD_H = `calc(${CARD_W} * ${CARD_HEIGHT} / ${CARD_WIDTH})`;

// Position within the stack (0 = front, draggable) → resting offset. Cards
// further back fan out in different directions with only a slight tilt —
// just enough to reveal their white border, not the photo underneath.
const STACK_OFFSETS = [
  { x: 0, y: 0, rotate: 0, scale: 1 },
  { x: 16, y: -12, rotate: 4, scale: 0.97 },
  { x: -14, y: 16, rotate: -5, scale: 0.94 },
  { x: 6, y: -22, rotate: -8, scale: 0.91 },
];

const SETTLE_TRANSITION = "700ms cubic-bezier(0.22, 1, 0.36, 1)";
const SWIPE_THRESHOLD = 90; // px of horizontal drag that commits a swipe
const TAP_THRESHOLD = 6; // px below this, a release counts as a tap

const EXIT_DISTANCE = 460; // far enough to clear the card, short enough to
  // fully fade out before it would hit the section's clipped edge
const EXIT_ROTATE = 14; // fixed, modest tilt — not scaled by drag distance
const DRAG_ROTATE_CAP = 12; // caps live-drag tilt so a long drag before
  // release never looks like an unnaturally hard spin

function PhotoStack() {
  const [order, setOrder] = useState(stackPhotos.map((_, i) => i));
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startXRef = useRef(0);

  const cycle = () => setOrder((prev) => [...prev.slice(1), prev[0]]);

  const handlePointerDown = (e) => {
    if (isExiting) return; // ignore new gestures while a card is mid-exit
    startXRef.current = e.clientX;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setDragX(e.clientX - startXRef.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      // committed swipe — fly and fade out together, so it's fully
      // transparent well before it would reach the section's clipped edge
      const direction = dragX > 0 ? 1 : -1;
      setIsExiting(true);
      setDragX(direction * EXIT_DISTANCE);
      window.setTimeout(() => {
        cycle();
        setDragX(0);
        setIsExiting(false);
      }, 500);
    } else if (Math.abs(dragX) < TAP_THRESHOLD) {
      cycle();
      setDragX(0);
    } else {
      setDragX(0); // inconclusive drag — snap back to rest
    }
  };

  return (
    <div
      className="relative"
      style={{ width: `calc(${CARD_W} + 64px)`, height: `calc(${CARD_H} + 64px)` }}
    >
      {order.map((photoIndex, stackPos) => {
        const photo = stackPhotos[photoIndex];
        const offset = STACK_OFFSETS[stackPos];
        const isFront = stackPos === 0;
        const x = offset.x + (isFront ? dragX : 0);
        const liveRotate = Math.max(
          -DRAG_ROTATE_CAP,
          Math.min(DRAG_ROTATE_CAP, dragX / 14),
        );
        const rotate =
          offset.rotate +
          (isFront
            ? isExiting
              ? (dragX > 0 ? 1 : -1) * EXIT_ROTATE
              : liveRotate
            : 0);
        const opacity = isFront && isExiting ? 0 : 1;
        return (
          <div
            key={photo.id}
            onPointerDown={isFront ? handlePointerDown : undefined}
            onPointerMove={isFront ? handlePointerMove : undefined}
            onPointerUp={isFront ? handlePointerUp : undefined}
            onPointerCancel={isFront ? handlePointerUp : undefined}
            role={isFront ? "button" : undefined}
            tabIndex={isFront ? 0 : undefined}
            onKeyDown={
              isFront
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      cycle();
                    }
                  }
                : undefined
            }
            className="tag-shadow absolute left-0 top-0 select-none rounded-[28px] bg-[#fffdf7]"
            style={{
              padding: CARD_PADDING,
              zIndex: stackPhotos.length - stackPos,
              cursor: isFront ? (isDragging ? "grabbing" : "grab") : "default",
              touchAction: isFront ? "pan-y" : "auto",
              opacity,
              transform: `translate(${x}px, ${offset.y}px) rotate(${rotate}deg) scale(${offset.scale})`,
              transition:
                isFront && isDragging
                  ? "none"
                  : `transform ${SETTLE_TRANSITION}, box-shadow ${SETTLE_TRANSITION}, opacity ${SETTLE_TRANSITION}`,
            }}
          >
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{ width: CARD_W, height: CARD_H }}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
            {isFront && (
              <span
                className="tag-shadow absolute bottom-0 left-1/2 inline-flex -translate-x-1/2 translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide"
                style={{ backgroundColor: "#F0E9FF", color: DARK }}
              >
                {photo.caption}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Collapsed height on mobile, where the bio stacks under the photo instead
// of running alongside it — enough to show the first paragraph as a teaser
// without the section eating the whole first screen of scroll.
const BIO_COLLAPSED_HEIGHT = 220;

export default function About() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bioExpanded, setBioExpanded] = useState(false);
  const quoteStartX = useRef(null);
  const active = testimonials[activeIndex];

  // Wraps in both directions so you can keep swiping past either end
  const step = (delta) =>
    setActiveIndex(
      (i) => (i + delta + testimonials.length) % testimonials.length,
    );

  const onQuotePointerDown = (e) => {
    quoteStartX.current = e.clientX;
  };

  const onQuotePointerUp = (e) => {
    if (quoteStartX.current === null) return;
    const dx = e.clientX - quoteStartX.current;
    quoteStartX.current = null;
    // Swipe left → next (content moves the way your finger went)
    if (Math.abs(dx) > SWIPE_MIN) step(dx < 0 ? 1 : -1);
  };

  return (
    <section className="relative overflow-clip bg-[#fffdf7] px-6 pb-24 pt-24 md:px-24 md:pb-[200px] md:pt-[200px]">
      <div className="mx-auto" style={{ maxWidth: 1232 }}>
        <p
          id="about"
          className="scroll-mt-8 text-[12px] font-medium uppercase tracking-[0.15em] md:scroll-mt-10 md:text-[14px] md:tracking-[0.2em]"
          style={{ color: MUTED }}
        >
          About
        </p>
        <h2
          className="font-georgia fluid-section-title mt-3 font-bold"
          style={{ color: DARK }}
        >
          Hey, I'm Marva!
        </h2>
        <p
          className="mt-3 text-[17px] leading-relaxed md:text-[20px]"
          style={{ color: MUTED, maxWidth: 1232 }}
        >
          My approach to design is anchored by an unorthodox trajectory. I
          started with my hands — a{" "}
          <strong style={{ color: DARK }}>BA in Sculpture</strong>, shaping
          clay and space long before I touched a screen. Then came{" "}
          <strong style={{ color: DARK }}>Game Design</strong>, followed by a{" "}
          <strong style={{ color: DARK }}>
            Master’s in Human-Computer Interaction
          </strong>
          .
        </p>

        <div className="mt-10 grid gap-10 md:mt-14 md:gap-20 md:grid-cols-[460px_1fr]">
          <div className="flex flex-col items-start">
            <PhotoStack />
            {/* Centred on the front card, not on the stack wrapper — the
                wrapper is wider than the card to leave room for the fanned
                cards behind it, so centring on it would sit visibly off. */}
            <p
              className="mt-4 text-center text-sm font-medium"
              style={{ color: MUTED, width: `calc(${CARD_W} + ${CARD_PADDING * 2}px)` }}
            >
              Swipe or tap to see more
            </p>
          </div>

          <div className="relative">
            <div
              className={`space-y-6 text-left text-[17px] leading-relaxed transition-[max-height] duration-300 md:max-h-none! md:overflow-visible md:text-justify md:text-[20px] ${
                bioExpanded ? "overflow-visible" : "overflow-hidden"
              }`}
              style={{
                color: MUTED,
                maxHeight: bioExpanded ? 2000 : BIO_COLLAPSED_HEIGHT,
              }}
            >
              <p>
                Somewhere along the way, I realized{" "}
                <strong style={{ color: DARK }}>design</strong> was the thread
                tying it all together: an instinct for form, human behaviour,
                and how an experience feels to move through.
              </p>
              <p>
                What{" "}
                <strong style={{ color: DARK }}>
                  I love most is the messy middle of a project
                </strong>{" "}
                — that early, foggy phase where the strategy is still unmapped.
                Give me an ambiguous problem and a cross-functional team to
                think out loud with, and I’m exactly where I want to be: asking
                the foundational questions and turning conceptual fog into
                something we can actually build. Lately, I’ve been applying
                that thinking to AI and spatial products, where the rules are
                still being written.
              </p>
              <p>
                Off the screen, the creating doesn’t stop, it just gets more
                hands-on as I play with form and colour through sculpture and
                painting. When I’m not making something, I’m usually chasing
                daylight with Pepper, my six-pound Pomeranian who firmly
                manages me and runs the operation. It’s a grounding mix that
                keeps me energized for the next digital problem.
              </p>
            </div>

            {/* The fade + toggle are mobile-only — the desktop two-column
                layout has room to run the bio in full without either. */}
            {!bioExpanded && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-9 h-14 bg-gradient-to-t from-[#fffdf7] to-transparent md:hidden"
              />
            )}
            <button
              type="button"
              onClick={() => setBioExpanded((v) => !v)}
              aria-expanded={bioExpanded}
              className="relative mt-3 text-[15px] font-semibold underline underline-offset-2 md:hidden"
              style={{ color: DARK }}
            >
              {bioExpanded ? "Read less" : "Read more"}
            </button>
          </div>
        </div>

        {/* Kind words */}
        <div className="relative mt-20 md:mt-[100px]">
          {/* soft mesh blobs, first in the stack (default z-index) so the
              "relative z-10" content wrapper below reliably paints above
              it — same pattern as the hero/expertise backgrounds — drifting
              a few px up/down at staggered delays so the motion reads as
              loose and unsynced rather than a single bouncing group */}
          <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: 760 }}>
            <div
              className="mesh-blob mesh-float mesh-yellow"
              style={{ top: -40, left: "-4%", width: 560, height: 560 }}
            />
            <div
              className="mesh-blob mesh-float mesh-purple"
              style={{ top: 20, right: "2%", width: 600, height: 600, animationDelay: "-5s" }}
            />
            <div
              className="mesh-blob mesh-float mesh-teal"
              style={{ top: 380, left: "28%", width: 580, height: 580, animationDelay: "-9s" }}
            />
          </div>

          <div className="relative z-10">
            <h3
              className="font-georgia fluid-subsection-title font-bold"
              style={{ color: DARK }}
            >
              Kind words.
            </h3>
            <p className="mt-3 text-[17px] md:text-[20px]" style={{ color: MUTED }}>
              Feedback from the cross-functional leaders and stakeholders
              I've collaborated with along the way.
            </p>

            <div
              className="mt-10 flex flex-wrap items-center justify-between gap-4"
              style={{ touchAction: "pan-y" }}
              onPointerDown={onQuotePointerDown}
              onPointerUp={onQuotePointerUp}
            >
              <div className="flex items-center gap-4">
                <GradientFrame
                  className="shrink-0"
                  radius="9999px"
                  padding="2.5px"
                  innerClassName="overflow-hidden"
                >
                  {active.photo ? (
                    <img
                      src={active.photo}
                      alt={active.name}
                      className="h-[72px] w-[72px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-[72px] w-[72px] rounded-full bg-[#e6e2f5]" />
                  )}
                </GradientFrame>
                <div className="text-left">
                  <p className="font-semibold" style={{ color: DARK }}>
                    {active.name}
                  </p>
                  <p className="text-sm" style={{ color: MUTED }}>
                    {active.role}
                  </p>
                </div>
              </div>

            </div>

            <blockquote
              aria-live="polite"
              className="fluid-quote mt-8 cursor-grab font-medium leading-snug transition-opacity duration-300 active:cursor-grabbing"
              style={{ color: DARK, touchAction: "pan-y" }}
              onPointerDown={onQuotePointerDown}
              onPointerUp={onQuotePointerUp}
            >
              {active.quote}
            </blockquote>

            {/* Hint and avatars sit together: the sentence explains what
                the row of faces does, so they read as one control rather
                than a caption stranded from the thing it describes. */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              <p className="text-sm font-medium" style={{ color: MUTED }}>
                Swipe or tap a photo to read another
              </p>
              {/* The row holds only the testimonials you're NOT reading —
                  the active one is already shown large on the left, so
                  repeating it here would just be the same face twice. Pick
                  one and it swaps into the feature spot while the one you
                  were reading drops back into its slot in this row.
                  Desaturated so the row stays quiet next to the colour
                  portrait it sits beside. */}
              <div className="flex -space-x-3">
                {testimonials
                  .map((t, i) => ({ t, i }))
                  .filter(({ i }) => i !== activeIndex)
                  .map(({ t, i }) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Read the testimonial from ${t.name}`}
                      className="relative h-11 w-11 shrink-0 rounded-full opacity-70 md:h-10 md:w-10 transition duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:opacity-100 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f74ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf7]"
                      style={{ border: "2px solid #fffdf7" }}
                    >
                      {t.photo ? (
                        <img
                          src={t.photo}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                          style={{ filter: "grayscale(1)" }}
                        />
                      ) : (
                        <div className="h-full w-full rounded-full bg-[#e6e2f5]" />
                      )}
                    </button>
                  ))}
              </div>
            </div>

          <div className="mt-12 grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-4 md:mt-16">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-georgia fluid-subsection-title font-bold"
                  style={{ color: DARK }}
                >
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm" style={{ color: MUTED }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
