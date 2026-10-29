"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Tracé de la maquette « Section1 - Option2 » (repère 1920 × 1080).
// Le point 2 est le coude sans pastille ; les 4 autres sont les nœuds turquoise.
const POINTS: [number, number][] = [
  [1801, 223],
  [1248, 479],
  [1385, 532],
  [1243, 936],
  [1599, 769],
];
const DOTS = [0, 1, 3, 4];
// Mobile et tablette portrait : cadrage resserré sur la forme (placée dans l'espace vide en haut
// de la lame), pastilles agrandies pour rester visibles à cette échelle
const VIEW_COMPACT = "1150 140 740 880";
const PATH = [0, 1, 2, 3, 4, 0];

/**
 * Constellation animée en autonomie : les points arrivent, tracent les traits,
 * puis dérivent lentement en gardant la forme ; une onde part régulièrement des nœuds.
 */
export default function Constellation({ className }: { className?: string }) {
  const lineRef = useRef<SVGPolylineElement>(null);
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const [compact, setCompact] = useState(false);
  const dotR = compact ? 16 : 6;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const line = lineRef.current!;
    const dots = dotRefs.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pts = POINTS.map(([x, y]) => ({ x, y }));

    const draw = () => {
      line.setAttribute("points", PATH.map((i) => `${pts[i].x},${pts[i].y}`).join(" "));
      DOTS.forEach((p, k) => dots[k]?.setAttribute("transform", `translate(${pts[p].x} ${pts[p].y})`));
    };

    if (reduce) {
      draw();
      gsap.set(line, { strokeDashoffset: 0 });
      gsap.set(dots, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Départ : points dispersés autour de leur position finale
      const from = pts.map((p) => ({ x: p.x + gsap.utils.random(-260, 260), y: p.y + gsap.utils.random(-200, 200) }));
      pts.forEach((p, i) => Object.assign(p, from[i]));
      draw();

      const intro = gsap.timeline({ delay: 0.4, onUpdate: draw });
      intro
        .to(dots, { opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" }, 0)
        .to(pts, { x: (i) => POINTS[i][0], y: (i) => POINTS[i][1], duration: 2.2, stagger: 0.1, ease: "expo.out" }, 0)
        .to(line, { strokeDashoffset: 0, duration: 2.4, ease: "power3.inOut" }, 0.3);

      // Dérive continue : chaque point flotte autour de sa position
      intro.add(() => {
        pts.forEach((p, i) => {
          const [bx, by] = POINTS[i];
          const wander = () =>
            gsap.to(p, {
              x: bx + gsap.utils.random(-28, 28),
              y: by + gsap.utils.random(-22, 22),
              duration: gsap.utils.random(3, 5.5),
              ease: "sine.inOut",
              onComplete: wander,
            });
          wander();
        });
        gsap.ticker.add(draw);
      });

      // Onde sur un nœud au hasard, en boucle
      const pulse = () => {
        const g = dots[Math.floor(Math.random() * dots.length)];
        const ring = g?.querySelector("circle[data-ring]");
        const r0 = Number(ring?.getAttribute("data-r") ?? 6);
        if (ring) gsap.fromTo(ring, { attr: { r: r0 }, opacity: 0.9 }, { attr: { r: r0 * 7 }, opacity: 0, duration: 1.6, ease: "power2.out" });
        gsap.delayedCall(gsap.utils.random(0.9, 2), pulse);
      };
      gsap.delayedCall(2.6, pulse);
    });

    return () => {
      gsap.ticker.remove(draw);
      ctx.revert();
    };
  }, []);

  return (
    <svg
      className={className}
      viewBox={compact ? VIEW_COMPACT : "0 0 1920 1080"}
      preserveAspectRatio={compact ? "xMidYMid meet" : "xMaxYMid slice"}
      aria-hidden="true"
    >
      <polyline
        ref={lineRef}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset="1"
      />
      {DOTS.map((p, k) => (
        <g
          key={p}
          ref={(el) => {
            dotRefs.current[k] = el;
          }}
          transform={`translate(${POINTS[p][0]} ${POINTS[p][1]})`}
          opacity="0"
        >
          <circle data-ring data-r={dotR} r={dotR} fill="none" stroke="#11E3C7" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0" />
          <circle r={dotR} fill="#11E3C7" />
        </g>
      ))}
    </svg>
  );
}
