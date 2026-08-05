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
})
