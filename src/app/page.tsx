import Header from "@/components/Header";
import HorizontalScroll from "@/components/home/HorizontalScroll";
import HeroPanel from "@/components/home/HeroPanel";
import SectionTitlePanel from "@/components/home/SectionTitlePanel";
import EngagementPanel from "@/components/home/EngagementPanel";
import LogosBand from "@/components/home/LogosBand";
import Besoins from "@/components/home/Besoins";
import { engagements } from "@/content/accueil";

export default function Home() {
  return (
    <>
      <Header />
      <main id="accueil">
        {/* Sections 1 et 2 : défilement horizontal */}
        <HorizontalScroll>
          <HeroPanel />
          <SectionTitlePanel num="02." title="Nos engagements" />
          {engagements.map((e) => (
            <EngagementPanel key={e.num} item={e} />
          ))}
        </HorizontalScroll>

        {/* Sections suivantes : défilement vertical */}
        <LogosBand />
        <Besoins />
      </main>
    </>
  );
}
