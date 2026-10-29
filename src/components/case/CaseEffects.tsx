"use client";

import { useEffect } from "react";

/**
 * Comportements de la page détail cas client, sans rendu :
 * - ton du header : blanc tant que l'en-tête sombre passe sous le header, encre ensuite
 *   (même mécanique que l'accueil : body[data-tone], lue par Header.module.css) ;
 * - entrées légères des blocs [data-in] du conteneur [data-reveal] (désactivées si mouvement réduit).
 */
export default function CaseEffects() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-case-hero]");
    const HEADER_LINE = 60; // bas du header : là où on lit la couleur du fond
    let frame = 0;
    const update = () => {
      frame = 0;
      const dark = !!hero && hero.getBoundingClientRect().bottom > HEADER_LINE;
      document.body.dataset.tone = dark ? "dark" : "light";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);

    const root = document.querySelector<HTMLElement>("[data-reveal]");
    let io: IntersectionObserver | undefined;
    if (root && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            (e.target as HTMLElement).dataset.shown = "";
            io!.unobserve(e.target);
          }),
        { threshold: 0.1 },
      );
      root.querySelectorAll("[data-in]").forEach((el) => io!.observe(el));
      root.dataset.ready = "";
    }

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      io?.disconnect();
      delete root?.dataset.ready;
      delete document.body.dataset.tone;
    };
  }, []);

  return null;
}
