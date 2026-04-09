import Hero from "../src/components/sections/Hero";
import Statement from "../src/components/sections/Statement";
import About from "../src/components/sections/About";
import Projects from "../src/components/sections/Projects";
import Writing from "../src/components/sections/Writing";
import Contact from "../src/components/sections/Contact";

export default function Page() {
  return (
    <main>
      <Hero />
      <Statement />
      <About />
      <Projects />
      <Writing />
      <Contact />
    </main>
  );
}
