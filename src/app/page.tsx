import Header from "@/components/Header";
import Hero from "@/components/hero/Hero";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Header />
      <main id="accueil">
        <Hero />
        {/* Lames suivantes à développer une par une (cf. brief, prochaine étape 4) */}
        <section id="expertises" className={styles.placeholder} aria-label="Expertises">
          <p className={styles.num}>02.</p>
          <h2 className={styles.title}>Expertises</h2>
          <p className={styles.note}>Lame à venir : cartes empilées sticky (réf. grenark).</p>
        </section>
      </main>
    </>
  );
}
