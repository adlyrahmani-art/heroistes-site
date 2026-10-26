"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/SmoothScroll";
import Particles from "./Particles";
import styles from "./Hero.module.css";

const STAGES = 3;

/** Lame hero : scène WebGL épinglée, 3 états pilotés par le scroll (ScrollTrigger). */
export default function Hero() {
  const lenis = useLenis();
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [stage, setStage] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      snap: { snapTo: 1 / (STAGES - 1), duration: { min: 0.3, max: 0.9 }, delay: 0.05, ease: "power2.inOut" },
      onUpdate: (self) => setStage(Math.round(self.progress * (STAGES - 1))),
    });
    triggerRef.current = st;
    return () => st.kill();
  }, []);

  // Glitch du titre à chaque changement de lame
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setGlitch(true);
    const id = setTimeout(() => setGlitch(false), 400);
    return () => clearTimeout(id);
  }, [stage]);

  function go(n: number) {
    const st = triggerRef.current;
    if (!st) return;
    const target = st.start + ((st.end - st.start) * Math.max(0, Math.min(STAGES - 1, n))) / (STAGES - 1);
    if (lenis?.current) lenis.current.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
  }

  const cls = (i: number) => [styles.stage, stage === i && styles.active].filter(Boolean).join(" ");

  return (
    <section ref={sectionRef} className={`${styles.hero} ${glitch ? styles.glitch : ""}`} aria-label="Accueil">
      <div className={styles.sticky}>
        <Canvas
          className={styles.gl}
          camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 6] }}
          dpr={[1, 2]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor(0x0e0e0e, 1)}
          fallback={<p className={styles.nogl}>WebGL n’est pas disponible dans ce navigateur : la scène 3D ne peut pas s’afficher.</p>}
          aria-label="Scène interactive : glisser pour faire tourner, cliquer pour faire exploser les particules"
        >
          <Particles stage={stage} reduce={reduce} />
        </Canvas>
        <div className="fx-grain" aria-hidden="true" />
        <div className="fx-scan" aria-hidden="true" />
        <div className="fx-vignette" aria-hidden="true" />

        <div className={styles.stages}>
          <div className={cls(0)} aria-hidden={stage !== 0}>
            <div className={styles.wrap}>
              <p className={`${styles.eyebrow} ${styles.ln}`}><span>Agence B2B · Grenoble · Paris</span></p>
              <h2 className={`${styles.h1} ${styles.glitchable}`}>
                <span className={styles.ln}><span>Le héros</span></span>
                <span className={styles.ln}><span>du R.O.I.</span></span>
              </h2>
              <p className={`${styles.lead} ${styles.ln}`}><span>Faites tourner la sphère, cliquez pour la faire exploser, puis faites défiler.</span></p>
            </div>
          </div>

          <div className={cls(1)} aria-hidden={stage !== 1}>
            <div className={styles.wrap}>
              <p className={`${styles.eyebrow} ${styles.ln}`}><span>Le héros du R.O.I.</span></p>
              <h1 className={styles.glitchable}>
                <span className={`${styles.h1} ${styles.ln}`}><span>L’agence marketing B2B</span></span>
                <span className={`${styles.h2} ${styles.ln}`}><span>jugée sur vos<span className={styles.hl}>ventes</span></span></span>
              </h1>
              <div className={`${styles.btns} ${styles.ln}`}>
                <span>
                  <a href="#contact" className="btn btn-primary" tabIndex={stage === 1 ? 0 : -1}>Discutons de votre projet</a>
                  <a href="#expertises" className="btn" tabIndex={stage === 1 ? 0 : -1}>Découvrons nos expertises</a>
                </span>
              </div>
            </div>
          </div>

          <div className={cls(2)} aria-hidden={stage !== 2}>
            <div className={styles.wrap}>
              <p className={`${styles.eyebrow} ${styles.ln}`}><span>Deux lames, une seule mission</span></p>
              <h2 className={styles.glitchable}>
                <span className={`${styles.brandname} ${styles.ln}`}><span>Héroïstes</span></span>
                <span className={`${styles.baseline} ${styles.ln}`}><span>Héros du R.O.I</span></span>
              </h2>
              <p className={`${styles.lead} ${styles.ln}`}><span>La rigueur et l’énergie commerciale : les deux éclairs du symbole se recomposent à partir des particules.</span></p>
            </div>
          </div>
        </div>

        <div className={styles.bar}>
          <div className={styles.hint}><b>●</b> Glisser pour tourner <span className={styles.opt}>· Cliquer pour exploser</span></div>
          <div className={styles.ctrl}>
            <span className={styles.count}>0{stage + 1} / 0{STAGES}</span>
            <div className={styles.dots} role="group" aria-label="Étapes du hero">
              {["intro", "hero", "logo"].map((label, i) => (
                <button key={label} type="button" className={styles.dot} aria-label={`Étape ${i + 1} : ${label}`} aria-current={stage === i} onClick={() => go(i)} />
              ))}
            </div>
            <button type="button" className={styles.next} onClick={() => go(stage === STAGES - 1 ? 0 : stage + 1)}>
              {stage === STAGES - 1 ? "Recommencer ↑" : "Suivant ↓"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
