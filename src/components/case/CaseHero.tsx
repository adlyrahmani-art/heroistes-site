import type { CSSProperties } from "react";
import RichText from "@/components/RichText";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { CaseData, CaseDoc } from "./caseTypes";
import styles from "./CaseHero.module.css";

/**
 * En-tête sombre : fond en niveaux de gris, trait central, colonne de droite (logo, nom, sous-titre, intro, points forts).
 * Logo : celui de l'en-tête (forme libre, affiché tel quel à sa taille réelle à 1920) s'il existe, sinon celui de la
 * carte dans un disque. Le nom peut avoir une seconde ligne plus petite (« France »).
 */
export default function CaseHero({ c, doc, hideHighlights }: { c: CaseData; doc: CaseDoc; hideHighlights?: boolean }) {
  const hero = c.detailHero;
  const highlights = hero?.highlights?.length ? hero.highlights : c.highlights;
  // Fond : celui de la page détail, sinon le fond flouté de la carte
  const bgField = hero?.background?.asset ? "detailHero.background" : "background";
  const bg = hero?.background?.asset ? hero.background : c.background;
  const bgSrc = imageUrl(bg, 1920, 883);

  const free = hero?.logo?.asset ? hero.logo : undefined;
  const dims = free?.asset?.metadata?.dimensions;
  const freeW = Math.round(dims?.width ?? 200);
  const freeH = Math.round(dims?.height ?? 80);
  // Logo libre : PNG transparent découpé à 1:1 dans la maquette 1920, servi à sa taille native (sans recadrage)
  const freeSrc = free ? imageUrl(free, freeW) : undefined;
  const discSrc = free ? undefined : imageUrl(c.logo, 248, 248);
  const nameLine2 = hero?.nameLine2;

  return (
    <section className={styles.hero} data-case-hero aria-labelledby="case-title">
      {bgSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.bg}
          src={bgSrc}
          alt={clean(bg?.alt) ?? ""}
          fetchPriority="high"
          data-sanity={editAttr(doc, bgField)}
        />
      )}
      <span className={styles.axis} aria-hidden="true" />
      <div className={`${styles.col} ${free ? styles.free : ""}`}>
        <div className={styles.head}>
          {freeSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.logoFree}
              src={freeSrc}
              alt={clean(free?.alt) ?? ""}
              width={freeW}
              height={freeH}
              style={{ "--lw": freeW } as CSSProperties}
              data-sanity={editAttr(doc, "detailHero.logo")}
            />
          )}
          {discSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.logo}
              src={discSrc}
              alt={clean(c.logo?.alt) ?? ""}
              width={123}
              height={123}
              data-sanity={editAttr(doc, "logo")}
            />
          )}
          <h1 id="case-title" className={`${styles.name} ${nameLine2 ? styles.twoLines : ""}`}>
            <span>{c.clientName}</span>
            {nameLine2 && <span className={styles.nameLine2}> {nameLine2}</span>}
          </h1>
          {!!hero?.subtitle?.length && (
            <p className={styles.subtitle}>
              {hero.subtitle.map((l, i) => (
                <span key={i}>{i ? " " : ""}{l}</span>
              ))}
            </p>
          )}
        </div>
        {hero?.intro && (
          <p className={styles.intro}>
            <RichText text={hero.intro} />
          </p>
        )}
        {!hideHighlights && !!highlights?.length && (
          <ul className={styles.highlights}>
            {highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
