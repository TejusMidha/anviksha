import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import About from '@/components/About';
import EraStrip from '@/components/EraStrip';
import PrizePool from '@/components/PrizePool';
import Schedule from '@/components/Schedule';
import Faq from '@/components/Faq';
import Sponsors from '@/components/Sponsors';
import Coordinators from '@/components/Coordinators';
import Register from '@/components/Register';
import Footer from '@/components/Footer';
// HeroBackground is a client component; it dynamic-imports the r3f canvas with
// ssr:false internally (ssr:false is not permitted from a server component).
import HeroBackground from '@/components/HeroBackground';

export default function Page() {
  return (
    <>
      <HeroBackground />
      {/* Readability scrim: sits between the live field and all page copy. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-[5] bg-void/45" />
      <Nav />
      <main className="relative">
        <Hero />
        <About />
        <EraStrip />
        <PrizePool />
        <Schedule />
        <Faq />
        {/* Both render null until their data lands in lib/content.ts. */}
        <Sponsors />
        <Coordinators />
        <Register />
      </main>
      <Footer />
    </>
  );
}
