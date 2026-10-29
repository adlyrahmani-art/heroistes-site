"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import RichText from "@/components/RichText";
import { useLenis } from "@/components/SmoothScroll";
import type { CaseCta as Cta, CaseExtras } from "@/content/cases";
import styles from "./CaseEnd.module.css";

/**
 * Appel final + projets précédent / suivant (maquette « Praneo CTA FInal », 1920 × 1275, sombre).
 * Entrée verticale comme les lames de l'accueil : les lignes du titre montent hors d'un masque
 * (décalées), la barre se dessine, puis sous-titre, texte et bouton suivent.
 * Projets voisins : au survol (ou focus clavier) le portrait apparaît derrière le nom et le fond
 * fonce légèrement (effet des projets liés de m-n.fr, CSS seul).
 */
export default function CaseCta({ cta, nav }: { cta?: Cta; nav?: CaseExtras["nav"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenisRef = useLenis();

  useEffect(() => {
    const top = ref.current;
    if (!top || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Masqué seulement une fois le script prêt (sans JavaScript, tout reste visible)
    top.dataset.ready = "";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        top.dataset.shown = "";
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(top);
    return () => {
      io.disconnect();
      delete top.dataset.ready;
      delete top.dataset.shown;
    };
  }, []);

  // Ancre interne (#contact, le formulaire du footer) : défilement doux par Lenis, comme le menu
  const onAnchor = (e: MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href") ?? "";
    const target = href.startsWith("#") ? document.querySelector<HTMLElement>(href) : null;
    const lenis = lenisRef?.current;
    if (!target || !lenis) return;
    e.preventDefault();
    lenis.scrollTo(target, { duration: 1.4 });
    history.replaceState(null, "", href);
  };

  const items = [nav?.prev, nav?.next].filter((n) => !!n);

  return (
    <section className={styles.cta} data-case-dark aria-labelledby={cta ? "cta-title" : undefined} aria-label={cta ? undefined : "Autres projets"}>
      {cta && (
        <div ref={ref} className={styles.ctaTop}>
          <h2 id="cta-title" className={styles.ctaTitle}>
            {cta.title.map((line, i) => (
              <span key={i} className={styles.ln} style={{ "--i": i } as React.CSSProperties}>
                <span>
                  {line.map((p, j) => (p.accent ? <em key={j}>{p.text}</em> : <span key={j}>{p.text}</span>))}
                </span>
              </span>
            ))}
          </h2>
          <p className={styles.ctaSubtitle}>
            {cta.subtitle.map((l, i) => (
              <span key={i}>
                {i ? " " : ""}
                <RichText text={l} />
              </span>
            ))}
          </p>
          <span className={styles.ctaBar} aria-hidden="true" />
          <p className={styles.ctaText}>{cta.text}</p>
          <a href={cta.button.href} className={`btn btn-primary ${styles.ctaButton}`} onClick={onAnchor}>
            {cta.button.label}
          </a>
        </div>
      )}

      {items.length > 0 && (
        <nav className={styles.nav} aria-label="Autres projets">
          {items.map((n) => (
            <a key={n.href} href={n.href} className={styles.navItem}>
              <span className={styles.navGroup}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.navImg} src={n.image} alt="" width={280} height={386} loading="lazy" />
                <span className={styles.navLabel}>{n.label}</span>
                <span className={styles.navName}>{n.name}</span>
              </span>
            </a>
          ))}
        </nav>
      )}
    </section>
  );
}
