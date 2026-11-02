import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HorizontalScroll from "@/components/home/HorizontalScroll";
import SwipeRow from "@/components/home/SwipeRow";
import HeroPanel from "@/components/home/HeroPanel";
import SectionTitlePanel from "@/components/home/SectionTitlePanel";
import EngagementPanel from "@/components/home/EngagementPanel";
import engagementStyles from "@/components/home/EngagementPanel.module.css";
import LogosBand from "@/components/home/LogosBand";
import Besoins from "@/components/home/Besoins";
import Expertises from "@/components/home/Expertises";
import B2BSections from "@/components/home/B2BSections";
import CasClients from "@/components/home/CasClients";
import { clean } from "@/sanity/lib/clean";
import { cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { HOME_QUERY } from "@/sanity/lib/queries";
import type { HOME_QUERY_RESULT } from "../../../sanity.types";

export default async function Home() {
  const options = await getDynamicFetchOptions();
  const { data } = await cachedFetch({ query: HOME_QUERY, ...options });
  const home = data as HOME_QUERY_RESULT;
  if (!home) notFound();

  const doc = { _id: clean(home._id), _type: clean(home._type) };

  return (
    <>
      <SiteHeader />
      <main id="accueil">
        {/* Sections 1 et 2 : défilement horizontal */}
        <HorizontalScroll>
          {home.hero && <HeroPanel hero={home.hero} />}
          <SectionTitlePanel title={home.engagementsTitle ?? ""} />
          <SwipeRow label="Nos engagements" className={engagementStyles.row}>
            {home.engagements?.map((e, i) => (
              <EngagementPanel key={clean(e._key)} item={e} index={i} doc={doc} />
            ))}
          </SwipeRow>
        </HorizontalScroll>

        {/* Sections suivantes : défilement vertical */}
        {home.logosBand && <LogosBand logos={home.logosBand} doc={doc} />}
        {home.besoins && <Besoins besoins={home.besoins} doc={doc} />}

        {/* Section Expertises : défilement horizontal, puis retour au vertical */}
        {home.expertises && <Expertises expertises={home.expertises} doc={doc} />}

        {/* Pourquoi une agence B2B + Du plan aux résultats : fond fumée WebGL et parallaxe en calques */}
        {home.pourquoi && home.plan && <B2BSections pourquoi={home.pourquoi} plan={home.plan} doc={doc} />}

        {/* Cas clients : intro puis cas épinglés, dévoilés un à un (réf. mattis « We build websites ») */}
        {home.casClients && <CasClients casClients={home.casClients} doc={doc} />}

      </main>

      {/* Footer : entre de droite à gauche par-dessus les cas clients (mouvement des Expertises) */}
      <SiteFooter lead={home.contactLead?.lead ?? []} />
    </>
  );
}
