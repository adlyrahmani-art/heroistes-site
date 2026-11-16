import type { CSSProperties } from "react";
import RichText from "@/components/RichText";
import { clean } from "@/sanity/lib/clean";
import Constellation from "./Constellation";
import HeroImage from "./HeroImage";
import type { HeroData } from "./homeTypes";
import styles from "./HeroPanel.module.css";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

// Photo de fond statique (maquette « Section1 -Header - Piste 1 Le héros dans la foule ») : prime sur l'image Sanity.
const photo = "/images/hero-bg.jpg";

/** Lame 01 · Hero (maquette « Section1 -Header - Piste 1 Le héros dans la foule »). */
export default function HeroPanel({ hero }: { hero: HeroData }) {

  return (
    <section className={styles.hero} data-panel data-tone="dark" aria-labelledby="hero-title">
      <div className={styles.bg} aria-hidden="true" />
      <HeroImage src={photo} maskSrc="/images/hero-mask.png" className={styles.photo} />
      <Constellation className={styles.constellation} />
      <div className="fx-grain" aria-hidden="true" />

      <div className={styles.content}>
        {!!hero.eyebrow?.length && (
          <p className={styles.eyebrow}>
            {hero.eyebrow.map((w, i) => (
              <span key={i} className={styles.ln}>
                <span style={delay(i)}>{w}</span>
              </span>
            ))}
          </p>
        )}
        <h1 id="hero-title" className={styles.title}>
          {hero.titleLines?.map((l, i) => (
            <span key={i} className={`${styles.ln} ${styles.h1}`}>
              <span style={delay(i + 2)}>{l}</span>
            </span>
          ))}
          {(hero.subtitle || hero.highlight) && (
            <span className={`${styles.ln} ${styles.h2}`}>
              <span style={delay(4)}>
                {hero.subtitle} {hero.highlight && <span className={styles.hl}>{hero.highlight}</span>}
              </span>
            </span>
          )}
        </h1>
        <p className={`${styles.text} ${styles.fade}`} style={delay(6)}>
          <RichText text={hero.text ?? ""} />
        </p>
        <div className={`${styles.btns} ${styles.fade}`} style={delay(7)}>
          {hero.ctaPrimary && (
            <a href={clean(hero.ctaPrimary.href)} className="btn btn-primary">{hero.ctaPrimary.label}</a>
          )}
          {hero.ctaSecondary && (
            <a href={clean(hero.ctaSecondary.href)} className={`btn btn-light ${styles.ghost}`}>{hero.ctaSecondary.label}</a>
          )}
        </div>
      </div>
    </section>
  );
}
