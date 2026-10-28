import Header from "@/components/Header";
import HorizontalScroll from "@/components/home/HorizontalScroll";
import HeroPanel from "@/components/home/HeroPanel";
import SectionTitlePanel from "@/components/home/SectionTitlePanel";
import EngagementPanel from "@/components/home/EngagementPanel";
import LogosBand from "@/components/home/LogosBand";
import Besoins from "@/components/home/Besoins";
import Expertises from "@/components/home/Expertises";
import B2BSections from "@/components/home/B2BSections";
import CasClients from "@/components/home/CasClients";
import Blog from "@/components/home/Blog";
import Faq from "@/components/home/Faq";
import { engagements } from "@/content/accueil";

export default function Home() {
  return (
    <>
      <Header />
      <main id="accueil">
        {/* Sections 1 et 2 : défilement horizontal */}
        <HorizontalScroll>
          <HeroPanel />
          <SectionTitlePanel title="Nos engagements" />
          {engagements.map((e) => (
            <EngagementPanel key={e.num} item={e} />
          ))}
        </HorizontalScroll>

        {/* Sections suivantes : défilement vertical */}
        <LogosBand />
        <Besoins />

        {/* Section Expertises : défilement horizontal, puis retour au vertical */}
        <Expertises />

        {/* Pourquoi une agence B2B + Du plan aux résultats : fond fumée WebGL et parallaxe en calques */}
        <B2BSections />

        {/* Cas clients : intro puis cas épinglés, dévoilés un à un (réf. mattis « We build websites ») */}
        <CasClients />

        <Blog />
        <Faq />
      </main>
    </>
  );
}
