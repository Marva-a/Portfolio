import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // The site is served from https://<user>.github.io/Portfolio/, not the
  // domain root, so asset URLs need that prefix. Must match the repo name
  // exactly, including capitalisation — a mismatch here builds a page that
  // loads with no CSS or JS.
  base: '/Portfolio/',
  plugins: [react()],
  build: {
    rollupOptions: {
      // A second, unlinked page (not part of the SPA's own routing — this
      // site has none) built alongside index.html so it inherits the same
      // base path, asset hashing and GitHub Pages deploy with zero extra
      // config. Reachable directly at /Portfolio/design-system.html once
      // deployed; see DESIGN_SYSTEM.md.
      input: {
        main: resolve(__dirname, 'index.html'),
        designSystem: resolve(__dirname, 'design-system.html'),
      },
    },
  },
})
