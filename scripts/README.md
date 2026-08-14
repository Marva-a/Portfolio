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

## favicon-source.png

The 1254×1254 master for every icon in `public/`. Two crops come out of it,
because one file scaled down doesn't serve both jobs — at 16–32px the mark
needs to fill the frame, and at 180px+ the blob wants room around it:

```bash
# tight crop → the browser-tab sizes
sips -c 1180 1180 --cropOffset 10 44 scripts/favicon-source.png --out /tmp/full.png
sips -c 900 900 --cropOffset 160 170 /tmp/full.png --out /tmp/tight.png
sips -Z 16 /tmp/tight.png --out public/favicon-16.png
sips -Z 32 /tmp/tight.png --out public/favicon-32.png

# full crop → home screen / install icons
sips -Z 180 /tmp/full.png --out public/apple-touch-icon.png
sips -Z 192 /tmp/full.png --out public/favicon-192.png
```

At 16px the cream `m` on the pale gradient loses its counters and reads as a
soft blur. That's the artwork, not the export — a small-size variant would
need a darker blob or a heavier glyph.

## Notes

The OG card is deliberately type-only. Preview cards are shown at roughly a
quarter size in a feed, where a face and a headline compete and both lose.
