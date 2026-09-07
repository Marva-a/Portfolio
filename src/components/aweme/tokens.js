// AweMe's own brand colours, read out of the Figma file's rendered styles.
// The screens themselves are exported images (see flow.js), so the only
// things drawn in code — the cursor and the ring it puts around whatever a
// parent would reach for next — take their colour from here, and land on
// the real design rather than beside it.

export const app = {
  ink: "#1f1f1f",
  bg: "#f9f7f5",
  border: "#e7ded0",
  brown: "#6b4420",
  teal: "#438692",
  // The fill inside an input, sampled off the exports themselves rather than
  // reused from `bg` above: every screen's fields come back rgb(252,249,243),
  // a warmer and lighter colour than the page behind them. AwemeScreen paints
  // this where it covers a field to type into it, so the patch disappears
  // into the design instead of reading as a paler rectangle sitting on it.
  field: "#fcf9f3",
  // The outline on an unticked checkbox, sampled off the to-do screen's own
  // rows. A cool neutral, not the warm `border` above — that one belongs to
  // the text inputs, and using it here left the one checkbox the overlay
  // covers looking warmer than the three beside it.
  control: "#ececea",
};
