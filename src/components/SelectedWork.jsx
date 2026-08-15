import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Pill from "./ui/Pill";
import SectionHeading from "./ui/SectionHeading";
import SlideCounter from "./ui/SlideCounter";
import useMediaQuery, { TOUCH_QUERY } from "../hooks/useMediaQuery";
import { color, pillPalette } from "../styles/tokens";

const projects = [
  {
    id: "02",
    title: "02. Project Name",
    tag: "SaaS",
    tagBg: pillPalette[3],
    meshColor: "#70F2CF",
    meshBlobs: [
      { dx: -0.3, dy: -0.28, scale: 0.95, opacity: 0.55 },
      { dx: 0.28, dy: 0.3, scale: 0.6, opacity: 0.3 },
    ],
  },
  {
    id: "03",
    title: "03. Project Name",
    tag: "B2B2C",
    tagBg: pillPalette[2],
    meshColor: "#8F74FF",
    meshBlobs: [
      { dx: 0.3, dy: -0.25, scale: 0.9, opacity: 0.5 },
      { dx: -0.28, dy: 0.28, scale: 0.65, opacity: 0.3 },
    ],
  },
  {
    id: "04",
    title: "04. Project Name",
    tag: "0-to-1",
    tagBg: pillPalette[0],
    meshColor: "#7DDCFF",
    meshBlobs: [
      { dx: -0.25, dy: 0.3, scale: 0.9, opacity: 0.5 },
      { dx: 0.3, dy: -0.22, scale: 0.6, opacity: 0.3 },
    ],
  },
  {
    id: "05",
    title: "05. Project Name",
    tag: "B2B2C",
    tagBg: pillPalette[2],
    meshColor: "#FF7F6E",
    meshBlobs: [
      { dx: 0.3, dy: 0.22, scale: 0.95, opacity: 0.5 },
      { dx: -0.28, dy: -0.26, scale: 0.65, opacity: 0.3 },
    ],
  },
];

const FEATURED_MESH_COLOR = "#FFE4A8";
const FEATURED_MESH_BLOBS = [
  { dx: -0.28, dy: -0.22, scale: 1, opacity: 0.5 },
  { dx: 0.26, dy: 0.24, scale: 0.7, opacity: 0.3 },
];

const DESCRIPTION =
  "Explore the case studies, strategic thinking behind each key decision and the business outcome.";

// Project 01 is the desktop hero card, laid out separately there. Pulling it
// into data lets the mobile carousel render all five identically.
const featured = {
  id: "01",
  title: "01. Project Name",
  tags: [
    { label: "0-to-1", bg: pillPalette[0] },
    { label: "Systems Thinking", bg: pillPalette[1] },
  ],
  meshColor: FEATURED_MESH_COLOR,
  meshBlobs: FEATURED_MESH_BLOBS,
};

const allProjects = [
  featured,
  ...projects.map((p) => ({
    ...p,
    tags: [{ label: p.tag, bg: p.tagBg }],
  })),
];

const SLIDE_GAP = 16; // px; must match the gap-4 on the track

// Shared card treatment. The cards sit on the same colour as the section, so
// without a stroke their edges are invisible at rest — this defines the shape
// at a low enough contrast to stay quiet, then brightens on hover alongside
// the lift and background shift.
const CARD_HOVER =
  "group border border-white/10 transition duration-500 ease-out hover:-translate-y-1 hover:border-white/25 hover:bg-[#2C1D5C] hover:shadow-[0_18px_44px_rgba(8,4,22,0.5)]";

// Mirrors the hero's rotating mesh — same slow clockwise orbit — just sized
// down to fit inside a project card, with each card getting its own single
// accent color and its own blob arrangement instead of one shared look.
function CardMesh({ size = 260, color, blobs }) {
  return (
    // The hover scale lives on its own wrapper: .mesh-orbit already animates
    // transform (the slow rotate), so a scale set on that same element would
    // just be overridden by the running animation.
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
      <div className="mesh-orbit absolute inset-0">
        {blobs.map((blob, i) => {
          const blobSize = size * blob.scale;
          return (
            <div
              key={i}
              className="mesh-blob-card"
              style={{
                top: "50%",
                left: "50%",
                width: blobSize,
                height: blobSize,
                opacity: blob.opacity,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                transform: `translate(calc(-50% + ${blob.dx * size}px), calc(-50% + ${blob.dy * size}px))`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Mobile presentation of the project list: one horizontally swipeable track
// with scroll-snap, instead of five full-width cards stacked into a very long
// column. Each slide is self-contained — tags and metrics sit inside the card,
// title/description/CTA underneath — so a project reads as one unit.
function ProjectCarousel() {
  const trackRef = useRef(null);
  const [slide, setSlide] = useState(0);

  // Derive the index from scroll position rather than an observer: scroll
  // events are the one signal guaranteed to fire during a real swipe.
  const handleScroll = () => {
    const el = trackRef.current;
    const first = el?.firstElementChild;
    if (!el || !first) return;
    const step = first.getBoundingClientRect().width + SLIDE_GAP;
    const i = Math.round(el.scrollLeft / step);
    setSlide(Math.min(allProjects.length - 1, Math.max(0, i)));
  };

  return (
    <div className="xl:hidden">
      <div className="mt-8 flex items-end justify-between gap-4">
        <p className="text-[13px] font-medium" style={{ color: "#FFF7E8" }}>
          Swipe through selected work
        </p>
        <SlideCounter
          current={slide + 1}
          total={allProjects.length}
          tone="ink"
          className="shrink-0"
        />
      </div>

      {/* Negative margin + matching padding lets the track run edge to edge
          while the first card still lines up with the section's text. */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar -mx-6 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2 md:-mx-24 md:px-24"
      >
        {allProjects.map((project, i) => (
          <article
            key={project.id}
            className="w-[78vw] max-w-[520px] shrink-0 snap-center"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${allProjects.length}: ${project.title}`}
          >
            {/* Square rather than 4:5 — the 4:5 height existed to seat the
                metrics block along the bottom edge. With only the pills left
                in it, that extra height read as an empty well. */}
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#24174A]">
              <CardMesh size={620} color={project.meshColor} blobs={project.meshBlobs} />

              {/* One inline row, flush right. justify-end keeps the group
                  pinned to the right margin, and wrapping only kicks in if a
                  card ever carries more pills than the width allows. */}
              <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap justify-end gap-1.5">
                {project.tags.map((t) => (
                  <Pill
                    key={t.label}
                    bg={t.bg}
                    color={color.textPrimary}
                    className="text-[11px] font-medium"
                  >
                    {t.label}
                  </Pill>
                ))}
              </div>
            </div>

            <h3 className="font-georgia fluid-card-title mt-5 font-bold" style={{ color: "#FFFDF7" }}>
              {project.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "#FFF7E8" }}>
              {DESCRIPTION}
            </p>
            <span
              className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold"
              style={{ color: "#FFFDF7" }}
            >
              View case study
              <span aria-hidden="true">{"\u2192"}</span>
            </span>
          </article>
        ))}
      </div>

    </div>
  );
}

export default function SelectedWork() {
  // The cursor-following pill is the only thing announcing these cards as
  // clickable, and it can never appear on a touch screen. There, each card
  // carries a permanent "View case study" link instead.
  const isTouch = useMediaQuery(TOUCH_QUERY);
  const [hovering, setHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30, mass: 0.5 });

  // Position tracking is scoped to individual cards (only active while the
  // pointer is actually over one), rather than the whole section, so it
  // stays cheap and never fires while just scrolling past the section.
  // Skipped entirely on touch, where none of it can fire usefully.
  const cardHoverProps = isTouch
    ? {}
    : {
        onMouseEnter: () => setHovering(true),
        onMouseMove: (e) => {
          mouseX.set(e.clientX);
          mouseY.set(e.clientY);
        },
        onMouseLeave: () => setHovering(false),
      };

  return (
    <section className="bg-[#24174A] px-6 pb-24 pt-24 text-white md:px-24 md:pb-[200px] md:pt-[200px]">
      <div className="content-container">
        <SectionHeading
          id="projects"
          eyebrow="Projects"
          tone="ink"
          description="Explore the case studies and strategic thinking behind each key decision."
        >
          Selected work.
        </SectionHeading>

        <ProjectCarousel />

        {/* Desktop composition: hero card, then a two-up grid. */}
        <div className="hidden xl:block">
        {/* Featured project */}
        <div
          className={`relative mt-10 overflow-hidden rounded-3xl bg-[#24174A] p-6 md:aspect-auto md:h-[500px] md:cursor-none md:p-10 ${CARD_HOVER}`}
          {...cardHoverProps}
        >
          <CardMesh
            size={1100}
            color={FEATURED_MESH_COLOR}
            blobs={FEATURED_MESH_BLOBS}
          />

          <div className="absolute right-6 top-6 z-10 flex gap-2 md:right-10 md:top-10">
            {["0-to-1", "Systems Thinking"].map((tag, i) => (
              <Pill
                key={tag}
                bg={i === 0 ? pillPalette[0] : pillPalette[1]}
                color={color.textPrimary}
                className="text-xs font-medium"
              >
                {tag}
              </Pill>
            ))}
          </div>

        </div>

        <div className="mt-8 text-left">
          <h3 className="font-georgia fluid-card-title font-bold" style={{ color: "#FFFDF7" }}>
            01. Project Name
          </h3>
          <p className="mt-2 text-[17px] md:text-[20px]" style={{ color: "#FFF7E8" }}>
            Explore the case studies, strategic thinking behind each key
            decision and the business outcome.
          </p>
        </div>

        {/* Grid of remaining projects */}
        <div className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id}>
              <div
                className={`relative overflow-hidden rounded-3xl bg-[#24174A] md:h-[437px] md:cursor-none ${CARD_HOVER}`}
                {...cardHoverProps}
              >
                <CardMesh
                  size={520}
                  color={project.meshColor}
                  blobs={project.meshBlobs}
                />

                <Pill
                  bg={project.tagBg}
                  color={color.textPrimary}
                  className="absolute right-6 top-6 z-10 text-xs font-medium"
                >
                  {project.tag}
                </Pill>
              </div>

              <h3
                className="font-georgia fluid-card-title mt-6 text-left font-bold"
                style={{ color: "#FFFDF7" }}
              >
                {project.title}
              </h3>
              <p className="mt-2 text-left text-[17px] md:text-[20px]" style={{ color: "#FFF7E8" }}>
                Explore the case studies, strategic thinking behind each key
                decision and the business outcome.
              </p>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Custom cursor: a "View Case Study" pill that follows the mouse
          while hovering any project card, replacing the default cursor.
          Its background uses the same animated shifting gradient as the
          "ambiguity" text, so the two feel like the same visual language. */}
      <AnimatePresence>
        {hovering && (
          <motion.div
            className="gradient-border-anim pointer-events-none fixed left-0 top-0 z-50 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold text-[#0b0a14]"
            style={{ x: springX, y: springY }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            View Case Study
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
