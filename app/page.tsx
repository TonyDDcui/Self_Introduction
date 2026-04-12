import Hero from "../src/components/sections/Hero";
import RepoPromo from "../src/components/sections/RepoPromo";
import About from "../src/components/sections/About";
import Projects from "../src/components/sections/Projects";
import Writing from "../src/components/sections/Writing";
import Contact from "../src/components/sections/Contact";

// Vercel 部署区域提示：尽可能靠近中国大陆（降低 TTFB）
export const preferredRegion = ["hkg1"];

export default function Page() {
  return (
    <main>
      <Hero />
      <RepoPromo />
      <About />
      <Projects />
      <Writing />
      <Contact />
    </main>
  );
}
