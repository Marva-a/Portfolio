import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";

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

export default function SelectedWork() {
  const [hovering, setHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30, mass: 0.5 });

  // Position tracking is scoped to individual cards (only active while the
  // pointer is actually over one), rather than the whole section, so it
  // stays cheap and never fires while just scrolling past the section.
  const cardHoverProps = {
    onMouseEnter: () => setHovering(true),
    onMouseMove: (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    },
    onMouseLeave: () => setHovering(false),
  };

  return (
    <section className="bg-[#24174A] px-6 pb-[200px] pt-[200px] text-white md:px-24">
      <div className="mx-auto" style={{ maxWidth: 1232 }}>
        <p
          id="projects"
          className="scroll-mt-8 text-[14px] font-medium uppercase tracking-[0.2em] md:scroll-mt-10"
          style={{ color: "#FFF7E8" }}
        >
          Projects
        </p>
        <h2
          className="font-georgia mt-3 text-[64px] font-bold"
          style={{ color: "#FFFDF7" }}
        >
          Selected work.
        </h2>
        <p className="mt-3 text-[20px]" style={{ color: "#FFF7E8" }}>
          Explore the case studies and strategic thinking behind each key
          decision.
        </p>

        {/* Featured project */}
        <div
          className={`cursor-none relative mt-10 h-[500px] overflow-hidden rounded-3xl bg-[#24174A] p-6 md:p-10 ${CARD_HOVER}`}
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
          <h3 className="font-georgia text-[32px] font-bold" style={{ color: "#FFFDF7" }}>
            01. Project Name
          </h3>
          <p className="mt-2 text-[20px]" style={{ color: "#FFF7E8" }}>
            Explore the case studies, strategic thinking behind each key
            decision and the business outcome.
          </p>
        </div>

        {/* Grid of remaining projects */}
        <div className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id}>
              <div
                className={`cursor-none relative h-[437px] overflow-hidden rounded-3xl bg-[#24174A] ${CARD_HOVER}`}
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
                className="font-georgia mt-6 text-left text-[32px] font-bold"
                style={{ color: "#FFFDF7" }}
              >
                {project.title}
              </h3>
              <p className="mt-2 text-left text-[20px]" style={{ color: "#FFF7E8" }}>
                Explore the case studies, strategic thinking behind each key
                decision and the business outcome.
              </p>
              <StatRow compact />
            </div>
          ))}
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
