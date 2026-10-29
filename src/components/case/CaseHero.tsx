import RichText from "@/components/RichText";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { CaseData, CaseDoc } from "./caseTypes";
import styles from "./CaseHero.module.css";

/** En-tête sombre : fond en niveaux de gris, trait central, colonne de droite (logo, nom, sous-titre, intro, points forts). */
export default function CaseHero({ c, doc }: { c: CaseData; doc: CaseDoc }) {
  const hero = c.detailHero;
  // Fond : celui de la page détail, sinon le fond flouté de la carte
  const bgField = hero?.background?.asset ? "detailHero.background" : "background";
  const bg = hero?.background?.asset ? hero.background : c.background;
  const bgSrc = imageUrl(bg, 1920, 883);
  const logo = imageUrl(c.logo, 248, 248);

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
      <div className={styles.col}>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.logo}
            src={logo}
            alt={clean(c.logo?.alt) ?? ""}
            width={123}
            height={123}
            data-sanity={editAttr(doc, "logo")}
          />
        )}
        <h1 id="case-title" className={styles.name}>
          {c.clientName}
        </h1>
        {!!hero?.subtitle?.length && (
          <p className={styles.subtitle}>
            {hero.subtitle.map((l, i) => (
              <span key={i}>{i ? " " : ""}{l}</span>
            ))}
          </p>
        )}
        {hero?.intro && (
          <p className={styles.intro}>
            <RichText text={hero.intro} />
          </p>
        )}
        {!!c.highlights?.length && (
          <ul className={styles.highlights}>
            {c.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
