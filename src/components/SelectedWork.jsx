import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import useMediaQuery, { TOUCH_QUERY } from "../hooks/useMediaQuery";

const stats = [
  { value: "42%", direction: "up", label: "Faster compliance review" },
  { value: "65%", direction: "down", label: "Reduction in risk resolution time" },
];

const projects = [
  {
    id: "02",
    title: "02. Project Name",
    tag: "SaaS",
    tagBg: "#FFE1D6",
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
    tagBg: "#F0E9FF",
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
    tagBg: "#E8FFF6",
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
    tagBg: "#F0E9FF",
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
    { label: "0-to-1", bg: "#E8FFF6" },
    { label: "Systems Thinking", bg: "#E6F6FF" },
  ],
  meshColor: FEATURED_MESH_COLOR,
  meshBlobs: FEATURED_MESH_BLOBS,
  headline: { value: "$2.4M", label: "Estimated annual time savings" },
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
    <div className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
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

function StatRow({ compact }) {
  return (
    <div className={compact ? "mt-4 flex gap-6" : "flex gap-10"}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <p
            className={`flex items-center gap-1 font-semibold text-white ${compact ? "text-lg" : "text-3xl"}`}
          >
            {stat.value}
            <span
              className={
                stat.direction === "up" ? "text-emerald-300" : "text-orange-300"
              }
            >
              {stat.direction === "up" ? "↑" : "↓"}
            </span>
          </p>
          <p className="mt-1 max-w-[9.5rem] text-xs" style={{ color: "#FFF7E8" }}>
            {stat.label}
          </p>
        </div>
      ))}
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

  const goTo = (i) => {
    const el = trackRef.current;
    const first = el?.firstElementChild;
    if (!el || !first) return;
    const step = first.getBoundingClientRect().width + SLIDE_GAP;
    el.scrollTo({ left: i * step, behavior: "smooth" });
  };

  return (
    <div className="md:hidden">
      <div className="mt-8 flex items-end justify-between gap-4">
        <p className="text-[13px] font-medium" style={{ color: "#FFF7E8" }}>
          Swipe through selected work
        </p>
        <p
          aria-live="polite"
          className="shrink-0 text-[13px] font-semibold tabular-nums"
          style={{ color: "#FFFDF7" }}
        >
          {String(slide + 1).padStart(2, "0")} / {String(allProjects.length).padStart(2, "0")}
        </p>
      </div>

      {/* Negative margin + matching padding lets the track run edge to edge
          while the first card still lines up with the section's text. */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar -mx-6 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2"
      >
        {allProjects.map((project, i) => (
          <article
            key={project.id}
            className="w-[78vw] shrink-0 snap-center"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${allProjects.length}: ${project.title}`}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-[#24174A]">
              <CardMesh size={620} color={project.meshColor} blobs={project.meshBlobs} />

              <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span
                    key={t.label}
                    className="tag-shadow rounded-full px-3 py-1 text-[11px] font-medium text-[#1c1833]"
                    style={{ backgroundColor: t.bg }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>

              {/* Metrics live inside the card so each slide carries its own
                  proof, rather than trailing below the fold. */}
              <div className="absolute inset-x-4 bottom-4 z-10 flex flex-wrap items-end gap-x-6 gap-y-2">
                {project.headline && (
                  <div>
                    <p className="text-2xl font-semibold text-white">{project.headline.value}</p>
                    <p className="mt-0.5 max-w-[9rem] text-[11px]" style={{ color: "#FFF7E8" }}>
                      {project.headline.label}
                    </p>
                  </div>
                )}
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="flex items-center gap-1 text-lg font-semibold text-white">
                      {stat.value}
                      <span className={stat.direction === "up" ? "text-emerald-300" : "text-orange-300"}>
                        {stat.direction === "up" ? "\u2191" : "\u2193"}
                      </span>
                    </p>
                    <p className="mt-0.5 max-w-[8.5rem] text-[11px]" style={{ color: "#FFF7E8" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="font-georgia mt-5 text-[24px] font-bold" style={{ color: "#FFFDF7" }}>
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

      {/* Tappable position dots — a second way to move between projects for
          anyone who does not discover the swipe. */}
      <div className="mt-2 flex justify-center gap-2">
        {allProjects.map((project, i) => (
          <button
            key={project.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to project ${i + 1}`}
            aria-current={i === slide}
            className="flex h-11 w-6 items-center justify-center"
          >
            <span
              className="block h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 20 : 6,
                backgroundColor: i === slide ? "#FFFDF7" : "rgba(255,247,232,0.35)",
              }}
            />
          </button>
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
      <div className="mx-auto" style={{ maxWidth: 1232 }}>
        <p
          id="projects"
          className="scroll-mt-8 text-[14px] font-medium uppercase tracking-[0.2em] md:scroll-mt-10"
          style={{ color: "#FFF7E8" }}
        >
          Projects
        </p>
        <h2
          className="font-georgia fluid-section-title mt-3 font-bold"
          style={{ color: "#FFFDF7" }}
        >
          Selected work.
        </h2>
        <p className="mt-3 text-[17px] md:text-[20px]" style={{ color: "#FFF7E8" }}>
          Explore the case studies and strategic thinking behind each key
          decision.
        </p>

        <ProjectCarousel />

        {/* Desktop composition: hero card, then a two-up grid. */}
        <div className="hidden md:block">
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
              <span
                key={tag}
                className="tag-shadow rounded-full px-4 py-1.5 text-xs font-medium text-[#1c1833]"
                style={{ backgroundColor: i === 0 ? "#E8FFF6" : "#E6F6FF" }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="relative z-10 flex flex-wrap gap-10 md:absolute md:bottom-10 md:left-10">
            <StatRow />
            <div>
              <p className="text-3xl font-semibold text-white">$2.4M</p>
              <p className="mt-1 max-w-[8rem] text-xs" style={{ color: "#FFF7E8" }}>
                Estimated annual time savings
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-left">
          <h3 className="font-georgia text-[26px] font-bold md:text-[32px]" style={{ color: "#FFFDF7" }}>
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

                <span
                  className="tag-shadow absolute right-6 top-6 z-10 rounded-full px-4 py-1.5 text-xs font-medium text-[#1c1833]"
                  style={{ backgroundColor: project.tagBg }}
                >
                  {project.tag}
                </span>
              </div>

              <h3
                className="font-georgia mt-6 text-left text-[26px] font-bold md:text-[32px]"
                style={{ color: "#FFFDF7" }}
              >
                {project.title}
              </h3>
              <p className="mt-2 text-left text-[17px] md:text-[20px]" style={{ color: "#FFF7E8" }}>
                Explore the case studies, strategic thinking behind each key
                decision and the business outcome.
              </p>
              <StatRow compact />
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
