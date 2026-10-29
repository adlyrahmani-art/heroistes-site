"use client";

import { useEffect, useRef } from "react";
import styles from "./WaveWord.module.css";

// Effet repris du chiffre « 90 » de vintage.agency (rubrique Recognition), relevé image par image :
// une « marée » monte du coin bas-droit vers le haut-gauche ; sous son front le mot est révélé,
// et 3 rubans ondulés la précèdent, s'écartant et s'épaississant à mesure qu'elle monte.

const DURATION = 1300;
const FPS_STEP = 1000 / 30;
// Proportions relevées sur la référence, rapportées à la largeur du mot (hauteur = 100)
const RISE = 34; // montée des vagues de gauche à droite sur toute la largeur
const BUMPS = 2.2; // nombre d'ondulations sur la largeur
const AMP = 4; // ondulation en « marches » : paliers presque plats puis montée

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Masque SVG à l'instant p (0 → caché, 1 → entièrement visible) ; ar = largeur / hauteur du mot. */
function waveMask(p: number, ar: number) {
  if (p >= 1) return "";
  const W = 100 * ar;
  const slope = RISE / W;
  const period = W / BUMPS;
  const e = easeInOut(p);
  const from = 100 + RISE + 22; // tout est encore sous le coin bas-droit
  const to = -AMP - 2; // le front a dépassé le coin haut-gauche
  const y0 = from + (to - from) * e;
  const line = (off: number) => {
    let d = "";
    for (let x = -6; x <= W + 6; x += W / 80) {
      const y = y0 - off - slope * x + AMP * Math.sin((2 * Math.PI * x) / period);
      d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(2)}`;
    }
    return d;
  };
  // Zone révélée sous le front
  let shapes = `<path d='${line(0)}L${W + 6} 200L-6 200Z'/>`;
  // Rubans d'écume au-dessus du front
  const spacing = 5 + 12 * e;
  for (let k = 1; k <= 3; k++) {
    const th = (3.5 + 5.5 * e) * (1 - 0.15 * (k - 1));
    shapes += `<path d='${line(k * spacing)}' fill='none' stroke='white' stroke-width='${th.toFixed(2)}'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W.toFixed(1)} 100' preserveAspectRatio='none'><g fill='white'>${shapes}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

type Props = { text: string; className?: string; speed?: string; dataSanity?: string };

/** Mot fantôme géant révélé par des vagues à chaque entrée dans l'écran (décoratif, aria-hidden). */
export default function WaveWord({ text, className, speed, dataSanity }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const inner = el.firstElementChild as HTMLElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let delay = 0;
    const set = (p: number) => {
      inner.style.maskImage = waveMask(p, inner.offsetWidth / Math.max(inner.offsetHeight, 1));
    };
    set(0);

    const play = () => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      let last = -Infinity;
      const step = (t: number) => {
        const p = Math.min((t - start) / DURATION, 1);
        if (t - last >= FPS_STEP || p === 1) {
          last = t;
          set(p);
        }
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    // Rejoue à chaque passage : caché hors écran, révélé un peu après l'arrivée de la lame
    const io = new IntersectionObserver(
      ([e]) => {
        clearTimeout(delay);
        if (e.isIntersecting) delay = window.setTimeout(play, 350);
        else {
          cancelAnimationFrame(raf);
          set(0);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(delay);
    };
  }, []);

  return (
    <span ref={ref} className={`${styles.word} ${className ?? ""}`} data-speed={speed} data-sanity={dataSanity} aria-hidden="true">
      <span className={styles.inner}>{text}</span>
    </span>
  );
}
