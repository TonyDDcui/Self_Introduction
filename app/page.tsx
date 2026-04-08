import Hero from "../src/components/sections/Hero";
import Activity from "../src/components/sections/Activity";
import About from "../src/components/sections/About";
import Projects from "../src/components/sections/Projects";
import Writing from "../src/components/sections/Writing";
import Contact from "../src/components/sections/Contact";

export default function Page() {
  return (
    <main>
      <Hero />
      <Activity />
      <About />
      <Projects />
      <Writing />
      <Contact />
    </main>
  );
}
