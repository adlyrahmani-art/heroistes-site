import type { Engagement } from "@/content/accueil";
import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import GlitchWord from "./GlitchWord";
import styles from "./EngagementPanel.module.css";

/** Lame d'un engagement (maquettes Section2-1*) : titre d'un côté de la ligne centrale, texte et photo de l'autre. */
export default function EngagementPanel({ item }: { item: Engagement }) {
  return (
    <article
      className={`${styles.panel} ${item.side === "left" ? styles.titleLeft : styles.titleRight}`}
      data-panel
      data-reveal
      data-tone="light"
      aria-labelledby={`eng-${item.num}`}
    >
      <span className={styles.axis} aria-hidden="true" />
      <GlitchWord text={item.ghost} className={styles.ghost} speed="0.18" />

      <div className={styles.head}>
        <p className={styles.num}>{item.num}</p>
        <h3 id={`eng-${item.num}`} className={styles.title}>
          {item.title.map((l) => (
            <span key={l} className={styles.ln}>
              <span>{l}</span>
            </span>
          ))}
        </h3>
      </div>

      <div className={styles.body}>
        <p className={styles.text}>
          <RichText text={item.text} />
        </p>
        <figure className={styles.photo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.imageAlt} loading="lazy" />
        </figure>
      </div>

      <a href="#expertises" className={`btn btn-ghost ${styles.cta}`}>Découvrez nos expertises</a>
      <a href="#cas-clients" className={styles.cases}>
        <small>Voir nos</small>
        Cas clients
      </a>
      <Bolt className={styles.bolt} />
    </article>
  );
}
