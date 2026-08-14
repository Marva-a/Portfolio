# scripts

## og-card.html

Source for `public/og-image.png` — the 1200×630 preview card LinkedIn, Slack
and iMessage show when the site is shared. Edit the HTML, then re-render it:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=6000 \
  --screenshot=public/og-image.png scripts/og-card.html
```

`--virtual-time-budget` is what waits for the Google-hosted DM Sans to arrive;
without it the card renders in a fallback face.

## Favicons

The masters live in `favicon/` at the repo root and are copied into `public/`
as-is — two marks, one per colour scheme:

| Mark | Looks like | Used when |
| --- | --- | --- |
| `favicon-ink` | dark blob, transparent background | the browser is in **light** mode |
| `favicon-mesh` | pale blob on cream | the browser is in **dark** mode |

`index.html` links the ink files, adds one `media="(prefers-color-scheme:
dark)"` link to the mesh SVG for Firefox, and runs a small script that swaps
the filename in every unguarded icon link. The `:not([media])` in that
selector matters — without it the script overwrites the declarative dark link
and Firefox loses its fallback.

## apple-touch.html

Source for `public/apple-touch-icon.png`. iOS paints a home-screen icon's
transparent pixels black and applies its own rounded mask, so this renders the
mesh mark flattened onto opaque cream:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=180,180 --virtual-time-budget=4000 \
  --screenshot=public/apple-touch-icon.png scripts/apple-touch.html
```

## Notes

The OG card is deliberately type-only. Preview cards are shown at roughly a
quarter size in a feed, where a face and a headline compete and both lose.
