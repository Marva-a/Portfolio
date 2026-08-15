import { MotionConfig } from "framer-motion";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import SelectedWork from "./components/SelectedWork";
import Expertise from "./components/Expertise";
import About from "./components/About";
import Contact from "./components/Contact";

function App() {
  return (
    // reducedMotion="user" makes every Framer Motion animation on the page
    // (the MA badge's glide, its letter stagger, the project cards' custom
    // cursor) honour prefers-reduced-motion automatically — Framer swaps
    // transform-based animations for an instant snap to the end state,
    // without disabling opacity/colour transitions. This is a global,
    // one-line counterpart to the per-animation `@media (prefers-reduced-
    // motion: reduce)` overrides already written by hand for every plain
    // CSS animation in index.css.
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#fff7e8] text-black">
        {/* First thing in the tab order: a keyboard visitor can jump the nav
            and land on the headline instead of tabbing through five tabs on
            every page load. Invisible until focused (.skip-link). */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        {/* Nav is fixed-positioned, so its place in the DOM is purely a
            semantics/tab-order decision — moving it out of Hero and into a
            <header> here gives the page a banner landmark and puts the nav
            where screen-reader users expect it, with no visual change. */}
        <header>
          <Nav />
        </header>

        <main id="main">
          <Hero />
          <SelectedWork />
          <Expertise />
          <About />
          <Contact />
        </main>
      </div>
    </MotionConfig>
  );
}

export default App;
