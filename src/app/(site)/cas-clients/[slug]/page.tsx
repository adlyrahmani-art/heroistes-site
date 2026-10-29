import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PortableBody from "@/components/PortableBody";
import CaseEffects from "@/components/case/CaseEffects";
import CaseHero from "@/components/case/CaseHero";
import CaseIntro from "@/components/case/CaseIntro";
import CaseChallenge from "@/components/case/CaseChallenge";
import CaseChapter from "@/components/case/CaseChapter";
import styles from "@/components/case/Case.module.css";
import { client } from "@/sanity/lib/client";
import { clean } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import { cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { CASE_STUDY_QUERY, CASE_SLUGS_QUERY, CONTACT_LEAD_QUERY } from "@/sanity/lib/queries";
import type {
  CASE_STUDY_QUERY_RESULT,
  CASE_SLUGS_QUERY_RESULT,
  CONTACT_LEAD_QUERY_RESULT,
} from "../../../../../sanity.types";

export async function generateStaticParams() {
  const slugs: CASE_SLUGS_QUERY_RESULT = await client.fetch(CASE_SLUGS_QUERY);
  const params = slugs.flatMap((s) => (s.slug ? [{ slug: s.slug }] : []));
  // Cache Components refuse un tableau vide ; le repli mène à notFound().
  return params.length ? params : [{ slug: "_placeholder" }];
}

async function getCase(slug: string) {
  const options = await getDynamicFetchOptions();
  const { data } = await cachedFetch({ query: CASE_STUDY_QUERY, params: { slug }, ...options });
  return data as CASE_STUDY_QUERY_RESULT;
}

async function getLead() {
  const options = await getDynamicFetchOptions();
  const { data } = await cachedFetch({ query: CONTACT_LEAD_QUERY, ...options });
  return (data as CONTACT_LEAD_QUERY_RESULT)?.contactLead?.lead ?? [];
}

export async function generateMetadata({ params }: PageProps<"/cas-clients/[slug]">): Promise<Metadata> {
  const c = await getCase((await params).slug);
  if (!c) return {};
  const title = clean(c.seo?.title) || clean(c.title) || clean(c.clientName) || "Cas client";
  const description = clean(c.seo?.description) || clean(c.question) || undefined;
  const image = imageUrl(c.seo?.image ?? c.image, 1200, 630);
  const images = image ? [{ url: image, alt: title }] : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: "article", ...(images && { images }) },
    twitter: { card: "summary_large_image", title, description, ...(images && { images }) },
  };
}

/**
 * Page détail cas client (maquette « Pranéo détails ») : en-tête sombre, puis sections claires
 * traversées par le trait central. Le header passe du blanc à l'encre en quittant l'en-tête (CaseEffects).
 * Un cas sans contenu « Page détail » affiche son corps de texte historique.
 */
export default async function CaseStudyPage({ params }: PageProps<"/cas-clients/[slug]">) {
  const { slug } = await params;
  const [c, lead] = await Promise.all([getCase(slug), getLead()]);
  if (!c) notFound();

  const doc = { _id: clean(c._id), _type: clean(c._type) };
  const chapters = c.chapters ?? [];
  const hasDetail = !!(c.detailIntro || c.challenge || chapters.length);

  return (
    <>
      <SiteHeader anchorBase="/" />
      <main>
        <CaseEffects />
        <CaseHero c={c} doc={doc} />
        <div className={styles.light} data-reveal>
          <span className={styles.axis} aria-hidden="true" />
          {c.detailIntro && <CaseIntro intro={c.detailIntro} doc={doc} />}
          {c.challenge && <CaseChallenge challenge={c.challenge} />}
          {chapters.map((ch) => (
            <CaseChapter key={clean(ch._key)} chapter={ch} doc={doc} />
          ))}
          {!hasDetail && !!c.body?.length && (
            <div className={`${styles.section} ${styles.body}`}>
              <PortableBody value={c.body} />
            </div>
          )}
        </div>
      </main>
      <SiteFooter lead={lead} staticTone="light" />
    </>
  );
}
