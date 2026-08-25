// Runs after `vite build` (see the "build" script in package.json). Boots the
// production build with Vite's own preview server, loads it in headless
// Chrome via the DevTools protocol, and dumps the fully-rendered DOM back
// over dist/index.html.
//
// Why: the site is a client-rendered SPA, so the file GitHub Pages would
// otherwise serve at "/" has an empty <div id="root">. Crawlers and tools
// that don't execute JS (LinkedIn/Slack unfurlers, some ATS scrapers, plain
// HTTP fetches) see nothing. Baking the rendered HTML in fixes that while
// leaving the JS bundle in place to hydrate for interactivity — see the
// hydrateRoot/createRoot switch in src/main.jsx.
//
// Uses puppeteer-core (CDP) rather than shelling out to `chrome --dump-dom`:
// that CLI flag combined with --headless=new reliably hung past a 45s
// timeout on this page (real network requests for Google Fonts), both
// locally and in CI, regardless of --virtual-time-budget. page.goto with an
// explicit waitUntil condition is the well-supported path for exactly this.
import { execFileSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { platform } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { preview } from 'vite'
import puppeteer from 'puppeteer-core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function findChrome() {
  const candidates =
    platform() === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
        ]
      : ['google-chrome-stable', 'google-chrome', 'chromium-browser', 'chromium']

  for (const candidate of candidates) {
    if (candidate.startsWith('/')) {
      if (existsSync(candidate)) return candidate
      continue
    }
    try {
      const found = execFileSync('which', [candidate], { encoding: 'utf8' }).trim()
      if (found) return found
    } catch {
      // not on PATH, try the next candidate
    }
  }

  throw new Error(
    'prerender: no Chrome/Chromium install found. Install Google Chrome, or ' +
      'set CHROME_PATH to point at a binary.',
  )
}

async function main() {
  const server = await preview({
    root,
    preview: { port: 4174, strictPort: true },
  })
  const url = server.resolvedUrls.local[0]

  const chrome = process.env.CHROME_PATH || findChrome()
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })

  let html
  try {
    const page = await browser.newPage()
    // The site branches its layout on matchMedia breakpoints (mobile nav vs
    // desktop, single- vs two-column composition — see DESKTOP_QUERY in
    // src/hooks/useMediaQuery.js). Puppeteer's default 800x600 viewport
    // falls between those breakpoints and matches neither, so it prerenders
    // a layout that mismatches almost every real visitor on hydration
    // (React error #418). 1440x900 is comfortably inside the desktop
    // breakpoint and matches the common case.
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })
    html = await page.content()
  } finally {
    await browser.close()
    await new Promise((res) => server.httpServer.close(res))
  }

  if (!html.includes('id="root"') || /<div id="root">\s*<\/div>/.test(html)) {
    throw new Error(
      'prerender: dumped DOM has an empty #root — the app did not render in time.',
    )
  }

  const outPath = resolve(root, 'dist/index.html')
  writeFileSync(outPath, `<!doctype html>\n${html.trim()}\n`)
  console.log(`prerender: wrote rendered HTML to ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
