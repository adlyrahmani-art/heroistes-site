"use client";

import { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";

// Curseur immersif (réf. m-n.fr) aux couleurs de la charte : il suit la souris avec inertie
// et change de forme selon ce qu'il survole.
//   par défaut           point turquoise
//   sur du texte         barre de saisie turquoise à la hauteur du texte (ne masque jamais la lecture)
//   lien / bouton        anneau turquoise
//   [data-cursor=card]   grand anneau (laisse lire la carte)
//   [data-cursor=scroll] anneau turquoise « ← → » : la molette fait défiler la piste horizontale
// Désactivé sur écran tactile et si l'utilisateur limite les animations.

type State = "default" | "text" | "link" | "card" | "scroll";

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const el = ref.current!;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const target = { ...pos };
    let state: State = "default";
    let raf = 0;
    let shown = false;

    const setState = (s: State) => {
      if (s === state) return;
      state = s;
      el.dataset.state = s;
    };

    // Le pointeur est-il sur des lettres (et pas seulement dans le bloc) ? Renvoie la taille du texte.
    const textSizeAt = (x: number, y: number) => {
      const range = document.caretRangeFromPoint?.(x, y);
      const node = range?.startContainer;
      if (!range || !node || node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return 0;
      // La position renvoyée tombe entre deux lettres : on teste celle d'avant et celle d'après
      const len = node.textContent.length;
      const r = document.createRange();
      for (const i of [range.startOffset - 1, range.startOffset]) {
        if (i < 0 || i >= len) continue;
        r.setStart(node, i);
        r.setEnd(node, i + 1);
        const box = r.getBoundingClientRect();
        if (x >= box.left - 4 && x <= box.right + 4 && y >= box.top - 2 && y <= box.bottom + 2) {
          return parseFloat(getComputedStyle(node.parentElement!).fontSize);
        }
      }
      return 0;
    };

    const stateFor = (t: EventTarget | null): State => {
      if (!(t instanceof Element)) return "default";
      if (t.closest("a, button, [role=button], summary, label")) return "link";
      const size = textSizeAt(target.x, target.y);
      if (size) {
        el.style.setProperty("--caret", `${Math.min(Math.max(size * 1.1, 16), 140)}px`);
        return "text";
      }
      const zone = t.closest<HTMLElement>("[data-cursor]");
      return (zone?.dataset.cursor as State) ?? "default";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        pos.x = target.x;
        pos.y = target.y;
        shown = true;
        el.dataset.visible = "true";
      }
      setState(stateFor(e.target));
    };
    const onLeave = () => {
      shown = false;
      el.dataset.visible = "false";
    };
    const onDown = () => (el.dataset.pressed = "true");
    const onUp = () => (el.dataset.pressed = "false");

    let frame = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      // La piste horizontale glisse sous une souris immobile : on réévalue la cible régulièrement
      if (shown && ++frame % 8 === 0) setState(stateFor(document.elementFromPoint(target.x, target.y)));
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };
    loop();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={ref} className={styles.cursor} data-state="default" data-visible="false" aria-hidden="true">
      <div className={styles.caret} />
      <div className={styles.inner}>
        <svg className={styles.arrows} viewBox="0 0 34 12">
          <path d="M6 1 1 6l5 5M1 6h12M28 1l5 5-5 5M33 6H21" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
    </div>
  );
}
