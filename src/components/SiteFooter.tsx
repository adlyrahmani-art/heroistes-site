import Footer from "@/components/Footer";
import { cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { CONTACT_FORM_QUERY, SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { CONTACT_FORM_QUERY_RESULT, SETTINGS_QUERY_RESULT } from "../../sanity.types";

/** Footer alimenté par les Réglages ; repli sur les valeurs par défaut si absents. Réutilisable par toutes les pages. */
export default async function SiteFooter({ lead, staticTone }: { lead: string[]; staticTone?: "light" }) {
  const options = await getDynamicFetchOptions();
  const [{ data }, { data: formData }] = await Promise.all([
    cachedFetch({ query: SETTINGS_QUERY, ...options }),
    cachedFetch({ query: CONTACT_FORM_QUERY, ...options }),
  ]);
  const s = data as SETTINGS_QUERY_RESULT;
  const settings = s ? { _id: s._id, _type: s._type, footer: s.footer, social: s.social } : null;
  return <Footer lead={lead} settings={settings} contactForm={formData as CONTACT_FORM_QUERY_RESULT} staticTone={staticTone} />;
}
