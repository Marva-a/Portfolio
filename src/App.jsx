import Hero from "./components/Hero";
import SelectedWork from "./components/SelectedWork";
import Expertise from "./components/Expertise";
import About from "./components/About";
import Contact from "./components/Contact";

function App() {
  return (
    <div className="min-h-screen bg-[#fff7e8] text-black">
      <Hero />
      <SelectedWork />
      <Expertise />
      <About />
      <Contact />
    </div>
  );
}

export default App;
