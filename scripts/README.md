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

The card is deliberately type-only. Preview cards are shown at roughly a
quarter size in a feed, where a face and a headline compete and both lose.
