import signup from "../../assets/aweme/01-signup.webp";
import intake from "../../assets/aweme/02-intake.webp";
import question from "../../assets/aweme/03-question.webp";
import processing from "../../assets/aweme/04-processing.webp";
import reveal from "../../assets/aweme/05-reveal.webp";
import dashboard from "../../assets/aweme/06-dashboard.webp";
import iepPlan from "../../assets/aweme/07-iep-plan.webp";
import todo from "../../assets/aweme/08-todo.webp";
import share from "../../assets/aweme/09-share.webp";

/**
 * The parent journey from the file's "Critical Flow — Parent" section
 * (144:2), in the order the frames themselves are laid out on the canvas.
 *
 * The screens are the real thing — each one exported from Figma at 1400px
 * and served as webp, not redrawn. An earlier version of this card hand-built
 * miniatures of them; at card size that only ever approximated the design,
 * so the design itself is what ships now.
 *
 * `rect` is [x, y, w, h] in the frame's own 1728x1117 coordinate space, read
 * off each element's node in the Figma file rather than eyeballed against
 * the screenshot — so the ring the cursor draws sits exactly on the real
 * field, button or nav item, at any render size. Node ids for the ones that
 * needed digging: intake inputs 144:199/144:209 and nav 144:222,
 * questionnaire 144:26/144:38/181:2347, reveal CTA 144:291, todo task
 * 137:1841 and its 137:1899 footer button, share 137:1969/137:1971.
 */

export const FRAME_W = 1728;
export const FRAME_H = 1117;

// The size the composition is laid out at before the card scales it as a
// whole. Both live here rather than beside the component that draws them,
// so that file exports only components (oxlint's react/only-export-components
// otherwise treats a computed export as a possible non-component and warns).
export const SCREEN_W = 660;
export const SCREEN_H = Math.round((SCREEN_W * FRAME_H) / FRAME_W);

// How long the cursor rests on one target, and the beat a screen holds after
// its last click before the next screen fades in.
const DWELL = 1000;
const SETTLE = 350;

const screens = [
  {
    id: "signup",
    src: signup,
    // Create an account: your name, your email, go.
    targets: [
      { rect: [634, 551, 460, 46] },
      { rect: [634, 638, 460, 46] },
      { rect: [634, 867, 460, 48], click: true },
    ],
  },
  {
    id: "intake",
    src: intake,
    // Who the child is: name, then grade, then on.
    targets: [
      { rect: [564, 505, 600, 50] },
      { rect: [564, 703, 600, 50] },
      { rect: [1114, 924, 90, 48], click: true },
    ],
  },
  {
    id: "question",
    src: question,
    // The screening question itself: pick the answer, add the note you
    // were always going to add, continue.
    targets: [
      { rect: [564, 537, 600, 78], click: true },
      { rect: [564, 738, 600, 100] },
      { rect: [1114, 910, 90, 48], click: true },
    ],
  },
  {
    id: "processing",
    src: processing,
    // Nothing to point at while it thinks — the one screen with no cursor.
    targets: [],
    ms: 2200,
  },
  {
    id: "reveal",
    src: reveal,
    // Read one finding, then go to the full dashboard.
    targets: [
      { rect: [611, 459, 507, 162] },
      { rect: [660, 677, 188, 44], click: true },
    ],
  },
  {
    id: "dashboard",
    src: dashboard,
    // Take in the first indicator card, then open the plan.
    targets: [
      { rect: [328, 396, 437, 289] },
      { rect: [24, 155, 232, 42], click: true },
    ],
  },
  {
    id: "iep-plan",
    src: iepPlan,
    // The plain-language summary, then across to the to-do list.
    targets: [
      { rect: [328, 137, 1352, 249] },
      { rect: [24, 205, 232, 42], click: true },
    ],
  },
  {
    id: "todo",
    src: todo,
    // Open "Schedule School Meeting", mark it done, then pick up the next
    // task — "Share Profile with Teacher", which is what opens the screen
    // after this one. The last click on every screen is the one that earns
    // the next screen.
    targets: [
      { rect: [328, 272, 631, 81], click: true },
      { rect: [1513, 616, 135, 37], click: true },
      { rect: [328, 369, 631, 81], click: true },
    ],
  },
  {
    id: "share",
    src: share,
    // The last thing a parent actually does with all of this: send it to
    // the school.
    targets: [
      { rect: [356, 294, 381, 42] },
      { rect: [356, 356, 152, 44], click: true },
    ],
  },
];

export const FLOW = screens.map((screen) => ({
  ...screen,
  dwell: DWELL,
  ms: screen.ms ?? screen.targets.length * DWELL + SETTLE,
}));
