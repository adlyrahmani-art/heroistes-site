import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { CONTACT_LEAD_QUERY } from "@/sanity/lib/queries";
import type { CONTACT_LEAD_QUERY_RESULT } from "../../sanity.types";
import styles from "./DetailLayout.module.css";

/** Gabarit provisoire des pages détail : header, fond clair, retour à l'accueil, footer. */
export default async function DetailLayout({
  back,
  backHref,
  children,
}: {
  back: string;
  backHref: string;
  children: React.ReactNode;
}) {
  const options = await getDynamicFetchOptions();
  const { data } = await cachedFetch({ query: CONTACT_LEAD_QUERY, ...options });
  const lead = (data as CONTACT_LEAD_QUERY_RESULT)?.contactLead?.lead ?? [];
  return (
    <>
      <SiteHeader anchorBase="/" />
      <main className={styles.main} data-static-tone="light">
        <article className={styles.article}>
          <a className={styles.back} href={backHref}>
            ← {back}
          </a>
          {children}
        </article>
      </main>
      <SiteFooter lead={lead} staticTone="light" />
    </>
  );
}
