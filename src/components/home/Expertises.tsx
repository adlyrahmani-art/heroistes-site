import { expertises, type Expertise } from "@/content/accueil";
import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import HorizontalScroll from "./HorizontalScroll";
import styles from "./Expertises.module.css";

/** Carte d'expertise : sombre au repos ; au survol un voile clair monte et révèle le texte (réf. m-n.fr Manifesto). */
function Card({ item, num, i }: { item: Expertise; num: number; i: number }) {
  return (
    <article
      className={styles.card}
      style={{ "--i": i } as React.CSSProperties}
      data-cursor="card"
      tabIndex={item.link ? undefined : 0}
      aria-labelledby={`exp-${num}`}
    >
      <span className={styles.num} aria-hidden="true">
        {String(num).padStart(2, "0")}.
      </span>
      <div className={styles.desc}>
        <p>
          <strong>{item.lead}</strong>
          {item.text && <> {item.text}</>}
          {item.link && (
            <>
              {" "}
              {item.link.before}{" "}
              <a href={item.link.href} className={styles.link}>
                {item.link.label}
              </a>
              .
            </>
          )}
        </p>
      </div>
      <h3 id={`exp-${num}`} className={styles.cardTitle}>
        {item.title.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </h3>
    </article>
  );
}

/** Bloc 9.4 · Expertises : titre, présentation, puis les deux lignes de cartes, en défilement horizontal. */
export default function Expertises() {
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
          {expertises.title.map((l) => (
            <span key={l} className={styles.ln}>
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
            <RichText text={expertises.intro} />
          </p>
        </div>
        <figure className={styles.photo} data-speed="0.06">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={expertises.image} alt="Mains sur une machine à écrire ancienne" width={535} height={581} loading="lazy" />
        </figure>
        <Bolt className={styles.bolt} />
      </div>

      {/* Lignes de cartes (maquettes « Expertises Cards Ligne 1 / 2 ») */}
      <div className={`${styles.panel} ${styles.cardsPanel}`} data-panel data-reveal data-tone="dark">
        <p className="visually-hidden">Ligne 1 : stratégie</p>
        <div className={styles.cards}>
          {expertises.strategy.map((e, i) => (
            <Card key={e.title.join(" ")} item={e} num={i + 1} i={i} />
          ))}
        </div>
        <Bolt className={styles.bolt} />
      </div>
      <div className={`${styles.panel} ${styles.cardsPanel}`} data-panel data-reveal data-tone="dark">
        <p className={styles.rollout}>{expertises.rollout}</p>
        <div className={styles.cards}>
          {expertises.delivery.map((e, i) => (
            <Card key={e.title.join(" ")} item={e} num={i + 4} i={i} />
          ))}
        </div>
        <Bolt className={styles.bolt} />
      </div>
    </HorizontalScroll>
  );
}
