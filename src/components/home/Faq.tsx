"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { faq } from "@/content/accueil";
import styles from "./Faq.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bloc 9.9 · FAQ (maquette « FAQ ») : accordéon, première question ouverte, une seule ouverte
 * à la fois ; les réponses sont dans le HTML dès le chargement (référencement).
 */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current!;
    // Header en blanc sur ce fond sombre
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 60px",
      end: "bottom 60px",
      onToggle: (self) => {
        if (self.isActive) requestAnimationFrame(() => (document.body.dataset.tone = "dark"));
      },
    });
    // Révélation des lignes à l'entrée dans l'écran
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          root.classList.add(styles.in);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(root);
    return () => {
      st.kill();
      io.disconnect();
    };
  }, []);

  return (
    <section ref={ref} id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className="fx-grain" aria-hidden="true" />
      <h2 id="faq-title" className={styles.title}>
        {faq.title.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </h2>

      <ul className={styles.list}>
        {faq.items.map((item, i) => {
          const isOpen = open === i;
          const id = `faq-${i + 1}`;
          return (
            <li key={item.q} className={`${styles.item} ${isOpen ? styles.open : ""}`} style={{ "--i": i } as React.CSSProperties}>
              <h3>
                <button
                  type="button"
                  className={styles.row}
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}.</span>
                  <span className={styles.q}>{item.q}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </button>
              </h3>
              <div id={id} className={styles.panel} role="region" aria-label={item.q}>
                <div className={styles.inner}>
                  <p className={styles.a}>{item.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
