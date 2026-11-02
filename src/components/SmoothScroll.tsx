"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);
/** Instance Lenis courante (null avant le montage ou hors du provider). */
export const useLenis = () => useContext(LenisContext);

/**
 * Position de défilement d'une ancre. Une section épinglée se mesure sur son emplacement réservé
 * (.pin-spacer), pas sur elle-même : une fois dépassée, elle s'y trouve décalée. Avec
 * [data-anchor-end], on vise la fin de son glissement : le pied de page entre de droite à gauche,
 * son contenu n'est visible qu'à la fin.
 */
function anchorY(target: HTMLElement) {
  if (target.hasAttribute("data-anchor-end")) {
    const slides = ScrollTrigger.getAll().filter((st) => st.trigger === target && st.animation);
    if (slides.length) return Math.max(...slides.map((st) => st.end));
  }
  const box = target.closest(".pin-spacer") ?? target;
  return box.getBoundingClientRect().top + window.scrollY;
}

/** Smooth scroll Lenis synchronisé avec le ticker GSAP / ScrollTrigger ; gère aussi tous les liens d'ancre du site. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.1, smoothWheel: !reduce });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = lenis;

    // La hauteur de page change (accordéon, images) : on recalcule les sections épinglées
    let timer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);

    // Liens d'ancre de la page courante (menu, boutons)
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = (e.target as Element).closest?.("a[href]")?.getAttribute("href") ?? "";
      const id = /^(\/)?#(.+)$/.exec(href);
      if (!id || (id[1] && location.pathname !== "/")) return;
      const target = document.getElementById(id[2]);
      if (!target) return;
      e.preventDefault();
      lenis.start();
      lenis.scrollTo(anchorY(target), { duration: 1.4, force: true, immediate: reduce });
    };
    document.addEventListener("click", onClick);

    // Arrivée depuis une autre page (/#expertises) : le navigateur a visé l'ancre avant que les
    // sections épinglées réservent leur place. Elles s'installent par vagues : on recale après
    // chaque recalcul, pendant 3 s au plus, tant que le visiteur n'a pas repris la main.
    let arrival = 0;
    const onRefresh = () => {
      clearTimeout(arrival);
      arrival = window.setTimeout(() => {
        const target = document.getElementById(location.hash.slice(1));
        if (target) lenis.scrollTo(anchorY(target), { immediate: true, force: true });
      }, 250);
    };
    const stopArrival = () => {
      clearTimeout(arrival);
      clearTimeout(arrivalEnd);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      removeEventListener("wheel", stopArrival);
      removeEventListener("touchstart", stopArrival);
    };
    let arrivalEnd = 0;
    if (location.hash) {
      ScrollTrigger.addEventListener("refresh", onRefresh);
      addEventListener("wheel", stopArrival, { passive: true });
      addEventListener("touchstart", stopArrival, { passive: true });
      arrivalEnd = window.setTimeout(stopArrival, 3000);
      onRefresh();
    }

    return () => {
      document.removeEventListener("click", onClick);
      stopArrival();
      ro.disconnect();
      clearTimeout(timer);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
