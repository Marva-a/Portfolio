import { useRef, useState } from "react";
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
  { value: "6+", label: "Years of work experience" },
  { value: "100+", label: "Hours of user tests" },
  { value: "9,999+", label: "Infinite ideas" },
];

const CARD_WIDTH = 380;
const CARD_HEIGHT = 500;

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
      style={{ width: CARD_WIDTH + 64, height: CARD_HEIGHT + 64 }}
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
            className="tag-shadow absolute left-0 top-0 select-none rounded-[28px] bg-[#fffdf7] p-4"
            style={{
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
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
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

export default function About() {
  return (
    <section className="relative overflow-clip bg-[#fffdf7] px-6 pb-[200px] pt-[200px] md:px-24">
      <div className="mx-auto" style={{ maxWidth: 1232 }}>
        <p
          id="about"
          className="scroll-mt-8 text-[14px] font-medium uppercase tracking-[0.2em] md:scroll-mt-10"
          style={{ color: MUTED }}
        >
          About
        </p>
        <h2
          className="font-georgia mt-3 text-[64px] font-bold"
          style={{ color: DARK }}
        >
          Hey, I'm Marva!
        </h2>
        <p
          className="mt-3 text-[20px] leading-relaxed"
          style={{ color: MUTED, maxWidth: 1232 }}
        >
          My approach to design is anchored by an unorthodox trajectory. I
          started with my hands, a{" "}
          <strong style={{ color: DARK }}>BA in Sculpture</strong>, spending
          years in the studio shaping clay and space long before I touched a
          screen. Then came <strong style={{ color: DARK }}>Game Design</strong>,
          followed by a{" "}
          <strong style={{ color: DARK }}>
            Master's in Human-Computer Interaction.
          </strong>
        </p>

        <div className="mt-14 grid gap-20 md:grid-cols-[460px_1fr]">
          <div className="flex flex-col items-center">
            <PhotoStack />
            <p
              className="mt-4 text-sm font-medium"
              style={{ color: MUTED }}
            >
              Swipe or tap to see more
            </p>
          </div>

          <div
            className="space-y-6 text-justify text-[20px] leading-relaxed"
            style={{ color: MUTED }}
          >
            <p>
              Somewhere in that evolution, I realized{" "}
              <strong style={{ color: DARK }}>design</strong> was the thread
              tying it all together, the same foundational instinct for form,
              for human behaviour, and for how an environment feels to move
              through.
            </p>
            <p>
              What{" "}
              <strong style={{ color: DARK }}>
                I love most is the messy middle of a project
              </strong>
              , the early, foggy phase where the strategy is unmapped. Give
              me an ambiguous problem and a cross-functional team to think
              out loud with, and I'm exactly where I want to be: asking the
              foundational questions and turning conceptual fog into
              something we can actually build. Lately, I've been applying
              this to AI and spatial products, where the design paradigms are
              still being written.
            </p>
            <p>
              I drive product success by focusing on two core pillars:
              ensuring the system is genuinely{" "}
              <strong style={{ color: DARK }}>intuitive for the user,</strong>{" "}
              and protecting the{" "}
              <strong style={{ color: DARK }}>culture of the team</strong>{" "}
              building it. The most impactful products I've shipped came from
              cross-functional environments built on{" "}
              <strong style={{ color: DARK }}>zero ego and deep trust</strong>.
            </p>
          </div>
        </div>

        <p
          className="mt-20 text-[20px] leading-relaxed"
          style={{ color: MUTED, maxWidth: 1232 }}
        >
          Off the screen, the creating doesn't stop, it just gets a bit more
          hands-on. I spend my time chasing daylight, using sculpture as a
          fun, grounding way to play with form, or being firmly managed by my
          six-pound Pomeranian who runs the operation. It's a grounding
          routine that keeps me energized for the next digital problem.
        </p>

        {/* Kind words */}
        <div className="relative mt-[100px]">
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
              className="font-georgia text-[40px] font-bold"
              style={{ color: DARK }}
            >
              Kind words.
            </h3>
            <p className="mt-3 text-[20px]" style={{ color: MUTED }}>
              Feedback from the cross-functional leaders and stakeholders
              I've collaborated with along the way.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <GradientFrame
                  className="shrink-0"
                  radius="9999px"
                  padding="2.5px"
                  innerClassName="overflow-hidden"
                >
                  <img
                    src={scottPhoto}
                    alt="Scott Mallory"
                    className="h-[72px] w-[72px] rounded-full object-cover"
                  />
                </GradientFrame>
                <div className="text-left">
                  <p className="font-semibold" style={{ color: DARK }}>
                    Scott Mallory
                  </p>
                  <p className="text-sm" style={{ color: MUTED }}>
                    Founder & Director of Design @ ISM Creative
                  </p>
                </div>
              </div>

              <div className="flex -space-x-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full bg-[#e6e2f5]"
                    style={{ border: "2px solid #fffdf7" }}
                  />
                ))}
              </div>
            </div>

            <p
              className="mt-8 text-[28px] font-medium leading-snug"
              style={{ color: DARK }}
            >
              Marva wrangles and decodes abstract ideas, rapidly streamlines
              them through design thinking, and then makes the solutions
              relevant to a client's businesses in an analytical and
              practical way, far beyond just waiting for instructions. She
              is sharp at articulating and communicating connections between
              design and business for clients based on research, and
              adapting to clients' preferences.
            </p>

          <div className="mt-16 grid grid-cols-3 gap-4 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-georgia text-[40px] font-bold"
                  style={{ color: DARK }}
                >
                  {stat.value}
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
