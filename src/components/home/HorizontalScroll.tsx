"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./HorizontalScroll.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Piste horizontale épinglée (réf. m-n.fr) : la molette fait défiler les lames de gauche à droite.
 * Dans les lames :
 * - [data-panel]       une lame ; data-tone="light|dark" règle la couleur du header
 * - [data-reveal]      la lame reçoit la classe .is-in quand elle entre à l'écran
 * - [data-speed="0.2"] parallaxe horizontale (positif = plus lent que la piste)
 */
export default function HorizontalScroll({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const track = trackRef.current!;
    const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", track);
    const distance = () => track.scrollWidth - window.innerWidth;

    const setTone = (tone?: string) => {
      document.body.dataset.tone = tone ?? "dark";
    };
    // Lame sous le header (bord gauche de l'écran)
    const toneAt = (x: number) => {
      const p = panels.find((el) => el.offsetLeft <= x + 80 && el.offsetLeft + el.offsetWidth > x + 80);
      setTone(p?.dataset.tone);
    };

    const ctx = gsap.context(() => {
      const move = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => "+=" + distance(),
          invalidateOnRefresh: true,
          onUpdate: () => toneAt(-gsap.getProperty(track, "x") as number),
          onLeave: () => setTone("dark"),
          onEnterBack: () => toneAt(-gsap.getProperty(track, "x") as number),
        },
      });

      // Entrée des lames : titre d'abord, puis contenu (transitions CSS sur .is-in)
      panels.forEach((panel) => {
        if (!panel.matches("[data-reveal]")) return;
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: move,
          start: "left 70%",
          onEnter: () => panel.classList.add("is-in"),
        });
      });

      // Parallaxe : chaque calque glisse à sa propre vitesse pendant la traversée de sa lame
      gsap.utils.toArray<HTMLElement>("[data-speed]", track).forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0");
        const panel = el.closest<HTMLElement>("[data-panel]")!;
        gsap.fromTo(
          el,
          { x: () => speed * window.innerWidth },
          {
            x: () => -speed * window.innerWidth,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: move,
              start: "left right",
              end: "right left",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, wrap);

    setTone("dark");
    return () => {
      ctx.revert();
      delete document.body.dataset.tone;
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div ref={trackRef} className={styles.track}>
        {children}
      </div>
    </div>
  );
}
