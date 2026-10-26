import type { CSSProperties } from "react";
import { hero } from "@/content/accueil";
import RichText from "@/components/RichText";
import Constellation from "./Constellation";
import styles from "./HeroPanel.module.css";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

/** Lame 01 · Hero (maquette « Section1 - Option2 »). */
export default function HeroPanel() {
  return (
    <section className={styles.hero} data-panel data-tone="dark" aria-labelledby="hero-title">
      <div className={styles.bg} aria-hidden="true" />
      <Constellation className={styles.constellation} />
      <div className="fx-grain" aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>
          {hero.eyebrow.map((w, i) => (
            <span key={w} className={styles.ln}>
              <span style={delay(i)}>{w}</span>
            </span>
          ))}
        </p>
        <h1 id="hero-title" className={styles.title}>
          {hero.titleLines.map((l, i) => (
            <span key={l} className={`${styles.ln} ${styles.h1}`}>
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
          <RichText text={hero.text} />
        </p>
        <div className={`${styles.btns} ${styles.fade}`} style={delay(7)}>
          <a href={hero.ctaPrimary.href} className="btn btn-primary">{hero.ctaPrimary.label}</a>
          <a href={hero.ctaSecondary.href} className="btn btn-light">{hero.ctaSecondary.label}</a>
        </div>
      </div>
    </section>
  );
}
