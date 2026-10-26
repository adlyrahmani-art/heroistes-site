import { besoins } from "@/content/accueil";
import styles from "./Besoins.module.css";

/** Bloc 9.3 · Vos besoins, nos solutions : 6 cartes cliquables en entier. */
export default function Besoins() {
  return (
    <section id="besoins" className={styles.section} aria-labelledby="besoins-title">
      <div className={styles.head}>
        <p className={styles.num}>03.</p>
        <h2 id="besoins-title" className={styles.title}>{besoins.title}</h2>
        <p className={styles.intro}>{besoins.intro}</p>
      </div>
      <ul className={styles.grid}>
        {besoins.cards.map((c, i) => (
          <li key={c.offer}>
            <a href={c.href} className={styles.card}>
              <span className={styles.idx}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardText}>{c.text}</p>
              <span className={styles.more}>
                Découvrir l’offre<span className="visually-hidden"> {c.offer}</span> →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
