import Navbar from "@/components/navbar/NavBar";
import Footer from "@/components/Footer";
import Hero from "@/components/lading-page/Hero";
import HowItWorks from "@/components/lading-page/Working";
import PopularSkills from "@/components/lading-page/Popular";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      <Navbar />
      <Hero />
      <HowItWorks />
      <PopularSkills />
      <Footer />
    </main>
  );
}
