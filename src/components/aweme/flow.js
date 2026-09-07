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
 *
 * A target can also carry `type` (text AwemeScreen types into that field
 * over the underlying placeholder — only on fields the export shows empty;
 * the questionnaire's note is already filled in the export itself, so it's
 * left to the ring alone), `mask` (render it as dots, for the password),
 * `select` (the field is a dropdown — get a flyout instead of typed text),
 * `pill` / `radius` (the shape of the control the ring goes around, so it
 * lands concentric with the real thing rather than as one fixed rounded
 * rectangle over everything: AweMe's buttons are stadiums — the three that
 * could be measured cleanly off the exports all come back radius = height/2
 * — while its inputs and cards sit between 4 and 12 frame px. `radius` is
 * in frame px like `rect`; `pill` means "half your own height, whatever
 * that turns out to be"), `radioRect` / `checkboxRect` (a circle or box to
 * replay as unpicked-then-picked / unchecked-then-checked — measured off
 * the exports themselves rather than taken from the node's stated size,
 * since a cover has to be at least as big as the mark it hides or the
 * original shows as a rim around it; usually inside the target's own
 * `rect`, but not always: the to-do screen's checkboxRect belongs to the
 * row a button click completes, not to the button itself), `bakedOn` (the
 * export already shows that mark made, so it has to be covered from the
 * moment the screen appears — otherwise the pick reads as something that
 * was always true rather than something that happens. Where the export
 * shows the control untouched instead, as the to-do row does, there is
 * nothing to hide, and nothing is drawn over it until the press lands: the
 * one checkbox the cursor uses then goes on looking exactly like the three
 * beside it), and `hold` (how long the cursor stays on that target,
 * defaulting to DWELL; typed fields get more so the typing has room to
 * finish before the cursor moves on).
 *
 * A screen can also carry `progress` ({ track: [x,y,w,h], fill }) — the
 * step bar's own baked-in fill is covered and regrown from zero each time
 * the screen is entered — and `spinner` (a rect to spin a loading ring
 * over), for the two screens where the *page itself* is doing something,
 * not just the cursor.
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
    // Create an account: your name, your email, a password, agree, go.
    targets: [
      { rect: [634, 551, 460, 46], radius: 6, type: "Sarah Chen" },
      { rect: [634, 638, 460, 46], radius: 6, type: "sarah.chen@gmail.com", hold: 1500 },
      { rect: [634, 725, 460, 46], radius: 6, type: "Sunshine2024!", mask: true, hold: 1300 },
      { rect: [634, 799, 460, 40], radius: 6, checkboxRect: [632, 796, 24, 24], bakedOn: true, click: true },
      { rect: [634, 867, 460, 48], pill: true, click: true },
    ],
  },
  {
    id: "intake",
    src: intake,
    // Who the child is: name, birthday, then grade, then on.
    targets: [
      { rect: [564, 505, 600, 50], radius: 6, type: "Leo" },
      { rect: [564, 604, 600, 50], radius: 6, type: "03/14/2020", hold: 1300 },
      { rect: [564, 703, 600, 50], radius: 6, select: true },
      { rect: [1114, 924, 90, 48], pill: true, click: true },
    ],
    progress: { track: [524, 257, 680, 8], fill: 267 },
  },
  {
    id: "question",
    src: question,
    // The screening question itself: pick the answer, add the note you
    // were always going to add, continue.
    targets: [
      { rect: [564, 537, 600, 78], radius: 6, radioRect: [578, 562, 28, 28], bakedOn: true, click: true },
      { rect: [564, 738, 600, 100], radius: 6 },
      { rect: [1114, 910, 90, 48], pill: true, click: true },
    ],
    progress: { track: [524, 252, 680, 8], fill: 272 },
  },
  {
    id: "processing",
    src: processing,
    // Nothing to point at while it thinks — the one screen with no cursor.
    targets: [],
    ms: 2200,
    progress: { track: [584, 634, 560, 6], fill: 336 },
    spinner: { rect: [824, 251, 80, 80] },
  },
  {
    id: "reveal",
    src: reveal,
    // Read one finding, then go to the full dashboard.
    targets: [
      { rect: [611, 470, 507, 162], radius: 12 },
      { rect: [660, 688, 188, 44], pill: true, click: true },
    ],
  },
  {
    id: "dashboard",
    src: dashboard,
    // Take in the first indicator card, then open the plan.
    targets: [
      { rect: [328, 396, 437, 289], radius: 12 },
      { rect: [24, 155, 232, 42], radius: 10, click: true },
    ],
  },
  {
    id: "iep-plan",
    src: iepPlan,
    // The plain-language summary, then across to the to-do list.
    targets: [
      { rect: [328, 137, 1352, 249], radius: 12 },
      { rect: [24, 205, 232, 42], radius: 10, click: true },
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
      { rect: [328, 273, 630, 79], radius: 10, click: true },
      // "Complete Task" — checks off the row's own checkbox (137:1841),
      // not the button being clicked, since that's the actual effect of
      // pressing it.
      { rect: [1512, 615, 138, 39], pill: true, checkboxRect: [348, 299, 25, 25], click: true },
      { rect: [328, 369, 630, 80], radius: 10, click: true },
    ],
  },
  {
    id: "share",
    src: share,
    // The last thing a parent actually does with all of this: send it to
    // the school.
    targets: [
      { rect: [356, 294, 381, 42], radius: 6, type: "jenkins@lincolnelementary.edu", hold: 1500 },
      { rect: [356, 356, 152, 44], pill: true, click: true },
    ],
  },
];

export const FLOW = screens.map((screen) => {
  const holds = screen.targets.map((t) => t.hold ?? DWELL);
  return {
    ...screen,
    holds,
    ms: screen.ms ?? holds.reduce((sum, h) => sum + h, 0) + SETTLE,
  };
});
