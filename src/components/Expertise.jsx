import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useMediaQuery, { MOBILE_QUERY } from "../hooks/useMediaQuery";
import GradientFrame from "./GradientFrame";

// Reused everywhere on light backgrounds, matching the hero/selected-work
// design system: dark navy for headings, muted purple-gray for body copy.
const DARK = "#1c1833";
const MUTED = "#4d476a";
// A touch darker than MUTED, for descriptive copy that needs to hold up
// against the career journey card's mesh blobs (the pale washes of color
// eat into MUTED's contrast more than they do on a flat cream background).
const MUTED_STRONG = "#38324f";

const PILL_COLORS = ["#E8FFF6", "#E6F6FF", "#F0E9FF", "#FFE1D6"];

const MESH_CARD_COLORS = ["mesh-purple", "mesh-teal", "mesh-yellow"];

// Opposite-corner anchors, not independently-random positions — two blobs
// placed by unrelated formulas can land almost on top of each other and
// hide one color entirely. Pinning them to diagonally opposite quadrants
// (with a little per-index jitter) guarantees they stay apart, even though
// their blurred edges are still free to blend near the card's center.
const MESH_QUADRANTS = [
  { top: 0, left: 0 },
  { top: 0, left: 55 },
  { top: 50, left: 0 },
  { top: 50, left: 55 },
];

// Each open card gets a two-blob arrangement. Deterministic (not
// Math.random) so a card's blobs don't jump around on re-render. The second
// blob is always half the size of the first, for a clear big/small pairing
// rather than two same-scale shapes. `scale` lets bigger cards (the career
// journey panel) use proportionally bigger blobs than the expertise cards.
//
// `layout` separates *where* the blobs sit from *which colors* they are.
// Left alone it falls back to `index`, giving each card its own corner and
// size — the varied look the expertise accordion still uses. Passing a fixed
// value instead pins every card to one composition while the palette keeps
// rotating, which is what the career journey carousel wants: swiping between
// chapters should change the color, not shuffle the layout underfoot.
function cardMeshBlobs(index, scale = 1, layout = index) {
  const primarySize = (160 + ((layout * 17) % 3) * 20) * scale;
  const jitterTop = (layout * 7) % 15;
  const jitterLeft = (layout * 11) % 15;
  const q1 = MESH_QUADRANTS[layout % MESH_QUADRANTS.length];
  const q2 = MESH_QUADRANTS[(layout + 2) % MESH_QUADRANTS.length];
  return [
    {
      color: MESH_CARD_COLORS[index % MESH_CARD_COLORS.length],
      top: `${q1.top + jitterTop}%`,
      left: `${q1.left + jitterLeft}%`,
      size: primarySize,
      anim: layout % 2 === 0 ? "mesh-sway" : "mesh-float",
      delay: `-${index}s`,
    },
    {
      color: MESH_CARD_COLORS[(index + 1) % MESH_CARD_COLORS.length],
      top: `${q2.top + jitterLeft}%`,
      left: `${q2.left + jitterTop}%`,
      size: primarySize / 2,
      anim: layout % 2 === 0 ? "mesh-float" : "mesh-sway",
      delay: `-${index * 2}s`,
    },
  ];
}

// Chapter 03's arrangement — big blob low-left, small one high-left — which
// is the composition the career cards standardize on.
const CAREER_BLOB_LAYOUT = 2;

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
    pill: "Strategy",
    description:
      "I frame MVPs, scope features, and manage the strategic trade-offs required to take an intricate business idea from early discovery to a successful market launch.",
  },
  {
    id: "systems-ux",
    label: "Complex systems UX",
    size: 24,
    weight: "font-semibold",
    pill: "Systems",
    description:
      "I design intuitive flows and data-heavy systems that translate highly complex, regulated business logic into understandable and actionable user experiences.",
  },
  {
    id: "ai-product",
    label: "AI product design",
    size: 24,
    weight: "font-semibold",
    pill: "Emerging",
    description:
      "I shape how humans collaborate with intelligent systems, balancing transparency, agentic control, and seamless fallback states so users always feel secure and in charge.",
  },
  {
    id: "xr",
    label: "XR / spatial",
    size: 32,
    weight: "font-bold",
    pill: "Emerging",
    description:
      "I design immersive VR and AR interactions, focusing deeply on spatial clarity, ergonomic comfort, intentional object physics, and intuitive user onboarding.",
  },
  {
    id: "research",
    label: "User research",
    size: 18,
    weight: "font-medium",
    pill: "Research",
    description:
      "I utilize targeted heuristics, user interviews, A/B testing, and usability testing to de-risk product decisions early and ground my design iterations in real user data.",
  },
  {
    id: "ui",
    label: "UI & visual design",
    size: 32,
    weight: "font-bold",
    pill: "Craft",
    description:
      "I bring a fine-arts perspective to digital products by applying precise composition, spatial harmony, and visual polish to elevate functional layouts into elegant interfaces.",
  },
  {
    id: "ai-design",
    label: "Designing with AI",
    size: 18,
    weight: "font-medium",
    pill: "Efficiency",
    description:
      "I blend automated tooling with human intuition, leveraging platforms like Dovetail, Lovable, and Cursor to accelerate my research and execution so I can focus on deep strategy.",
  },
  {
    id: "designing-the-ai",
    label: "Designing the AI",
    size: 32,
    weight: "font-bold",
    pill: "Emerging",
    description:
      "I partner with ML engineering to shape core system logic, prompt alignment, and human-in-the-loop feedback to ensure model outputs are accurate and context-aware.",
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
    heading: "Immersive worlds & rule systems.",
    tags: ["Game Design", "3D Art", "Psychology"],
    bullets: [
      { icon: "💼", strong: "2D / 3D Digital Artist", text: "Game & Animation Studios" },
      { icon: "🎓", strong: "MSc in Game Design", text: "Uppsala University, Sweden" },
    ],
  },
  {
    year: "2019 – 2024",
    title: "03. HCI & UX/UI Designer",
    eyebrow: "Chapter 03",
    heading: "Humanizing complex technology.",
    tags: ["HCI Research", "Cognitive Psychology"],
    bullets: [
      { icon: "💼", strong: "UX/UI Designer", text: "ISM Creative & Harmony Group" },
      { icon: "🎓", strong: "MSc in Human-Computer Interaction", text: "Uppsala University" },
    ],
  },
  {
    year: "2024 – Present",
    title: "04. Lead Product Designer",
    eyebrow: "Chapter 04",
    heading: "Strategic product vision.",
    tags: ["Product Strategy", "AI Design"],
    bullets: [
      { icon: "💼", strong: "Lead Product Designer", text: "ISM Creative" },
      { icon: "🖥️", strong: "Mentor", text: "Startup Accelerator Cohorts" },
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

const CHAPTER_TRACK_ID = "career-chapter-track";

// Chapter titles carry their own "01. " prefix for the desktop timeline;
// mobile's card headings drop it since the eyebrow already reads "Chapter 0X".
const chapterName = (title) => title.replace(/^\d+\.\s*/, "");

// One consistent line-icon style for the mobile career card's bullets,
// swapped in for the emoji used on desktop — same stroke weight and size
// across work/education/mentor entries instead of mismatched emoji glyphs.
// Keyed by the emoji already stored per bullet, so the shared `chapters`
// data (still read directly by desktop's ChapterCard) doesn't need a
// second, parallel field.
const BULLET_ICON_PATHS = {
  "💼": (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </>
  ),
  "🎨": (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.9 1.1-1.9-.3-.6-.1-1.3.5-1.6.4-.2.9-.2 1.3 0 1 .5 2.1.2 2.6-.8.3-.6.5-1.3.5-2.1C18 8.6 15.5 3 12 3Z" />
      <circle cx="7.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  "🎓": (
    <>
      <path d="M2 9l10-5 10 5-10 5-10-5Z" />
      <path d="M6 11v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
      <path d="M22 9v6" />
    </>
  ),
  "🖥️": (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </>
  ),
};

function BulletIcon({ emoji, className }) {
  const paths = BULLET_ICON_PATHS[emoji];
  if (!paths) return null;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: MUTED }}
      className={className}
    >
      {paths}
    </svg>
  );
}

// The chapter detail, sitting in the desktop timeline's second column.
// Mobile renders its own paginated variant instead.
function ChapterCard({ chapter }) {
  return (
    <div className="tag-shadow rounded-3xl bg-[#fffdf7] p-6 md:p-8">
        <p
          className="text-[14px] font-medium uppercase tracking-[0.2em]"
          style={{ color: MUTED }}
        >
          {chapter.eyebrow}
        </p>
        {/* Card title, so .fluid-card-title — this was on
            .fluid-subsection-title, which made it exactly as large as the
            "My career journey in four chapters." heading it sits under. */}
        <h4
          className="font-georgia fluid-card-title mt-3 font-bold"
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
  );
}

export default function Expertise() {
  // Mobile swaps the two-column timeline for a horizontal dot timeline plus
  // a swipeable card track, both driven by the same `active` index.
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [active, setActive] = useState(0);
  const chapter = chapters[active];
  const chapterTrackRef = useRef(null);
  // One entry per card, filled in via each <article>'s ref callback. Using
  // the cards' own real rendered positions (instead of computing an assumed
  // "step" from one card's width + a gap constant) is what actually fixes
  // the misalignment — the padding/gap math was an approximation that drifted
  // at the edges, where the browser has no room to fully honor it.
  const chapterCardRefs = useRef([]);

  // Scroll offset that centres card `i` in the track's own viewport. Every
  // card centres — including the first and last, which is possible because
  // the track's px-6 padding is exactly the half-gutter a centred card
  // needs ((clientWidth - cardWidth) / 2 === 24), so the required offsets
  // for card 1 and card 4 land precisely on 0 and maxScroll.
  //
  // Measured from getBoundingClientRect rather than offsetLeft: offsetLeft
  // is relative to the nearest *positioned* ancestor, which here is the
  // <section>, not the track — using it would offset every card by the
  // section's own page position.
  const chapterScrollTarget = (el, card) => {
    const delta = card.getBoundingClientRect().left - el.getBoundingClientRect().left;
    const centred = el.scrollLeft + delta - (el.clientWidth - card.offsetWidth) / 2;
    // Clamped so the ends can't request an unreachable offset and leave the
    // browser parked mid-gap.
    return Math.max(0, Math.min(centred, el.scrollWidth - el.clientWidth));
  };

  // Derived from scroll position rather than an observer — scroll is the
  // one event guaranteed to fire during a real swipe. Picks the card whose
  // centre is nearest the track's centre, matching how the cards snap.
  const handleChapterScroll = () => {
    const el = chapterTrackRef.current;
    if (!el) return;
    const trackRect = el.getBoundingClientRect();
    const trackCentre = trackRect.left + trackRect.width / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;
    chapterCardRefs.current.forEach((card, i) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const distance = Math.abs(r.left + r.width / 2 - trackCentre);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    });
    setActive(bestIndex);
  };

  const goToChapter = (i) => {
    const el = chapterTrackRef.current;
    const card = chapterCardRefs.current[i];
    if (!el || !card) return;
    // scrollTo on the track itself — never card.scrollIntoView(), which
    // walks every scrollable ancestor including the page and would scroll
    // the page vertically to fit a tall card, cropping its top or bottom.
    el.scrollTo({ left: chapterScrollTarget(el, card), behavior: "smooth" });
    // Setting `active` here too (in addition to the scroll) raced against
    // handleChapterScroll — the smooth-scroll animation fires its own
    // onScroll events with intermediate positions, which round to the old
    // index and can stomp this call's target right after it's set. Letting
    // the scroll settle and handleChapterScroll derive the final `active`
    // is the same single-source-of-truth pattern the projects carousel
    // uses, and it doesn't have this bug.
  };

  // Belt-and-suspenders: some browsers throttle/coalesce 'scroll' events
  // during a long smooth-scroll animation, so the very last one doesn't
  // always land exactly on the settled position. 'scrollend' fires once,
  // after the scroll (swipe or programmatic) has fully settled, and
  // re-derives `active` from the final position as a correction.
  useEffect(() => {
    const el = chapterTrackRef.current;
    if (!el) return undefined;
    el.addEventListener("scrollend", handleChapterScroll);
    return () => el.removeEventListener("scrollend", handleChapterScroll);
  });
  // "Designing the AI" — the poster's headline idea — is the one selected on
  // load. Note the near-identical "ai-design" ("Designing with AI") id above.
  const [activeSkillId, setActiveSkillId] = useState("designing-the-ai");
  const activeSkill = skills.find((s) => s.id === activeSkillId);
  // Mobile-only accordion state, independent of the desktop poster's
  // activeSkillId. -1 means every row is collapsed, which is the starting
  // state: the list reads as a scannable index of all six skills, and the
  // visitor opens whichever ones they care about.
  const [openSkillIndex, setOpenSkillIndex] = useState(-1);

  const timelineRef = useRef(null);
  const dotRefs = useRef([]);
  const [progressHeight, setProgressHeight] = useState(0);

  // isMobile is a dependency because the desktop timeline is unmounted below
  // 768px — the dots have to be remeasured once it comes back.
  useLayoutEffect(() => {
    const container = timelineRef.current;
    const dot = dotRefs.current[active];
    if (!container || !dot) return;
    const containerTop = container.getBoundingClientRect().top;
    const dotRect = dot.getBoundingClientRect();
    setProgressHeight(dotRect.top + dotRect.height / 2 - containerTop);
  }, [active, isMobile]);

  return (
    <section className="relative overflow-clip px-6 pb-24 pt-24 md:px-24 md:pb-[200px] md:pt-[200px]">
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
        {/* Two headings, swapped by breakpoint via display:none rather than
            JS — the hidden one is removed from the accessibility tree, so
            assistive tech only ever reads the version that's on screen. */}
        <h2
          className="font-georgia fluid-section-title mt-3 hidden font-bold md:block"
          style={{ color: DARK }}
        >
          A poster of what I do.
        </h2>
        <h2
          className="font-georgia fluid-section-title mt-3 font-bold md:hidden"
          style={{ color: DARK }}
        >
          What I do.
        </h2>
        <p className="mt-3 text-[17px] md:text-[20px]" style={{ color: MUTED }}>
          Shaped by 6+ years of experience across creative agencies, design
          consultancies, startups, established organizations, and in-house
          product teams.
        </p>

        {/* Type poster — a loose collage of phrases at varying weights and
            sizes, all drawn from the same design tokens used in the hero
            and selected-work sections rather than one-off values. Every
            phrase (including "Designing the AI") is muted by default and
            only picks up the gradient-italic treatment once selected,
            which also swaps the pill + description below. Desktop/tablet
            only — below 768px this is replaced by the numbered accordion. */}
        <div className="mt-10 hidden md:mt-14 md:block">
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
                    aria-pressed={isActive}
                    className={`font-georgia py-0.5 text-left ${skill.weight} transition-colors ${
                      isActive ? "text-gradient-brand italic" : "skill-word"
                    }`}
                    // Poster sizes are a desktop composition — the 18px tier
                    // is below comfortable reading and tapping on a phone, so
                    // the range compresses to 20–26px there.
                    style={{
                      fontSize: `clamp(${Math.max(Math.round(skill.size * 0.78), 16)}px, ${skill.size / 5}vw, ${skill.size}px)`,
                    }}
                  >
                    {skill.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div
          className="mt-8 hidden border-t md:block"
          style={{ borderColor: "rgba(28,24,51,0.1)" }}
        />

        <span
          className="tag-shadow mt-8 hidden rounded-full px-4 py-1.5 text-sm font-medium md:inline-block"
          style={{ backgroundColor: "#F0E9FF", color: DARK }}
        >
          {activeSkill.pill}
        </span>
        <p
          className="mt-4 hidden text-[17px] md:block md:text-[20px]"
          style={{ color: MUTED }}
        >
          {activeSkill.description}
        </p>

        {/* Numbered editorial accordion — mobile only. Reuses the same
            `skills` data as the desktop poster; only the presentation
            differs (one open row at a time instead of a poster + swapped
            detail card). */}
        <div className="mt-10 md:hidden">
          {skills.map((skill, i) => {
            const isOpen = i === openSkillIndex;
            const headerId = `expertise-header-${skill.id}`;
            const panelId = `expertise-panel-${skill.id}`;
            const number = String(i + 1).padStart(2, "0");

            if (isOpen) {
              // Open row and its detail merge into one unified rounded
              // card — header and content share the same card background,
              // ringed by a 1px gradient stroke (the same padding-box trick
              // as the nav pill and hero avatar) instead of a left accent bar.
              return (
                <div key={skill.id} className="relative my-3 first:mt-0">
                  <GradientFrame radius="28px" padding="1px" transparent>
                    <div
                      className="tag-shadow relative overflow-hidden rounded-[28px]"
                      style={{ backgroundColor: "#FFFDF7" }}
                    >
                      <div className="pointer-events-none absolute inset-0">
                        {cardMeshBlobs(i).map((blob, bi) => (
                          <div
                            key={bi}
                            className={`mesh-blob-card ${blob.anim} ${blob.color}`}
                            style={{
                              top: blob.top,
                              left: blob.left,
                              width: blob.size,
                              height: blob.size,
                              animationDelay: blob.delay,
                            }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        id={headerId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenSkillIndex(-1)}
                        className="relative flex w-full items-center justify-between gap-4 px-6 pb-4 pt-5 text-left"
                      >
                        <span className="flex items-baseline gap-3">
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: MUTED }}
                          >
                            {number}
                          </span>
                          <span
                            className="font-georgia fluid-card-title font-bold"
                            style={{ color: DARK }}
                          >
                            {skill.label}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15px] leading-none"
                          style={{
                            border: "1px solid rgba(28,24,51,0.2)",
                            color: DARK,
                          }}
                        >
                          −
                        </span>
                      </button>

                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={headerId}
                        className="reveal-panel relative px-6 pb-6"
                      >
                        <span
                          className="tag-shadow inline-block rounded-full px-4 py-1.5 text-sm font-medium"
                          style={{ backgroundColor: "#F0E9FF", color: DARK }}
                        >
                          {skill.pill}
                        </span>
                        <p className="mt-3 text-[16px]" style={{ color: MUTED }}>
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  </GradientFrame>
                </div>
              );
            }

            return (
              <button
                key={skill.id}
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenSkillIndex(i)}
                className="flex w-full items-center justify-between gap-4 border-b py-4 text-left"
                style={{ borderColor: "rgba(28,24,51,0.1)" }}
              >
                <span className="flex items-baseline gap-3">
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: MUTED }}
                  >
                    {number}
                  </span>
                  <span
                    className="font-georgia fluid-card-title font-bold"
                    style={{ color: DARK }}
                  >
                    {skill.label}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15px] leading-none"
                  style={{
                    border: "1px solid rgba(28,24,51,0.2)",
                    color: DARK,
                  }}
                >
                  +
                </span>
              </button>
            );
          })}
        </div>

        {/* Career journey */}
        <div className="mt-20 md:mt-[100px]">
          <h3 className="font-georgia fluid-subsection-title font-bold" style={{ color: DARK }}>
            My career journey in four chapters.
          </h3>
          <p className="mt-3 hidden text-[20px] md:block" style={{ color: MUTED }}>
            Click a chapter to explore my journey and the strengths it gave
            me, a multidisciplinary arc bridging fine arts, strategy, and
            complex systems.
          </p>
          <p className="mt-3 text-[17px] md:hidden" style={{ color: MUTED }}>
            Explore my journey and the strengths each chapter gave me, a
            multidisciplinary arc bridging fine arts, strategy, and complex
            systems.
          </p>

          {isMobile ? (
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium" style={{ color: MUTED }}>
                  Swipe through the chapters
                </p>
                <p
                  aria-live="polite"
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: DARK }}
                >
                  {String(active + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
                </p>
              </div>

              {/* Negative margin + matching padding lets the track run edge
                  to edge while the first card still lines up with the
                  section's text, same trick as the projects carousel.
                  overflow-x-auto forces overflow-y to auto too (a CSS
                  quirk), which was clipping the cards' box-shadow at the
                  top/bottom edges — the extra vertical padding gives the
                  shadow room to render before that clipping edge. */}
              <div
                ref={chapterTrackRef}
                id={CHAPTER_TRACK_ID}
                onScroll={handleChapterScroll}
                // px-6 is doing double duty: it's the section's own margin,
                // AND it's exactly the half-gutter a centred card needs, so
                // the first and last cards can sit dead-centre instead of
                // being clamped short. Symmetric scroll-padding would cancel
                // out under centre snapping, so none is set.
                className="no-scrollbar -mx-6 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-8 pt-3"
              >
                {chapters.map((c, i) => {
                  const isActive = i === active;
                  return (
                    <article
                      key={c.title}
                      // Block body, not a concise arrow: React 19 treats a
                      // returned value from a ref callback as a cleanup
                      // function, and an assignment expression returns the
                      // element.
                      ref={(el) => {
                        chapterCardRefs.current[i] = el;
                      }}
                      // w-full, not a vw width: as a non-shrinking flex item
                      // this resolves to the track's *content-box* width
                      // (viewport minus the px-6 gutters), so the card is
                      // derived from the container and can never exceed it.
                      // snap-center on every card — one consistent rule, so
                      // the browser's snap position and the JS scroll target
                      // agree and can't leave the viewport parked in a gap.
                      className="relative flex w-full shrink-0 snap-center"
                      aria-roledescription="slide"
                      aria-label={`${i + 1} of ${chapters.length}: ${chapterName(c.title)}`}
                    >
                      {/* Shadow lives on this wrapper, not the clipped one
                          below — overflow-hidden on the same element that
                          casts tag-shadow would crop the shadow itself.
                          Non-active cards are also the tap target for the
                          peeking-edge "tap to advance" affordance. flex +
                          flex-1 all the way down (plus the spacer before the
                          nav row) is what makes every card the same height
                          regardless of how much bullet copy it holds. */}
                      <div
                        role={isActive ? undefined : "button"}
                        tabIndex={isActive ? undefined : 0}
                        onClick={isActive ? undefined : () => goToChapter(i)}
                        onKeyDown={
                          isActive
                            ? undefined
                            : (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  goToChapter(i);
                                }
                              }
                        }
                        aria-label={isActive ? undefined : `Go to chapter ${i + 1}: ${chapterName(c.title)}`}
                        className="tag-shadow relative flex w-full flex-col rounded-3xl"
                        style={{ backgroundColor: "#fffdf7" }}
                      >
                        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl">
                          <div className="pointer-events-none absolute inset-0">
                            {/* 3.9 = the previous 1.3, tripled. The blobs now
                                run wider than the card itself and are clipped
                                by the rounded wrapper, which is the point:
                                they read as a soft colour wash behind the
                                content rather than as discrete shapes. */}
                            {cardMeshBlobs(i, 3.9, CAREER_BLOB_LAYOUT).map((blob, bi) => (
                              <div
                                key={bi}
                                className={`mesh-blob-card ${blob.anim} ${blob.color}`}
                                style={{
                                  top: blob.top,
                                  left: blob.left,
                                  width: blob.size,
                                  height: blob.size,
                                  animationDelay: blob.delay,
                                }}
                              />
                            ))}
                          </div>
                          <div className="relative flex flex-1 flex-col px-6 pb-6 pt-7">
                            <p
                              className="text-[12px] font-medium uppercase tracking-[0.2em]"
                              style={{ color: MUTED }}
                            >
                              {c.eyebrow} · {c.year}
                            </p>
                            <h4
                              className="font-georgia fluid-card-title mt-[30px] font-bold leading-tight"
                              style={{ color: DARK }}
                            >
                              {chapterName(c.title)}
                            </h4>
                            <p
                              // Deck under the chapter title. Sans, matching
                              // the role headings ("Sculptor") further down
                              // the card — the serif made it read as a second
                              // heading competing with the title above it.
                              // Weight and colour stay lighter than those
                              // headings so it still reads as supporting copy.
                              // No md: variant needed: this whole card only
                              // renders under `isMobile`.
                              className="mt-[9px] text-[16px] leading-snug"
                              style={{ color: MUTED_STRONG }}
                            >
                              {c.heading}
                            </p>

                            <div className="mt-[24px] flex flex-wrap gap-1.5">
                              {c.tags.map((tag, ti) => (
                                <span
                                  key={tag}
                                  className="rounded-full px-2.5 py-1 text-[12px] font-medium"
                                  style={{
                                    backgroundColor: PILL_COLORS[ti % PILL_COLORS.length],
                                    color: DARK,
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div
                              className="mt-[28px] border-t"
                              style={{ borderColor: "rgba(28,24,51,0.1)" }}
                            />

                            <ul className="mt-[32px] space-y-4">
                              {c.bullets.map((bullet) => (
                                <li key={bullet.strong} className="flex items-start gap-3">
                                  <BulletIcon
                                    emoji={bullet.icon}
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                  />
                                  <span className="min-w-0" style={{ color: MUTED }}>
                                    <span
                                      className="block text-[16px] font-semibold md:text-[18px]"
                                      style={{ color: DARK }}
                                    >
                                      {bullet.strong}
                                    </span>
                                    {bullet.text && (
                                      <span
                                        className="mt-[8px] block text-[14px] md:text-[16px]"
                                        style={{ color: MUTED_STRONG }}
                                      >
                                        {bullet.text}
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            {/* Grows to absorb whatever's left, so the nav
                                row below lands at the same height on every
                                card no matter how many bullets it has. */}
                            <div className="flex-1" />

                            <div className="mt-6 flex items-center justify-between gap-3 pt-5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  // Buttons live inside the non-active
                                  // card's own "tap to advance" wrapper —
                                  // without this, a click here would bubble
                                  // up and also fire that wrapper's
                                  // onClick, jumping to the wrong chapter.
                                  e.stopPropagation();
                                  goToChapter(active - 1);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                disabled={active === 0}
                                aria-controls={CHAPTER_TRACK_ID}
                                className="shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[12px] font-medium disabled:opacity-40"
                                style={{ border: "1px solid rgba(28,24,51,0.12)", color: MUTED }}
                              >
                                ← Previous
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToChapter(active + 1);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                disabled={active === chapters.length - 1}
                                aria-controls={CHAPTER_TRACK_ID}
                                // Same outlined treatment as Previous — the
                                // pair reads as one control, rather than Next
                                // looking like the card's primary action.
                                className="shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[12px] font-medium disabled:opacity-40"
                                style={{ border: "1px solid rgba(28,24,51,0.12)", color: MUTED }}
                              >
                                Next →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

            </div>
          ) : (
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
                        className={`font-georgia fluid-card-title font-bold transition-colors ${
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

            <ChapterCard chapter={chapter} />
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
