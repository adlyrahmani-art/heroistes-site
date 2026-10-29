import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ToneLight from "@/components/ToneLight";
import { cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { HOME_QUERY } from "@/sanity/lib/queries";
import type { HOME_QUERY_RESULT } from "../../sanity.types";
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
  const { data } = await cachedFetch({ query: HOME_QUERY, ...options });
  const lead = (data as HOME_QUERY_RESULT)?.contactLead?.lead ?? [];
  return (
    <>
      <ToneLight />
      <SiteHeader />
      <main className={styles.main}>
        <article className={styles.article}>
          <a className={styles.back} href={backHref}>
            ← {back}
          </a>
          {children}
        </article>
      </main>
      <SiteFooter lead={lead} />
    </>
  );
}
