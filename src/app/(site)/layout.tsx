import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive, cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { clean } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import { SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SETTINGS_QUERY_RESULT } from "../../../sanity.types";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import "../globals.css";

const FALLBACK: Metadata = {
  title: "Agence marketing B2B orientée résultats | Héroïstes",
  description:
    "Agence marketing B2B à 360 degrés, Héroïstes réunit conseil, ventes, marque et acquisition, et suit chaque action jusqu’au lead.",
};

// Métadonnées par défaut depuis les Réglages. Toujours nettoyées (stega retiré), y compris en brouillon.
// Même mécanique que page.tsx : getDynamicFetchOptions() ne devient dynamique qu'en brouillon.
export async function generateMetadata(): Promise<Metadata> {
  const options = await getDynamicFetchOptions();
  const { data } = await cachedFetch({ query: SETTINGS_QUERY, ...options });
  const seo = (data as SETTINGS_QUERY_RESULT)?.seo;
  const title = clean(seo?.title) || (FALLBACK.title as string);
  const description = clean(seo?.description) || (FALLBACK.description as string);
  const image = imageUrl(seo?.image, 1200, 630);
  return {
    title,
    description,
    ...(image && { openGraph: { title, description, images: [{ url: image, alt: clean(seo?.image?.alt) ?? "" }] } }),
  };
}

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  viewportFit: "cover",
};

// draftMode() est dynamique : isolé dans Suspense pour garder la coquille statique.
async function DraftTools() {
  const { isEnabled } = await draftMode();
  return (
    <>
      <SanityLive includeDrafts={isEnabled} />
      {isEnabled && <VisualEditing />}
    </>
  );
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SmoothScroll>{children}</SmoothScroll>
      <Cursor />
      <Suspense>
        <DraftTools />
      </Suspense>
    </>
  );
}
