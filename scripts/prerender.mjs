// Runs after `vite build` (see the "build" script in package.json). Boots the
// production build with Vite's own preview server, loads it in headless
// Chrome, and dumps the fully-rendered DOM back over dist/index.html.
//
// Why: the site is a client-rendered SPA, so the file GitHub Pages would
// otherwise serve at "/" has an empty <div id="root">. Crawlers and tools
// that don't execute JS (LinkedIn/Slack unfurlers, some ATS scrapers, plain
// HTTP fetches) see nothing. Baking the rendered HTML in fixes that while
// leaving the JS bundle in place to hydrate for interactivity — see the
// hydrateRoot/createRoot switch in src/main.jsx.
//
// Deliberately shells out to a real Chrome instead of adding puppeteer/
// playwright as a dependency, matching how scripts/og-card.html and
// scripts/apple-touch.html already render via headless Chrome CLI.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { platform, tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { preview } from 'vite'

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
  const profileDir = mkdtempSync(join(tmpdir(), 'prerender-chrome-'))

  let html
  try {
    const result = spawnSync(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-sync',
        '--disable-background-networking',
        '--disable-component-update',
        '--disable-domain-reliability',
        `--user-data-dir=${profileDir}`,
        '--virtual-time-budget=8000',
        '--dump-dom',
        url,
      ],
      { encoding: 'utf8', maxBuffer: 1024 * 1024 * 32, timeout: 30_000, stdio: ['ignore', 'pipe', 'ignore'] },
    )

    if (result.error) throw result.error
    if (result.status !== 0) {
      throw new Error(`prerender: Chrome exited with status ${result.status}`)
    }
    html = result.stdout
  } finally {
    await new Promise((res) => server.httpServer.close(res))
    rmSync(profileDir, { recursive: true, force: true })
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
