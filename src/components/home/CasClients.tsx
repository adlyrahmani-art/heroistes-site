"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { casClients } from "@/content/accueil";
import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import styles from "./CasClients.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bloc 9.7 · Cas clients (maquettes « Nos Cas clients » et « Cas 1/2 »).
 * Mouvement repris de mattis.framer.website (section « We build websites » et ses abords) :
 * - chaque cas est un panneau plein écran (photo floutée + nom qui défile en continu) qui monte
 *   à la vitesse du défilement et recouvre le précédent, resté épinglé ;
 * - la photo centrale et le nom qui défile, eux, restent fixes à l'écran : le panneau les dévoile
 *   en passant.
 */
export default function CasClients() {
  const ref = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current!;
    const stack = stackRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Header : encre sur l'intro claire, blanc sur les cas sombres
      const tone = (el: Element, value: "light" | "dark") =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 60px",
          end: "bottom 60px",
          onToggle: (self) => {
            if (self.isActive) requestAnimationFrame(() => (document.body.dataset.tone = value));
          },
        });
      tone(root.querySelector("[data-intro]")!, "light");
      tone(stack, "dark");

      if (reduce) return;

      // Photo centrale et nom qui défile fixes pendant que leur panneau monte : ils sont décalés
      // d'autant que le panneau est encore bas, puis le panneau s'épingle (tous écrans ; la
      // hauteur du panneau sert de distance, robuste à la barre d'adresse mobile)
      ScrollTrigger.matchMedia({
        all: () => {
          gsap.utils.toArray<HTMLElement>("[data-slide]", stack).forEach((slide) => {
            gsap.fromTo(
              slide.querySelectorAll("[data-fixed]"),
              { y: () => -slide.offsetHeight },
              {
                y: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: slide.parentElement,
                  start: "top bottom",
                  end: "top top",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        },
      });
    }, root);

    // Entrées de l'intro
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

  const { cases } = casClients;

  return (
    <section ref={ref} id="cas-clients" className={styles.root} aria-labelledby="cas-title">
      {/* Intro claire */}
      <div className={styles.intro} data-intro>
        <span className={styles.axis} aria-hidden="true" />
        <h2 id="cas-title" className={styles.title} data-in>
          {casClients.title.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h2>
        <div className={styles.introBody}>
          <p className={styles.introText} data-in>
            <RichText text={casClients.intro} />
          </p>
          <figure className={styles.introPhoto} data-in>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={casClients.image} alt={casClients.imageAlt} width={536} height={321} loading="lazy" />
          </figure>
        </div>
        <a href={`#cas-${cases[0].slug}`} className={styles.hint}>
          <small>Scroll pour</small>
          Voir nos travaux
        </a>
        <Bolt className={styles.bolt} />
      </div>

      {/* Cas : panneaux épinglés qui se recouvrent l'un l'autre */}
      <div ref={stackRef} className={styles.stack}>
        {cases.map((c) => (
          <div key={c.slug} className={styles.item}>
            <article id={`cas-${c.slug}`} className={styles.slide} data-slide aria-labelledby={`cas-${c.slug}-title`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.bg} src={c.bg} alt="" loading="lazy" />
              <span className={styles.line} aria-hidden="true" />

              {/* Nom du client qui défile en continu, derrière la photo */}
              <div className={styles.marquee} data-fixed aria-hidden="true">
                <div className={styles.track}>
                  {[0, 1].map((k) => (
                    <span key={k}>
                      {Array.from({ length: 4 }, (_, j) => (
                        <span key={j} className={styles.word}>
                          {c.name}
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>

              <figure className={styles.card} data-fixed>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.cardImg} src={c.image} alt={c.imageAlt} width={1325} height={476} loading="lazy" />
                <figcaption className={styles.tag}>{c.tag}</figcaption>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.logo}
                  src={c.logo}
                  alt={c.logoAlt}
                  style={{ "--size": c.logoSize } as React.CSSProperties}
                  loading="lazy"
                />
              </figure>

              <div className={styles.info}>
                <div>
                  <h3 id={`cas-${c.slug}-title`} className={styles.caseTitle}>
                    <span className={styles.name}>{c.name} :</span> {c.question}
                  </h3>
                  <ul className={styles.items}>
                    {c.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  {c.stat && (
                    <p className={styles.stat}>
                      <strong>{c.stat.result}</strong> {c.stat.detail}
                    </p>
                  )}
                </div>
                <div className={styles.actions}>
                  <p className={styles.discover}>
                    <small>Découvrez</small>
                    Le cas {c.name}
                  </p>
                  <a href={casClients.cta.href} className={`btn ${styles.cta}`}>
                    {casClients.cta.label}
                  </a>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
