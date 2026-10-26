import { logos } from "@/content/accueil";
import styles from "./LogosBand.module.css";

/** Bloc 9.2 · Bandeau de preuves : noms clients en défilement continu (logos images à fournir). */
export default function LogosBand() {
  const row = logos.clients.map((c) => (
    <li key={c} className={styles.logo}>
      {c}
    </li>
  ));
  return (
    <section className={styles.band} aria-label="Ils nous font confiance">
      <p className={styles.text}>{logos.text}</p>
      <div className={styles.marquee}>
        <ul className={styles.row}>{row}</ul>
        <ul className={styles.row} aria-hidden="true">
          {row}
        </ul>
      </div>
    </section>
  );
}
