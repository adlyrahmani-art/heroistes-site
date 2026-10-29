import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import HorizontalScroll from "./HorizontalScroll";
import type { ExpertiseCardData, ExpertisesData, HomeDoc } from "./homeTypes";
import styles from "./Expertises.module.css";

/** Carte d'expertise : sombre au repos ; au survol un voile clair monte et révèle le texte (réf. m-n.fr Manifesto). */
function Card({ item, num, i }: { item: ExpertiseCardData; num: number; i: number }) {
  const href = clean(item.link?.href ?? "");
  const link = item.link?.label && href ? { before: item.link.before, label: item.link.label, href } : null;
  return (
    <article
      className={styles.card}
      style={{ "--i": i } as React.CSSProperties}
      data-cursor="card"
      tabIndex={link ? undefined : 0}
      aria-labelledby={`exp-${num}`}
    >
      <span className={styles.num} aria-hidden="true">
        {String(num).padStart(2, "0")}.
      </span>
      <div className={styles.desc}>
        <p>
          <strong>{item.lead}</strong>
          {item.text && <> {item.text}</>}
          {link && (
            <>
              {" "}
              {link.before}{" "}
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
              .
            </>
          )}
        </p>
      </div>
      <h3 id={`exp-${num}`} className={styles.cardTitle}>
        {item.title?.map((l, k) => (
          <span key={k}>{l}</span>
        ))}
      </h3>
    </article>
  );
}

/** Bloc 9.4 · Expertises : titre, présentation, puis les deux lignes de cartes, en défilement horizontal. */
export default function Expertises({ expertises, doc }: { expertises: ExpertisesData; doc: HomeDoc }) {
  const cards = expertises.cards ?? [];
  // Ratio de la photo : 535 / 581 (×2 pour la netteté), le point focal s'applique.
  const photo = imageUrl(expertises.image, 1070, 1162);
  return (
    <HorizontalScroll
      id="expertises"
      label="Nos expertises"
      background={
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/expertises-bg.jpg" alt="" className={styles.bgImg} />
      }
    >
      {/* Lame titre (maquette « Expertises - Titre ») */}
      <div className={`${styles.panel} ${styles.titlePanel}`} data-panel data-reveal data-tone="dark">
        <div className="fx-grain" aria-hidden="true" />
        <h2 className={styles.title} data-speed="-0.1">
          {expertises.title?.map((l, k) => (
            <span key={k} className={styles.ln}>
              <span>{l}</span>
            </span>
          ))}
          <span className={styles.bar} aria-hidden="true" />
        </h2>
      </div>

      {/* Lame présentation (maquette « Expertises - Details ») */}
      <div className={`${styles.panel} ${styles.details}`} data-panel data-reveal data-tone="dark">
        <div className={styles.detailsText}>
          <p className={styles.heading}>
            <span className={styles.ln}>
              <span>{expertises.heading}</span>
            </span>
          </p>
          <p className={styles.intro}>
            <RichText text={expertises.intro ?? ""} />
          </p>
        </div>
        <figure className={styles.photo} data-speed="0.06" data-sanity={editAttr(doc, "expertises.image")}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={clean(expertises.image?.alt ?? "")} width={535} height={581} loading="lazy" />
          )}
        </figure>
        <Bolt className={styles.bolt} />
      </div>

      {/* Lignes de cartes (maquettes « Expertises Cards Ligne 1 / 2 ») */}
      <div className={`${styles.panel} ${styles.cardsPanel}`} data-panel data-reveal data-tone="dark">
        <p className="visually-hidden">Ligne 1 : stratégie</p>
        <div className={styles.cards}>
          {cards.slice(0, 3).map((e, i) => (
            <Card key={clean(e._key)} item={e} num={i + 1} i={i} />
          ))}
        </div>
        <Bolt className={styles.bolt} />
      </div>
      <div className={`${styles.panel} ${styles.cardsPanel}`} data-panel data-reveal data-tone="dark">
        <p className="visually-hidden">Ligne 2 : mise en œuvre</p>
        <div className={styles.cards}>
          {cards.slice(3, 6).map((e, i) => (
            <Card key={clean(e._key)} item={e} num={i + 4} i={i} />
          ))}
        </div>
        <Bolt className={styles.bolt} />
      </div>
    </HorizontalScroll>
  );
}
