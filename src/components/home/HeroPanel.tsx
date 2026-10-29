import type { CSSProperties } from "react";
import RichText from "@/components/RichText";
import { clean } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import Constellation from "./Constellation";
import HeroImage from "./HeroImage";
import { nativeSize, type HeroData } from "./homeTypes";
import styles from "./HeroPanel.module.css";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

/** Lame 01 · Hero (maquette « Section1 - Option2 »). */
export default function HeroPanel({ hero }: { hero: HeroData }) {
  // Toute l'image est conservée (le shader fait déjà son « cover ») : on garde le ratio natif.
  const size = nativeSize(hero.image?.asset);
  const photo = imageUrl(hero.image, 1920, size ? Math.round((1920 * size.h) / size.w) : undefined);

  return (
    <section className={styles.hero} data-panel data-tone="dark" aria-labelledby="hero-title">
      <div className={styles.bg} aria-hidden="true" />
      {photo && <HeroImage src={photo} className={styles.photo} />}
      <Constellation className={styles.constellation} />
      <div className="fx-grain" aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>
          {hero.eyebrow?.map((w, i) => (
            <span key={i} className={styles.ln}>
              <span style={delay(i)}>{w}</span>
            </span>
          ))}
        </p>
        <h1 id="hero-title" className={styles.title}>
          {hero.titleLines?.map((l, i) => (
            <span key={i} className={`${styles.ln} ${styles.h1}`}>
              <span style={delay(i + 2)}>{l}</span>
            </span>
          ))}
          <span className={`${styles.ln} ${styles.h2}`}>
            <span style={delay(4)}>
              {hero.subtitle} <span className={styles.hl}>{hero.highlight}</span>
            </span>
          </span>
        </h1>
        <p className={`${styles.text} ${styles.fade}`} style={delay(6)}>
          <RichText text={hero.text ?? ""} />
        </p>
        <div className={`${styles.btns} ${styles.fade}`} style={delay(7)}>
          {hero.ctaPrimary && (
            <a href={clean(hero.ctaPrimary.href)} className="btn btn-primary">{hero.ctaPrimary.label}</a>
          )}
          {hero.ctaSecondary && (
            <a href={clean(hero.ctaSecondary.href)} className="btn btn-light">{hero.ctaSecondary.label}</a>
          )}
        </div>
      </div>
    </section>
  );
}
