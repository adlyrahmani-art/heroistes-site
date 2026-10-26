import { logos } from "@/content/accueil";
import styles from "./LogosBand.module.css";

/** Bloc 9.2 · Bandeau de preuves : logos clients en niveaux de gris, défilement continu (pause au survol). */
export default function LogosBand() {
  const row = (hidden: boolean) =>
    logos.clients.map((c) => (
      <li key={c.name} className={styles.logo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.src} alt={hidden ? "" : c.name} width={c.w} height={c.h} loading="lazy" />
      </li>
    ));
  return (
    <section className={styles.band} aria-label="Ils nous font confiance">
      <p className={styles.text}>{logos.text}</p>
      <div className={styles.marquee}>
        <ul className={styles.row}>{row(false)}</ul>
        <ul className={styles.row} aria-hidden="true">
          {row(true)}
        </ul>
      </div>
    </section>
  );
}
