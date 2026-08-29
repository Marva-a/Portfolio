import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from the domain root (https://www.marva.design/) via the
  // connected custom domain, not from https://<user>.github.io/Portfolio/
  // — so asset URLs must NOT carry a /Portfolio/ prefix. If the custom
  // domain is ever disconnected and the site falls back to the GitHub
  // Pages project URL, this needs to go back to '/Portfolio/'.
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      // A second, unlinked page (not part of the SPA's own routing — this
      // site has none) built alongside index.html so it inherits the same
      // base path, asset hashing and GitHub Pages deploy with zero extra
      // config. Reachable directly at /design-system.html once deployed;
      // see DESIGN_SYSTEM.md.
      input: {
        main: resolve(__dirname, 'index.html'),
        designSystem: resolve(__dirname, 'design-system.html'),
      },
    },
  },
})
