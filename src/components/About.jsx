import { useEffect, useRef, useState } from "react";
import chasingDaylight from "../assets/chasing-daylight.webp";
import marvaDog from "../assets/marva-dog.jpg";
import marvaPainting from "../assets/marva-painting.jpg";
import marvaSculpture from "../assets/marva-sculpture.jpg";
import scottPhoto from "../assets/Scott.jpeg";
import GradientFrame from "./GradientFrame";
import Pill from "./ui/Pill";
import SectionHeading from "./ui/SectionHeading";
import { color, pillPalette } from "../styles/tokens";

const DARK = color.textPrimary;
const MUTED = color.textMuted;

const stackPhotos = [
  { id: "d", src: marvaPainting, caption: "Painting" },
  { id: "b", src: marvaSculpture, caption: "Sculpting" },
  { id: "a", src: marvaDog, caption: "My co-pilot 🐾" },
  { id: "c", src: chasingDaylight, caption: "Chasing daylight" },
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
    id: "chris",
    name: "Chris Jung",
    role: "Tech Lead @ ISM Creative",
    photo: null,
    quote:
      "Marva has demonstrated proficiency in cloud development environments such as Flutter, Firebase, and Google Cloud Platform, as well as a strong foundation in API integration and a consistent commitment to applying accessible UX principles throughout her design process. … On our most recent project, Marva was able to deliver an MVP application that required novel API integrations for a feature-rich application.",
  },
  {
    id: "slot-3",
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

// Driven by a CSS variable rather than computed here, so the tablet band can
// give the stack a bigger card (see --about-card-w in index.css) without this
// component needing to know the viewport. Phones still resolve to 100vw minus
// the section's px-6 padding and the 64px the wrapper adds for the fanned
// cards; desktop still resolves to CARD_WIDTH.
const CARD_W = "var(--about-card-w)";
const CARD_H = `calc(${CARD_W} * ${CARD_HEIGHT} / ${CARD_WIDTH})`;

// Position within the stack (0 = front, draggable) → resting offset. Cards
// further back fan out with only a slight tilt — just enough to reveal
// their white border, not the photo underneath.
//
// Every offset is positive so the fan opens right and down only. A tilted
// card's *bounding box* is wider than the card, so a card at x:-14 with a
// 5° tilt reached 23px left of the section's margin — the front card lined
// up with the text above it, but the stack behind it visibly overhung the
// column that every other section starts at. The tilts and the vertical
// spread still do the work of separating the cards; only their horizontal
// direction changed.
const STACK_OFFSETS = [
  { x: 0, y: 0, rotate: 0, scale: 1 },
  { x: 16, y: -12, rotate: 4, scale: 0.97 },
  { x: 10, y: 16, rotate: -5, scale: 0.94 },
  { x: 14, y: -22, rotate: -8, scale: 0.91 },
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
      // The wrapper reserves 64px beyond the card for the fan, all of it to
      // the right of the front card — so centring the wrapper leaves the card
      // itself 16px left of centre. The 32px margin puts that surplus back on
      // both sides, which centres the card rather than the reserved box.
      // Only where the column is centred: phones and desktop align left, and
      // on a phone the wrapper already fills the column exactly.
      className="relative md:ml-8 xl:ml-0"
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
            // Without an explicit name the card's name is computed from its
            // contents — the photo's alt and the caption pill, both the same
            // word — and announces as "Painting Painting, button". This says
            // what the card is and what activating it does.
            aria-label={
              isFront ? `${photo.caption} — show the next photo` : undefined
            }
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
            className="tag-shadow absolute left-0 top-0 select-none rounded-[28px] bg-[var(--color-surface)]"
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
                // Decorative: the caption pill below names the photo in
                // visible text, and the card's aria-label repeats it — a
                // third copy in the alt would announce the word three times.
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
            {isFront && (
              <Pill
                bg={pillPalette[2]}
                color={DARK}
                className="absolute bottom-0 left-1/2 inline-flex -translate-x-1/2 translate-y-1/2 items-center gap-1.5 whitespace-nowrap text-sm font-semibold uppercase tracking-wide"
              >
                {photo.caption}
              </Pill>
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
    <section className="relative overflow-clip bg-[var(--color-surface)] px-6 pb-24 pt-24 md:px-24 md:pb-[200px] md:pt-[200px]">
      <div className="content-container">
        <SectionHeading
          id="about"
          eyebrow="About"
          descriptionClassName="leading-relaxed"
          description={
            <>
              My approach to design is anchored by an unorthodox trajectory. I
              started with my hands — a{" "}
              <strong style={{ color: DARK }}>BA in Sculpture</strong>, shaping
              clay and space long before I touched a screen. Then came{" "}
              <strong style={{ color: DARK }}>Game Design</strong>, followed by a{" "}
              <strong style={{ color: DARK }}>
                Master’s in Human-Computer Interaction
              </strong>
              .
            </>
          }
        >
          Hey, I'm Marva!
        </SectionHeading>

        <div className="mt-10 grid gap-10 md:mt-14 md:gap-20 xl:grid-cols-[460px_1fr]">
          <div className="flex flex-col items-start md:items-center xl:items-start">
            <PhotoStack />
            {/* Centred on the front card, not on the stack wrapper — the
                wrapper is wider than the card to leave room for the fanned
                cards behind it, so centring on it would sit visibly off. */}
            <p
              className="type-label mt-4 text-center font-medium"
              style={{ color: MUTED, width: `calc(${CARD_W} + ${CARD_PADDING * 2}px)` }}
            >
              Swipe or tap to see more
            </p>
          </div>

          <div className="relative">
            <div
              className={`type-body max-w-[70ch] space-y-6 text-left leading-relaxed transition-[max-height] duration-300 xl:max-w-none xl:max-h-none! xl:overflow-visible xl:text-justify ${
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
                className="pointer-events-none absolute inset-x-0 bottom-9 h-14 bg-gradient-to-t from-[var(--color-surface)] to-transparent xl:hidden"
              />
            )}
            <button
              type="button"
              onClick={() => setBioExpanded((v) => !v)}
              aria-expanded={bioExpanded}
              className="type-label relative mt-3 font-semibold underline underline-offset-2 xl:hidden"
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
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0" style={{ height: 760 }}>
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
            <p className="type-body mt-3 max-w-[72ch] xl:max-w-none" style={{ color: MUTED }}>
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
                      loading="lazy"
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
              <p className="type-label font-medium" style={{ color: MUTED }}>
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
                      className="relative h-11 w-11 shrink-0 rounded-full opacity-70 md:h-10 md:w-10 transition duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:opacity-100 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
                      style={{ border: `2px solid ${color.surface}` }}
                    >
                      {t.photo ? (
                        <img
                          src={t.photo}
                          alt=""
                          loading="lazy"
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
