import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GradientFrame from "./GradientFrame";
import BrandBadge from "./BrandBadge";
import Nav from "./Nav";
import useMediaQuery, { MOBILE_QUERY } from "../hooks/useMediaQuery";
import useScrollDirection from "../hooks/useScrollDirection";
import heroPhoto from "../assets/hero-photo.jpg";

const pills = [
  { label: "0-to-1", bg: "#E8FFF6" },
  { label: "Systems Thinking", bg: "#E6F6FF" },
  { label: "B2B2C", bg: "#F0E9FF" },
  { label: "SaaS", bg: "#FFE1D6" },
];

const PHOTO_WIDTH = "clamp(110px, 16vw, 244px)";
const PHOTO_GAP = "32px";
// The photo is inset `right-[4%]` from the box, so its left edge sits at
// `100% - 4% - PHOTO_WIDTH`. Reserving text width against that (rather than
// against the box's bare right edge) keeps a constant PHOTO_GAP between the
// text and the photo at every screen size, instead of the two drifting
// closer together — or overlapping — as the box scales.
const TEXT_RESERVE = `calc(100% - 4% - ${PHOTO_WIDTH} - ${PHOTO_GAP})`;

// Real px targets for the badge's width, animated via the `width` property
// rather than Framer's transform-based `layout` FLIP. Layout animations scale
// the whole box visually, which distorts the padding used to paint the
// gradient stroke (it briefly vanishes or overshoots); animating a real width
// keeps the 1px stroke crisp throughout.
const BADGE_INNER_PADDING_X = 40; // px-5 on each side
const BADGE_STROKE = 2; // 1px stroke on each side
const BADGE_COLLAPSED_INNER = 48; // matches h-12, keeps "MA" a circle

const PHOTO_TOP_GAP = -40; // pulls the photo up to overlap the headline's last line slightly, at every screen size

export default function Hero() {
  // Mobile drops the reserved photo column entirely: the photo moves into
  // normal flow as a full-width portrait, so the copy gets the whole width
  // instead of the ~119px ribbon left over beside a thumbnail.
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const scrollDirection = useScrollDirection(isMobile);
  const sectionRef = useRef(null);
  const [inHero, setInHero] = useState(true);
  const measureRef = useRef(null);
  const [nameWidth, setNameWidth] = useState(97);
  const headlineRef = useRef(null);
  const [photoTop, setPhotoTop] = useState(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInHero(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (measureRef.current) {
      setNameWidth(measureRef.current.scrollWidth);
    }
  }, []);

  useLayoutEffect(() => {
    // Fluid type means the headline's rendered height changes continuously
    // with viewport width, so the photo's offset is recomputed from the
    // headline's real height (not a fixed or percentage guess) whenever the
    // window resizes, keeping a true PHOTO_TOP_GAP px gap at every size.
    const updatePhotoTop = () => {
      if (headlineRef.current) {
        setPhotoTop(
          headlineRef.current.offsetTop +
            headlineRef.current.offsetHeight +
            PHOTO_TOP_GAP,
        );
      }
    };
    updatePhotoTop();
    window.addEventListener("resize", updatePhotoTop);
    return () => window.removeEventListener("resize", updatePhotoTop);
  }, []);

  // Mobile keeps the badge collapsed to "MA" so the status pill can sit
  // opposite it on the same row, as in the reference.
  const badgeExpanded = inHero && !isMobile;
  // Mobile only: the badge parks off-screen while scrolling down. Desktop
  // keeps it pinned, where there's room for it and no reason to hide it.
  const badgeHidden = isMobile && scrollDirection === "down";
  const badgeWidth = badgeExpanded
    ? nameWidth + BADGE_INNER_PADDING_X + BADGE_STROKE
    : BADGE_COLLAPSED_INNER + BADGE_STROKE;

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative overflow-clip bg-[#fff7e8] px-6 pb-24 pt-[150px] md:px-24 md:pb-[200px] md:pt-[200px]"
    >
      {/* animated gradient mesh background — the whole group slowly orbits
          clockwise so the blobs swap corners over time. They're anchored
          close to the section's actual corners (matching the reference), so
          at some points in the rotation a blob's center can briefly pass
          just outside the section — a sliver gets clipped by the section's
          overflow-hidden, same as it already does at rest, but since each
          blob is much larger than that overshoot, all three stay clearly
          visible throughout. */}
      <div className="mesh-orbit pointer-events-none absolute inset-0 z-0">
        <div
          className="mesh-blob mesh-yellow"
          style={{
            top: "50%",
            left: "50%",
            width: 680,
            height: 680,
            transform: "translate(calc(-50% - 500px), calc(-50% - 260px))",
          }}
        />
        <div
          className="mesh-blob mesh-purple"
          style={{
            top: "50%",
            left: "50%",
            width: 680,
            height: 680,
            transform: "translate(calc(-50% + 500px), calc(-50% - 260px))",
          }}
        />
        <div
          className="mesh-blob mesh-teal"
          style={{
            top: "50%",
            left: "50%",
            width: 660,
            height: 660,
            transform: "translate(-50%, calc(-50% + 460px))",
          }}
        />
      </div>

      {/* hidden measurer — gives us the real pixel width of "Marva Abouei"
          so the badge can animate a genuine width instead of relying on
          layout's transform-based resize (which distorts the stroke) */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed left-0 top-0 whitespace-nowrap text-[15px] font-medium"
        style={{ height: 0, overflow: "hidden" }}
      >
        Marva Abouei
      </span>

      {/* MA / Marva Abouei badge — fixed, always visible, and always links
          back to the top of the hero */}
      {/* The fixed positioning and the slide live on this wrapper, not on the
          badge itself: the badge is a motion element that already owns its
          own transform for the width animation, and driving a second
          transform onto it would mean the two fighting for one property.
          Keeping the slide here makes it a plain CSS transition.
          -120px clears the badge's own height (48px) plus the top-8 inset
          with room to spare, so nothing peeks over the edge. */}
      <div
        className="fixed left-6 top-8 z-50 md:left-24 md:top-10"
        style={{
          transform: badgeHidden ? "translateY(-120px)" : "translateY(0)",
          transition: "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <motion.a
          href="#hero"
          animate={{ width: badgeWidth }}
          transition={{ type: "tween", duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          // `relative` is load-bearing: .btn-shine paints its sweep with an
          // absolutely-positioned ::after and deliberately sets no position
          // of its own, so without this the sweep resolves against the fixed
          // wrapper instead of the badge — and drifts out of register with
          // it the moment the badge animates its width.
          className="tag-shadow gradient-border-anim btn-shine btn-shine-brand relative block overflow-hidden"
          style={{ padding: "1px", borderRadius: 9999 }}
        >
          <div className="flex h-12 items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-[#fffdf7] px-5 text-[15px] font-medium text-[#1c1833]">
            <BrandBadge expanded={badgeExpanded} />
          </div>
        </motion.a>
      </div>

      {/* Open to new roles — pinned opposite the badge on desktop. On mobile
          the two collide at 320px, so it drops into normal flow above the
          headline instead of fighting the badge for the top corners. */}
      <div className="tag-shadow absolute right-6 top-8 z-10 inline-flex items-center gap-2 rounded-full bg-[#fffdf7] px-3.5 py-2 md:px-5 md:py-2.5 md:right-6 md:top-8 lg:right-24 lg:top-10">
        {/* Dot stays static — the shimmer on the label now carries the
            "live status" signal, and two idle animations on one small pill
            compete with each other. */}
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-shimmer text-[13px] font-medium md:text-sm">
          Open to new roles
        </span>
      </div>

      {/* headline */}
      <div
        className="relative z-10 mx-auto md:-mt-[60px]"
        style={{ width: 965, maxWidth: "100%" }}
      >
        <p className="text-center text-[12px] font-medium uppercase tracking-[0.15em] text-[#4d476a] md:text-[14px] md:tracking-[0.2em]">
          Lead Product Designer
          <span className="hidden md:inline"> . </span>
          <br className="md:hidden" />
          Designing digital products since 2020
        </p>

        <h1
          ref={headlineRef}
          className="font-georgia fluid-headline mt-6 text-center font-bold leading-[1.08] text-[#1c1833] md:mt-8 md:text-left"
        >
          Turning{" "}
          <span className="text-gradient-brand font-georgia italic">
            ambiguity
          </span>
          <br />
          into clear product
          <br />
          direction.
        </h1>

        {/* profile photo — anchored a fixed PHOTO_TOP_GAP below the
            headline's real height, not a percentage, so the gap stays the
            same actual size at every screen width instead of stretching or
            shrinking with the box. */}
        <div
          className={
            isMobile
              ? "relative mx-auto mt-10"
              : "absolute right-[4%]"
          }
          style={
            isMobile
              ? {
                  // Same 244:348 proportion and oval frame as desktop — just
                  // centred and sized to sit with the headline rather than
                  // dominate the screen.
                  width: "min(150px, 44%)",
                  aspectRatio: "244 / 348",
                }
              : {
                  width: PHOTO_WIDTH,
                  aspectRatio: "244 / 348",
                  top: photoTop ?? undefined,
                  visibility: photoTop === null ? "hidden" : "visible",
                }
          }
        >
          <GradientFrame
            className="h-full w-full"
            radius="150px"
            padding="1px"
            transparent
            innerClassName="overflow-hidden"
          >
            <img
              src={heroPhoto}
              alt="Marva Abouei"
              className="h-full w-full object-cover"
            />
          </GradientFrame>
        </div>

        <p
          className="fluid-body text-center leading-relaxed text-[#4d476a] md:text-left"
          style={{
            maxWidth: isMobile ? "100%" : TEXT_RESERVE,
            marginTop: "var(--fluid-mt-para)",
          }}
        >
          I shape early ideas into usable products through strategy,
          research, interaction design, and systems thinking. Currently
          leading design at ISM Creative, Vancouver, Canada.
        </p>

        <div
          className="mt-8 flex flex-wrap justify-center gap-2 md:justify-start md:gap-3"
          style={{ maxWidth: isMobile ? "100%" : TEXT_RESERVE }}
        >
          {pills.map((pill) => (
            <span
              key={pill.label}
              className="tag-shadow rounded-full px-4 py-1.5 text-[11px] font-medium text-[#1c1833] md:px-5 md:py-2 md:text-sm"
              style={{ backgroundColor: pill.bg }}
            >
              {pill.label}
            </span>
          ))}
        </div>
      </div>

      <Nav />
    </section>
  );
}
