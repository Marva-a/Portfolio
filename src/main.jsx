import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production build is prerendered (see scripts/prerender.mjs), so #root
// already holds real markup when this script runs there — hydrate onto it
// instead of wiping it with a client render. In dev, #root is empty and this
// falls back to a normal mount.
if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
