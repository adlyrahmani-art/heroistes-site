"use client";

import { useEffect, useRef } from "react";
import styles from "./GlitchWord.module.css";

// Effet repris de vintage.agency (« 2006 », rubrique Beginning) : le mot est découpé en colonnes
// qui glissent l'une après l'autre à l'apparition, puis un masque en blocs le « pixellise »
// brièvement au survol et toutes les 10 à 20 s.

const COLS = 4;
const GRID_ROWS = 14;
const GRID_COLS = 40;
const GLITCH_MS = 350;

/** Masque SVG blanc percé de blocs aléatoires ; `amount` = part de blocs retirés. */
function blockMask(amount: number) {
  let rects = "";
  for (let y = 0; y < GRID_ROWS; y++) {
    // Les blocs vont par bandes horizontales, comme une ligne vidéo qui décroche
    if (Math.random() > amount * 1.6) continue;
    let x = 0;
    while (x < GRID_COLS) {
      const w = 1 + Math.floor(Math.random() * 6);
      if (Math.random() < amount) rects += `<rect x='${x}' y='${y}' width='${w}' height='1'/>`;
      x += w;
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${GRID_COLS} ${GRID_ROWS}' preserveAspectRatio='none'><rect width='100%' height='100%' fill='white'/><g fill='black'>${rects}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

type Props = { text: string; className?: string; speed?: string };

/** Mot fantôme géant : colonnes qui glissent à l'entrée + glitch en blocs (décoratif, aria-hidden). */
export default function GlitchWord({ text, className, speed }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const copies = [...root.querySelectorAll<HTMLElement>("[data-copy]")];
    const panel = root.closest<HTMLElement>("[data-panel]") ?? root;

    let busyUntil = 0;
    let frame = 0;
    let raf = 0;
    let timer = 0;
    let visible = false;

    const restore = () => {
      for (const c of copies) {
        c.style.maskImage = "";
        c.style.translate = "";
      }
    };

    const glitch = () => {
      const now = performance.now();
      if (!visible || now < busyUntil || !panel.classList.contains("is-in")) return;
      busyUntil = now + GLITCH_MS * 2;
      const start = now;
      let last = 0;
      const step = (t: number) => {
        const p = (t - start) / GLITCH_MS;
        if (p >= 1) return restore();
        // ~16 images/s, intensité décroissante
        if (t - last > 60) {
          last = t;
          const amount = 0.45 * (1 - p);
          for (const c of copies) {
            c.style.maskImage = blockMask(amount);
            c.style.translate = `${(Math.random() - 0.5) * 6 * amount}% 0`;
          }
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const schedule = () => {
      timer = window.setTimeout(() => {
        glitch();
        schedule();
      }, 10000 + Math.random() * 10000);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      // Premier glitch peu après l'apparition des colonnes
      if (visible) {
        clearTimeout(frame);
        frame = window.setTimeout(glitch, 1400);
      }
    });
    io.observe(root);
    panel.addEventListener("pointermove", glitch);
    schedule();

    return () => {
      io.disconnect();
      panel.removeEventListener("pointermove", glitch);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearTimeout(frame);
      restore();
    };
  }, []);

  return (
    <span ref={ref} className={`${styles.word} ${className ?? ""}`} data-speed={speed} aria-hidden="true">
      <span className={styles.sizer}>{text}</span>
      {Array.from({ length: COLS }, (_, i) => (
        <span
          key={i}
          className={styles.col}
          style={{ clipPath: `inset(-20% ${100 - ((i + 1) * 100) / COLS}% -20% ${(i * 100) / COLS}%)` }}
        >
          <span className={styles.copy} data-copy style={{ "--i": i } as React.CSSProperties}>
            <span className={styles.slide}>{text}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
