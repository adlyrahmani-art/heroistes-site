"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RichText from "@/components/RichText";
import type { CaseResults as Results } from "@/content/cases";
import styles from "./CaseEnd.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * « Les premiers résultats » (maquette « Cas 1 _ Pranéo Intro », sous l'en-tête, sombre).
 * Entrée en parallaxe (ordinateur) : la section monte par-dessus l'en-tête, qui défile plus
 * lentement ; dans la section, lignes du titre et chiffres arrivent avec des décalages différents
 * (scrub), au repos quand la section atteint le haut de l'écran.
 * Les chiffres comptent une fois. Mouvement réduit : tout est simplement visible.
 */
export default function CaseResults({ results }: { results: Results }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Compteurs : seulement si la section n'a pas déjà été dépassée (sinon on garde la valeur finale)
    const counters = [...root.querySelectorAll<HTMLElement>("[data-count]")];
    let io: IntersectionObserver | undefined;
    if (root.getBoundingClientRect().bottom > 0) {
      counters.forEach((el) => (el.textContent = "0"));
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io!.disconnect();
          counters.forEach((el, i) => {
            const v = { n: 0 };
            gsap.to(v, {
              n: Number(el.dataset.count),
              duration: 1.6,
              delay: 0.15 * i,
              ease: "power2.out",
              onUpdate: () => (el.textContent = String(Math.round(v.n))),
            });
          });
        },
        { threshold: 0.35 },
      );
      io.observe(root);
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 1025px)": () => {
          // clamp : la section dépasse déjà en bas de l'écran au chargement, tout part de la position de repos
          const enter = { trigger: root, start: "clamp(top bottom)", end: "top top", scrub: true, invalidateOnRefresh: true };
          // L'en-tête défile plus lentement : la section sombre le recouvre
          const under = document.querySelector<HTMLElement>("[data-case-hero]");
          if (under) gsap.fromTo(under, { y: 0 }, { y: () => innerHeight * 0.45, ease: "none", scrollTrigger: enter });
          // Dans la section : chaque élément a son propre retard (vitesses différentes)
          gsap.utils.toArray<HTMLElement>("[data-depth]", root).forEach((el) => {
            const depth = Number(el.dataset.depth);
            gsap.fromTo(el, { y: () => innerHeight * depth }, { y: 0, ease: "none", scrollTrigger: enter });
          });
        },
      });
    }, root);

    return () => {
      io?.disconnect();
      ctx.revert();
      counters.forEach((el) => (el.textContent = el.dataset.count!));
    };
  }, []);

  return (
    <section ref={ref} className={styles.results} data-case-dark aria-labelledby="results-title">
      <div className={styles.resultsInner}>
        <div className={styles.resultsHead}>
          <h2 id="results-title" className={styles.resultsTitle}>
            {results.title.map((l, i) => (
              <span key={i} data-depth={0.12 + i * 0.1}>
                {i ? " " : ""}
                {l}
              </span>
            ))}
          </h2>
          <span className={styles.resultsBar} data-depth={0.42} aria-hidden="true" />
        </div>

        <div className={styles.resultsSide}>
          <ul className={styles.stats}>
            {results.stats.map((s, i) => (
              <li key={i} data-depth={0.22 + i * 0.08}>
                <p className={styles.num}>
                  <span className="visually-hidden">
                    {s.value}
                    {s.suffix}
                  </span>
                  <span aria-hidden="true">
                    <span data-count={s.value}>{s.value}</span>
                    {s.suffix === "+" ? <span className={styles.plus} /> : s.suffix && <span className={styles.suffix}>{s.suffix}</span>}
                  </span>
                </p>
                <p className={styles.statText}>
                  <RichText text={s.text} />
                </p>
              </li>
            ))}
          </ul>
          <p className={styles.summary} data-depth={0.5}>
            {results.summary}
          </p>
        </div>
      </div>
    </section>
  );
}
