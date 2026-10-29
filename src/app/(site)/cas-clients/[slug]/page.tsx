import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailLayout from "@/components/DetailLayout";
import PortableBody from "@/components/PortableBody";
import styles from "@/components/DetailLayout.module.css";
import { client } from "@/sanity/lib/client";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import { cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { CASE_STUDY_QUERY, CASE_SLUGS_QUERY } from "@/sanity/lib/queries";
import type { CASE_STUDY_QUERY_RESULT, CASE_SLUGS_QUERY_RESULT } from "../../../../../sanity.types";

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

export default async function CaseStudyPage({ params }: PageProps<"/cas-clients/[slug]">) {
  const c = await getCase((await params).slug);
  if (!c) notFound();

  const doc = { _id: clean(c._id), _type: clean(c._type) };
  const image = imageUrl(c.image, 1640, 920);

  return (
    <DetailLayout back="Retour aux cas clients" backHref="/#cas-clients">
      {(c.clientName || c.sector) && (
        <p className={styles.meta}>{[c.clientName, c.sector].filter(Boolean).join(" · ")}</p>
      )}
      <h1 className={styles.title} data-sanity={editAttr(doc, "title")}>
        {c.title}
      </h1>
      {c.question && <p className={styles.lead}>{c.question}</p>}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.cover} src={clean(image)} alt={clean(c.image?.alt) ?? ""} data-sanity={editAttr(doc, "image")} />
      )}
      {!!c.keyFigures?.length && (
        <ul className={styles.figures}>
          {c.keyFigures.map((k) => (
            <li key={clean(k._key)}>
              <strong>{k.result}</strong>
              <span>{k.detail}</span>
            </li>
          ))}
        </ul>
      )}
      <PortableBody value={c.body} />
    </DetailLayout>
  );
}
