"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import LogoSmoke3D from "@/components/LogoSmoke3D";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { HomeDoc, PlanData, PourquoiData } from "./homeTypes";
import styles from "./B2BSections.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Blocs 9.5 et 9.6 sur un même fond clair : le symbole 3D en particules floues
 * (qui se disperse puis se reconstruit) reste derrière (calque profond).
 * Transitions en parallaxe (réf. calques d'Osmo) :
 * - Expertises → Pourquoi : la section claire glisse par-dessus la sombre, qui recule plus lentement ;
 * - Pourquoi → Plan : le contenu qui sort ralentit et s'estompe pendant que le suivant arrive.
 * Les espacements internes restent ceux des maquettes (aucun décalage à l'intérieur des sections).
 */
export default function B2BSections({ pourquoi, plan, doc }: { pourquoi: PourquoiData; plan: PlanData; doc: HomeDoc }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current!;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      // Header en encre sur ce fond clair
      ScrollTrigger.create({
        trigger: root,
        start: "top 60px",
        end: "bottom 60px",
        // Image suivante : passe après la piste Expertises, qui remet « dark » en sortant
        onToggle: (self) =>
          requestAnimationFrame(
            () =>
              (document.body.dataset.tone = self.isActive ? "light" : "dark"),
          ),
      });

      if (reduce) return;

      // Transitions en calques : ordinateur seulement (sur mobile, le décalage poussait le bas des
      // Expertises sous la section suivante et cassait l'espacement entre sections)
      ScrollTrigger.matchMedia({ "(min-width: 1025px)": () => layers() });
    }, root);

    function layers() {
      const root = ref.current!;
      // Expertises → Pourquoi : la lame sombre recule (et s'assombrit) sous la section claire.
      // On anime son contenu (fond fixe + piste), jamais le conteneur épinglé : un transform
      // sur celui-ci casserait l'épinglage quand on remonte.
      const prev = document.getElementById("expertises");
      if (prev) {
        gsap.fromTo(
          prev.children,
          { y: 0, opacity: 1 },
          {
            y: () => innerHeight * 0.3,
            opacity: 0.45,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "top top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      // Pourquoi → Plan : sortie ralentie et estompée, entrée qui rattrape
      const out = root.querySelector<HTMLElement>("[data-exit]");
      const next = root.querySelector<HTMLElement>("[data-enter]");
      if (out && next) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: next,
            start: "top 80%",
            end: "top 20%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(
          out,
          { y: 0, opacity: 1 },
          { y: () => innerHeight * 0.14, opacity: 0.3, ease: "none" },
          0,
        );
        tl.fromTo(
          next,
          { y: () => innerHeight * 0.12 },
          { y: 0, ease: "none" },
          0,
        );
      }
    }

    // Entrées : un bloc monte dès qu'il entre à l'écran. IntersectionObserver plutôt qu'un seuil
    // de défilement, que le bouton tout en bas de page n'atteignait jamais (il restait invisible).
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add(styles.in);
          io.unobserve(e.target);
        }),
      { threshold: 0.1 },
    );
    root.querySelectorAll("[data-in]").forEach((el) => io.observe(el));

    return () => {
      ctx.revert();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={styles.scene} data-smoke-scene>
      <div className={styles.bg} aria-hidden="true">
        <LogoSmoke3D className={styles.smoke} />
      </div>

      {/* Bloc 9.5 · Pourquoi une agence spécialisée */}
      <section
        id="pourquoi"
        className={`${styles.section} ${styles.pourquoi}`}
        aria-labelledby="pourquoi-title"
      >
        <div data-exit>
          <header data-in>
            <h2 id="pourquoi-title" className={styles.title}>
              {pourquoi.title?.map((l, k) => (
                <span key={k}>{l}</span>
              ))}
            </h2>
            <p className={styles.intro}>
              <RichText text={pourquoi.intro ?? ""} />
            </p>
          </header>

          <ul className={styles.reasons}>
            {pourquoi.items?.map((it, i) => {
              const key = clean(it._key);
              const src = imageUrl(it.image, 634, 1084); // ratio 317 / 542, le point focal s'applique
              return (
                <li
                  key={key}
                  className={`${styles.reason} ${i === 1 ? styles.reasonMid : ""}`}
                >
                  <figure
                    className={styles.portrait}
                    data-in
                    data-sanity={editAttr(doc, `pourquoi.items[_key=="${key}"].image`)}
                  >
                    {src && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={clean(it.image?.alt ?? "")}
                        width={317}
                        height={542}
                        loading="lazy"
                      />
                    )}
                  </figure>
                  <div className={styles.reasonText} data-in>
                    <h3 className={styles.h3}>
                      {it.title?.map((l, k) => (
                        <span key={k}>{l}</span>
                      ))}
                    </h3>
                    <p className={styles.text}>
                      <RichText text={it.text ?? ""} />
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className={styles.outro} data-in>
            <strong>{pourquoi.outro}</strong>
          </p>
          <a
            href={clean(pourquoi.cta?.href ?? "")}
            className={`btn btn-ghost ${styles.cta}`}
            data-in
          >
            {pourquoi.cta?.label}
          </a>
        </div>
        <Bolt className={styles.bolt} />
      </section>

      {/* Bloc 9.6 · Du plan aux résultats */}
      <section
        id="plan"
        className={`${styles.section} ${styles.plan}`}
        aria-labelledby="plan-title"
      >
        <div data-enter>
          <header data-in>
            <h2 id="plan-title" className={styles.title}>
              <span>{plan.title}</span>
              <span className={styles.subtitle}>{plan.subtitle}</span>
            </h2>
            <p className={styles.intro}>
              <RichText text={plan.intro ?? ""} />
            </p>
          </header>

          <ol className={styles.steps}>
            {plan.steps?.map((s, i) => {
              const key = clean(s._key);
              const src = imageUrl(s.image, 1250, 1086); // ratio 625 / 543, le point focal s'applique
              return (
                <li key={key} className={styles.step}>
                  <figure
                    className={styles.landscape}
                    data-in
                    data-sanity={editAttr(doc, `plan.steps[_key=="${key}"].image`)}
                  >
                    {src && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={clean(s.image?.alt ?? "")}
                        width={625}
                        height={543}
                        loading="lazy"
                      />
                    )}
                  </figure>
                  <div className={styles.stepText} data-in>
                    <h3 className={styles.h3}>
                      <span className="visually-hidden">{i + 1}. </span>
                      {s.title?.map((l, k) => (
                        <span key={k}>{l}</span>
                      ))}
                    </h3>
                    <p className={styles.text}>
                      <RichText text={s.text ?? ""} />
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className={styles.outro} data-in>
            {plan.outro?.map((p, k) => (
              <p key={k}>
                <strong>{p}</strong>
              </p>
            ))}
          </div>
          <a
            href={clean(plan.cta?.href ?? "")}
            className={`btn btn-ghost ${styles.cta}`}
            data-in
          >
            {plan.cta?.label}
          </a>
        </div>
        <Bolt className={styles.bolt} />
      </section>
    </div>
  );
}
