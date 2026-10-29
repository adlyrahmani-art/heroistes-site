import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import WaveWord from "./WaveWord";
import type { EngagementData, HomeDoc } from "./homeTypes";
import styles from "./EngagementPanel.module.css";

/** Lame d'un engagement (maquettes Section2-1*) : titre d'un côté de la ligne centrale, texte et photo de l'autre. */
export default function EngagementPanel({ item, index, doc }: { item: EngagementData; index: number; doc: HomeDoc }) {
  const key = clean(item._key);
  const path = (field: string) => `engagements[_key=="${key}"].${field}`;
  const num = `${String(index + 1).padStart(2, "0")}.`;
  const id = `eng-${index + 1}`;
  // Ratio de la photo : 536 / 321 (×2 pour la netteté), le point focal s'applique.
  const photo = imageUrl(item.image, 1072, 642);

  return (
    <article
      className={`${styles.panel} ${clean(item.side) === "left" ? styles.titleLeft : styles.titleRight}`}
      data-panel
      data-reveal
      data-tone="light"
      aria-labelledby={id}
    >
      <span className={styles.axis} aria-hidden="true" />
      <WaveWord
        text={clean(item.ghost ?? "")}
        className={styles.ghost}
        speed="0.18"
        dataSanity={editAttr(doc, path("ghost"))}
      />

      <div className={styles.head}>
        <p className={styles.num}>{num}</p>
        <h3 id={id} className={styles.title}>
          {item.title?.map((l, i) => (
            <span key={i} className={styles.ln}>
              <span>{l}</span>
            </span>
          ))}
        </h3>
      </div>

      <div className={styles.body}>
        <p className={styles.text}>
          <RichText text={item.text ?? ""} />
        </p>
        <figure className={styles.photo} data-sanity={editAttr(doc, path("image"))}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={clean(item.image?.alt ?? "")} loading="lazy" />
          )}
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
