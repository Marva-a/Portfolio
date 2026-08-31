// Shared vocabulary for the Persustain showcase on the featured project card.
//
// Two palettes meet here, and they are kept apart on purpose. `app` is
// Persustain's own design system, read out of the Figma file's variables — it
// applies only inside the phone, which is a miniature of that product. `stage`
// is this portfolio's dark-card language, and everything outside the phone —
// the system field, the trust plates, the labels — belongs to it.

export const app = {
  ink: "#1A1B1C",
  tertiary: "#595A5B",
  muted: "#959697",
  blue700: "#1E3CB5",
  blue600: "#2A46C1",
  blue500: "#304ECB",
  blue400: "#5469D4",
  info: "#6366F1",
  blue50: "#E8EAF9",
  orange: "#EE861E",
  info700: "#4338CA",
  success: "#15803D",
  lake50: "#DFF8FD",
  sun50: "#FEFDE8",
  screen: "#F8F9FB",
  card: "#FFFFFF",
  lakeFrom: "rgb(0,177,212)",
  lakeTo: "rgb(44,212,242)",
};

// Persustain's one brand gradient, on fills and — via background-clip — text.
export const GRAD = `linear-gradient(150deg, ${app.blue600} 0%, ${app.info} 94%)`;
export const gradText = {
  backgroundImage: GRAD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

export const stage = {
  text: "#FFFDF7",
  textMuted: "#FFF7E8",
  accent: "#FFE4A8",
  violet: "#8F74FF",
  sky: "#7CD2F2",
  amber: "#FFD166",
  hairline: "rgba(255,255,255,0.12)",
  plate: "rgba(255,255,255,0.045)",
  plateEdge: "rgba(255,255,255,0.10)",
};

// The product's mark: seven dots in one blue. Centres and radii are measured
// off the mark exported from the Figma file, as percentages of its box.
export const LOGO_DOTS = [
  [29.48, 73.1, 15.67],
  [54.52, 52.71, 12.24],
  [47.67, 17.86, 9.95],
  [70.14, 30.81, 9.29],
  [79, 53.38, 7.1],
  [71.1, 76.19, 5.4],
  [54.52, 87.95, 4.05],
];

// The one icon the phone needs, from the file's exported Hugeicons set —
// source viewBox and stroke width kept, so it scales without its weight
// drifting from the design.
export const CAR_ICON = {
  vb: "0 0 22 22",
  width: 1.55833,
  paths: [
    "M17.4167 15.5833H19.25C19.8 15.5833 20.1667 15.2167 20.1667 14.6667V11.9167C20.1667 11.0917 19.525 10.3583 18.7917 10.175C17.1417 9.71667 14.6667 9.16667 14.6667 9.16667C14.6667 9.16667 13.475 7.88333 12.6583 7.15C12.2 6.73750 11.5583 6.41667 10.9167 6.41667H5.5C4.95 6.41667 4.58333 6.78333 4.58333 7.33333V14.6667C4.58333 15.2167 4.95 15.5833 5.5 15.5833H6.41667",
    "M6.41667 17.4167C7.42919 17.4167 8.25 16.5959 8.25 15.5833C8.25 14.5708 7.42919 13.75 6.41667 13.75C5.40414 13.75 4.58333 14.5708 4.58333 15.5833C4.58333 16.5959 5.40414 17.4167 6.41667 17.4167Z",
    "M8.25 15.5833H13.75",
    "M15.5833 17.4167C16.5959 17.4167 17.4167 16.5959 17.4167 15.5833C17.4167 14.5708 16.5959 13.75 15.5833 13.75C14.5708 13.75 13.75 14.5708 13.75 15.5833C13.75 16.5959 14.5708 17.4167 15.5833 17.4167Z",
  ],
};

// The four beats of the loop. Total 11.6s — long enough for each idea to
// land, short enough that nobody feels made to wait through it.
export const STATES = [
  // Longer than the others: this beat plays three frames in sequence —
  // catalog, the AI-matched search result (typed out live, then picked),
  // then the costed detail screen, where 3 boils and Today are picked live
  // and Save gets a press — and each needs time to actually be read, not
  // just flashed past.
  { id: "measure", index: "01", name: "Measure", ms: 7200 },
  { id: "connect", index: "02", name: "Connect", ms: 2600 },
  { id: "trust", index: "03", name: "Build trust", ms: 3200 },
  { id: "impact", index: "04", name: "See impact", ms: 2800 },
];

// The product's own six-step lifecycle, verbatim from the file's "how this
// works" screens (1:16777, 1:17249, 1:17538, 1:17690, 1:17777, 1:18018).
//
// `live` marks the two steps the MVP actually reaches, and the trust state on
// each is the one the product really shows: ESTIMATED on a logged action,
// "Simulated · based on logged activities" on project data, and "Value
// pending verification" on everything downstream. Four repeated Pendings are
// the point, not noise — the model was designed ahead of the data.
export const LIFECYCLE = [
  { step: "01", name: "Your Actions", status: "Estimated", tone: stage.sky, live: true },
  { step: "02", name: "Climate Project", status: "Simulated", tone: stage.violet, live: true },
  { step: "03", name: "Verification", status: "Pending", tone: stage.amber },
  { step: "04", name: "Registration", status: "Pending", tone: stage.amber },
  { step: "05", name: "Certification", status: "Pending", tone: stage.amber },
  { step: "06", name: "Value", status: "Pending", tone: stage.accent },
];

// The one activity the loop follows, exactly as the file logs it: the save
// screen (8:3768) and the confirmation (12:893).
export const ACTIVITY = {
  title: "Boiling an electric kettle",
  category: "Home energy",
  matched: "Matched from “boiled the kettle twice”",
  amount: 0.09,
  unit: "kg CO₂e",
  detail: "3 boils · Boiling an electric kettle · Today",
  source: "Calculated by Climatiq",
};

// From the dashboard's "My Impact so far" card (1:15489), in full — every
// line the card actually shows, not a trimmed subset of it.
export const IMPACT = {
  eyebrow: "Here is the impact across all projects",
  projects: "1 project joined",
  logged: 12,
  unit: "Kg CO₂e logged",
  treeLine: "This is about 22 trees absorbing CO₂ for a day",
  valuePending: "Value pending verification . USD",
  share: "12.5%",
  shareLabel: "Your Contribution Share",
  shareSub: "of project total",
  breakdown: "See breakdown by project",
  period: "Feb 1 – Feb 28",
  weekDelta: "+3 Kg this week",
  project: "Community Micro-Greening and Carbon Sequestration Initiative.",
  progress: "62%",
  progressLabel: "Aggregation in progress",
};
