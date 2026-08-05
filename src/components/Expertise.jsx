import { useLayoutEffect, useRef, useState } from "react";

// Reused everywhere on light backgrounds, matching the hero/selected-work
// design system: dark navy for headings, muted purple-gray for body copy.
const DARK = "#1c1833";
const MUTED = "#4d476a";

const PILL_COLORS = ["#E8FFF6", "#E6F6FF", "#F0E9FF", "#FFE1D6"];

// Each of these is an interactive "poster word" — muted by default, and
// styled like "Designing the AI" (gradient, italic) once selected. Picking
// one swaps the pill + description below, the same way the chapter list
// swaps the detail card. Three size steps (32/24/18) keep a visible poster
// rhythm without any of them dropping to an unreadably small size.
const skills = [
  {
    id: "strategy",
    label: "Product strategy & 0→1",
    size: 32,
    weight: "font-bold",
    pill: "Core practice",
    description:
      "I lead ambiguous, greenfield efforts from a blank page to a validated product direction, aligning stakeholders around a clear strategic bet.",
  },
  {
    id: "systems-ux",
    label: "Complex systems UX",
    size: 24,
    weight: "font-semibold",
    pill: "Specialty",
    description:
      "I design for systems with many interdependent parts, making dense workflows feel simple without hiding the complexity users actually need.",
  },
  {
    id: "research",
    label: "User research",
    size: 18,
    weight: "font-medium",
    pill: "Core practice",
    description:
      "I run qualitative and quantitative research to ground decisions in real user behavior, not assumptions.",
  },
  {
    id: "xr",
    label: "XR / spatial",
    size: 32,
    weight: "font-bold",
    pill: "Exploring",
    description:
      "I prototype spatial interfaces and interactions for headsets, translating flat UX patterns into three-dimensional, embodied experiences.",
  },
  {
    id: "ai-product",
    label: "AI product design",
    size: 24,
    weight: "font-semibold",
    pill: "Specialty",
    description:
      "I design product experiences around model behavior — setting expectations, handling uncertainty, and building trust in AI-driven outputs.",
  },
  {
    id: "ui",
    label: "UI & visual design",
    size: 32,
    weight: "font-bold",
    pill: "Core practice",
    description:
      "I craft the visual layer with the same rigor as the strategy behind it — typography, color, and motion in service of clarity.",
  },
  {
    id: "ai-design",
    label: "Designing with AI",
    size: 18,
    weight: "font-medium",
    pill: "Emerging",
    description:
      "I partner with ML engineering to shape core system logic, prompt alignment, and human-in-the-loop feedback to ensure model outputs are accurate and context-aware.",
  },
  {
    id: "designing-the-ai",
    label: "Designing the AI",
    size: 32,
    weight: "font-bold",
    pill: "Vision",
    description:
      "I'm exploring what it means to design the AI itself — not just the interface around it, but its behavior, tone, and judgment as a design surface in its own right.",
  },
];

const skillRows = [
  ["strategy", "systems-ux"],
  ["research", "xr", "ai-product"],
  ["ui", "ai-design"],
  ["designing-the-ai"],
];

const chapters = [
  {
    year: "2006 – 2016",
    title: "01. Artist",
    eyebrow: "Chapter 01",
    heading: "Foundation in form & craft.",
    tags: ["Fine arts", "Sculpture", "Spatial Design"],
    bullets: [
      { icon: "💼", strong: "Sculptor", text: "Group Exhibitions & Independent Commissions" },
      { icon: "🎨", strong: "Art Teacher", text: "Mentoring & Creative Direction" },
      { icon: "🎓", strong: "BA in Fine Arts (Sculpture)", text: "Art University of Tehran" },
    ],
  },
  {
    year: "2016 – 2019",
    title: "02. Game Designer",
    eyebrow: "Chapter 02",
    heading: "Systems & interactive storytelling.",
    tags: ["Game Design", "Prototyping"],
    bullets: [
      { icon: "💼", strong: "Level Designer", text: "Independent Studio" },
      { icon: "🕹️", strong: "Narrative Systems", text: "Interactive Storytelling" },
    ],
  },
  {
    year: "2019 – 2024",
    title: "03. HCI & UX/UI Designer",
    eyebrow: "Chapter 03",
    heading: "Human-centered systems thinking.",
    tags: ["UX Research", "Interaction Design"],
    bullets: [
      { icon: "💼", strong: "UX Designer", text: "Enterprise SaaS" },
      { icon: "🎓", strong: "MA in Human-Computer Interaction", text: "" },
    ],
  },
  {
    year: "2024 – Present",
    title: "04. Lead Product Designer",
    eyebrow: "Chapter 04",
    heading: "Leading 0→1 product direction.",
    tags: ["0 to 1", "AI Product Design", "Leadership"],
    bullets: [
      { icon: "💼", strong: "Lead Product Designer", text: "IBM Creative" },
      { icon: "🧭", strong: "Product Strategy", text: "Across cross-functional teams" },
    ],
  },
];

// Dot size and its horizontal center — both the base line and the
// gradient progress line are positioned against DOT_CENTER, so the line
// always runs exactly through the middle of every circle. LINE_WIDTH is
// shared by the line and the dot rings so the stroke reads as one
// consistent weight throughout the timeline.
const DOT_SIZE = 20;
const DOT_CENTER = DOT_SIZE / 2;
const LINE_WIDTH = 3;

export default function Expertise() {
  const [active, setActive] = useState(0);
  const chapter = chapters[active];
  const [activeSkillId, setActiveSkillId] = useState("ai-design");
  const activeSkill = skills.find((s) => s.id === activeSkillId);

  const timelineRef = useRef(null);
  const dotRefs = useRef([]);
  const [progressHeight, setProgressHeight] = useState(0);

  useLayoutEffect(() => {
    const container = timelineRef.current;
    const dot = dotRefs.current[active];
    if (!container || !dot) return;
    const containerTop = container.getBoundingClientRect().top;
    const dotRect = dot.getBoundingClientRect();
    setProgressHeight(dotRect.top + dotRect.height / 2 - containerTop);
  }, [active]);

  return (
    <section className="relative overflow-clip px-6 pb-[200px] pt-[200px] md:px-24">
      {/* Same mesh-blob look as the hero, but with a much quieter motion —
          a few px of side-to-side sway rather than the hero's rotation —
          since this section shouldn't compete for attention. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="mesh-blob mesh-sway mesh-purple"
          style={{ top: "55%", left: "-8%", width: 680, height: 680 }}
        />
        <div
          className="mesh-blob mesh-sway mesh-yellow"
          style={{ top: "-10%", right: "-6%", width: 680, height: 680, animationDelay: "-4s" }}
        />
        <div
          className="mesh-blob mesh-sway mesh-teal"
          style={{ bottom: "-15%", left: "35%", width: 660, height: 660, animationDelay: "-9s" }}
        />
      </div>

      <div className="relative z-10 mx-auto" style={{ maxWidth: 1232 }}>
        <p
          id="expertise"
          className="scroll-mt-8 text-[14px] font-medium uppercase tracking-[0.2em] md:scroll-mt-10"
          style={{ color: MUTED }}
        >
          Expertise
        </p>
        <h2
          className="font-georgia mt-3 text-[64px] font-bold"
          style={{ color: DARK }}
        >
          A poster of what I do.
        </h2>
        <p className="mt-3 text-[20px]" style={{ color: MUTED }}>
          Shaped by 6+ years of experience across creative agencies, design
          consultancies, startups, established organizations, and in-house
          product teams.
        </p>

        {/* Type poster — a loose collage of phrases at varying weights and
            sizes, all drawn from the same design tokens used in the hero
            and selected-work sections rather than one-off values. Every
            phrase (including "Designing the AI") is muted by default and
            only picks up the gradient-italic treatment once selected,
            which also swaps the pill + description below. */}
        <div className="mt-14">
          {skillRows.map((rowIds, ri) => (
            <div
              key={ri}
              className={`flex flex-wrap items-baseline gap-x-4 gap-y-2 ${ri > 0 ? "mt-3" : ""}`}
            >
              {rowIds.map((id) => {
                const skill = skills.find((s) => s.id === id);
                const isActive = id === activeSkillId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSkillId(id)}
                    className={`font-georgia ${skill.weight} transition-colors ${
                      isActive ? "text-gradient-brand italic" : "skill-word"
                    }`}
                    style={{ fontSize: skill.size }}
                  >
                    {skill.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div
          className="mt-8 border-t"
          style={{ borderColor: "rgba(28,24,51,0.1)" }}
        />

        <span
          className="tag-shadow mt-8 inline-block rounded-full px-4 py-1.5 text-sm font-medium"
          style={{ backgroundColor: "#F0E9FF", color: DARK }}
        >
          {activeSkill.pill}
        </span>
        <p className="mt-4 text-[20px]" style={{ color: MUTED }}>
          {activeSkill.description}
        </p>

        {/* Career journey */}
        <div className="mt-[100px]">
          <h3 className="font-georgia text-[40px] font-bold" style={{ color: DARK }}>
            My career journey in four chapters.
          </h3>
          <p className="mt-3 text-[20px]" style={{ color: MUTED }}>
            Click a chapter to explore my journey and the strengths it gave
            me, a multidisciplinary arc bridging fine arts, strategy, and
            complex systems.
          </p>

          <div className="mt-10 grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <ul ref={timelineRef} className="relative">
              {/* base line, running the full height of the list */}
              <div
                className="absolute top-0 bottom-0 rounded-full"
                style={{
                  left: DOT_CENTER - LINE_WIDTH / 2,
                  width: LINE_WIDTH,
                  backgroundColor: "rgba(28,24,51,0.15)",
                }}
              />
              {/* gradient line covering everything up to the selected chapter */}
              <div
                className="timeline-progress absolute top-0 rounded-full transition-all duration-300"
                style={{
                  left: DOT_CENTER - LINE_WIDTH / 2,
                  width: LINE_WIDTH,
                  height: progressHeight,
                }}
              />

              {chapters.map((c, i) => (
                <li key={c.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className="flex w-full flex-col gap-1 py-4 text-left transition"
                  >
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: MUTED, paddingLeft: DOT_SIZE + 16 }}
                    >
                      {c.year}
                    </span>
                    {/* dot sits in-flow next to the title so it's vertically
                        centered against it, not the shorter year line above */}
                    <span className="flex items-center gap-4">
                      <span
                        ref={(el) => (dotRefs.current[i] = el)}
                        className={
                          active === i
                            ? "gradient-border-anim relative shrink-0 rounded-full"
                            : "relative shrink-0 rounded-full bg-[#fffdf7]"
                        }
                        style={{
                          width: DOT_SIZE,
                          height: DOT_SIZE,
                          ...(active === i
                            ? { padding: LINE_WIDTH }
                            : { border: `${LINE_WIDTH}px solid rgba(28,24,51,0.2)` }),
                        }}
                      >
                        {active === i && (
                          <span className="block h-full w-full rounded-full bg-[#fffdf7]" />
                        )}
                      </span>
                      <span
                        className={`font-georgia text-[32px] font-bold transition-colors ${
                          active === i ? "text-gradient-brand italic" : "skill-word"
                        }`}
                      >
                        {c.title}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="tag-shadow rounded-3xl bg-[#fffdf7] p-8">
              <p
                className="text-[14px] font-medium uppercase tracking-[0.2em]"
                style={{ color: MUTED }}
              >
                {chapter.eyebrow}
              </p>
              <h4
                className="font-georgia mt-3 text-[40px] font-bold"
                style={{ color: DARK }}
              >
                {chapter.heading}
              </h4>

              <div className="mt-5 flex flex-wrap gap-2">
                {chapter.tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="tag-shadow rounded-full px-4 py-1.5 text-sm font-medium"
                    style={{
                      backgroundColor: PILL_COLORS[i % PILL_COLORS.length],
                      color: DARK,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                className="mt-6 border-t"
                style={{ borderColor: "rgba(28,24,51,0.1)" }}
              />

              <ul className="mt-6 space-y-3 text-left">
                {chapter.bullets.map((bullet) => (
                  <li
                    key={bullet.strong}
                    className="flex items-start gap-3 text-[18px]"
                    style={{ color: MUTED }}
                  >
                    <span aria-hidden="true">{bullet.icon}</span>
                    <span>
                      <span className="font-semibold" style={{ color: DARK }}>
                        {bullet.strong}
                      </span>
                      {bullet.text && <> . {bullet.text}</>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
