import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// The production build is prerendered (see scripts/prerender.mjs) purely so
// crawlers, unfurlers and no-JS visitors get real markup instead of an empty
// #root. JS-enabled visitors still get a plain client render rather than a
// hydrateRoot onto that markup: Framer Motion writes several of its inline
// styles straight to the DOM outside React's own diffing, and the browser
// re-serializes those (shorthand -> longhand, reordered values) differently
// than React's hydration check expects, which threw cascading "Hydration
// failed" errors across nearly every animated element. createRoot re-renders
// over the prerendered markup instead of diffing against it, so none of that
// applies — the tradeoff is one extra layout pass on first paint for JS
// visitors, which crawlers and no-JS visitors never see anyway.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
