# Persustain app replica — archived project card

The version of the featured project card that ran a **screen-for-screen
replica of the Persustain app**, built from the Figma file
(`Sf14iAq3vZfvhbOGhqONLL`, page "Persustain - screens").

Five beats, five real frames from the file:

| Beat | Frame | Node |
| --- | --- | --- |
| 01 Measure | Dashboard | `1:15434` |
| 02 Log | add activity — "What did you do?" | `1:15946` |
| 03 Confirm | add activity- save | `8:3768` |
| 04 Calculate | add activity complete | `12:893` |
| 05 Attribute | Dashboard, scrolled to "My Impact so far" | `1:15434` |

It was replaced on the live card by the four-beat product-system showcase in
`src/components/persustain/`. Both are kept because they answer different
briefs: this one shows *the product*, the other shows *the system around it*.

## Restoring it

1. Copy the three files back into `src/`:

   ```
   PersustainPreview.jsx   → src/components/PersustainPreview.jsx
   persustainIcons.js      → src/components/persustainIcons.js
   persustain-leaf.webp    → src/assets/persustain-leaf.webp
   ```

2. In `src/components/SelectedWork.jsx`, import it and swap the two call
   sites (featured and compact):

   ```jsx
   import PersustainPreview from "./PersustainPreview";
   …
   <PersustainPreview variant="featured" />
   <PersustainPreview variant="compact" />
   ```

   The `paused={featuredHover}` prop is specific to the showcase; this
   component does not take it. The `featuredHover` state and the composed
   `onMouseEnter`/`onMouseLeave` on the featured anchor can stay or go.

3. Nothing else is needed. It depends only on things that are already in the
   tree and shared with the current card:
   - `src/styles/tokens.js` → `easeBrand`
   - `.pp-box` / `.pp-stage` in `src/index.css`
   - the Raleway `<link>` in `index.html` (subsetted with `&text=` — extend
     the character set if you change any copy inside the mock)

## Regenerating the assets

Both were derived, not hand-made, so they can be rebuilt from source:

- **`persustainIcons.js`** — the Hugeicons set exported from the Figma file.
  Re-export the icon nodes and inline the path data, keeping each source
  `viewBox` and per-path `stroke-width`. The `info` entry is composed from
  three separate exports whose nested percentage offsets are resolved into
  one 12-box.
- **`persustain-leaf.webp`** — the "My Impact so far" illustration, lifted
  from the `.fig` archive (`images/d26118fc…`) and resized to 132px wide.
  Note it is an **opaque white-backed raster**, so it only works on the
  light phone screen, never on the dark card.

## Known departures from the Figma

Both deliberate, and both worth keeping if it is restored:

- The file's Add Activities header reads **"ADD ACTIVTIES"**. The typo is not
  reproduced here.
- The Footprint Movement card sits at `x=22.5 / w=348` where the two cards
  above it are `x=20 / w=353`. All three are set flush here.
