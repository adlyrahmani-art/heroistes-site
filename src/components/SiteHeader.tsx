import Header from "@/components/Header";
import { cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SETTINGS_QUERY_RESULT } from "../../sanity.types";

/** Header alimenté par les Réglages ; repli sur les valeurs par défaut si absents. Réutilisable par toutes les pages. */
export default async function SiteHeader({ anchorBase }: { anchorBase?: string }) {
  const options = await getDynamicFetchOptions();
  const { data } = await cachedFetch({ query: SETTINGS_QUERY, ...options });
  const settings = data as SETTINGS_QUERY_RESULT;
  return <Header navLabels={settings?.navLabels} cta={settings?.headerCta} anchorBase={anchorBase} />;
}
