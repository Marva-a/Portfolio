import Hero from "./components/Hero";
import Nav from "./components/Nav";
import SelectedWork from "./components/SelectedWork";
import Expertise from "./components/Expertise";
import About from "./components/About";
import Contact from "./components/Contact";

function App() {
  return (
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
  );
}

export default App;
