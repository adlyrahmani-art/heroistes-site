"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { CasClientsData, HomeDoc } from "./homeTypes";
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
export default function CasClients({ casClients, doc }: { casClients: CasClientsData; doc: HomeDoc }) {
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
      // d'autant que le panneau est encore bas, puis le panneau s'épingle. Ordinateur seulement :
      // au doigt, la photo vibrait ; sur mobile et tablette elle suit son panneau.
      ScrollTrigger.matchMedia({
        "(min-width: 1025px)": () => {
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

  const cases = casClients.cases ?? [];
  const introSrc = imageUrl(casClients.image, 1072, 642);

  return (
    <section ref={ref} id="cas-clients" className={styles.root} aria-labelledby="cas-title">
      {/* Intro claire */}
      <div className={styles.intro} data-intro>
        <span className={styles.axis} aria-hidden="true" />
        <h2 id="cas-title" className={styles.title} data-in>
          {casClients.title?.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </h2>
        <div className={styles.introBody}>
          <p className={styles.introText} data-in>
            <RichText text={casClients.intro ?? ""} />
          </p>
          {introSrc && (
            <figure className={styles.introPhoto} data-in data-sanity={editAttr(doc, "casClients.image")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={introSrc} alt={clean(casClients.image?.alt) ?? ""} width={536} height={321} loading="lazy" />
            </figure>
          )}
        </div>
        {cases[0] && (
          <a href={`#cas-${clean(cases[0].slug ?? cases[0]._id)}`} className={styles.hint}>
            <small>Scroll pour</small>
            Voir nos travaux
          </a>
        )}
        <Bolt className={styles.bolt} />
      </div>

      {/* Cas : panneaux épinglés qui se recouvrent l'un l'autre */}
      <div ref={stackRef} className={styles.stack}>
        {cases.map((c) => {
          const slug = clean(c.slug ?? c._id);
          const cdoc = { _id: clean(c._id), _type: "caseStudy" };
          const bg = imageUrl(c.background, 1600);
          const photo = imageUrl(c.image, 1325, 476);
          const logo = imageUrl(c.logo, 400);
          const stat = c.keyFigures?.[0];
          return (
            <div key={clean(c._id)} className={styles.item}>
              <article id={`cas-${slug}`} className={styles.slide} data-slide aria-labelledby={`cas-${slug}-title`}>
                {bg && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.bg} src={bg} alt="" loading="lazy" data-sanity={editAttr(cdoc, "background")} />
                )}
                <span className={styles.line} aria-hidden="true" />

                {/* Nom du client qui défile en continu, derrière la photo */}
                <div className={styles.marquee} data-fixed aria-hidden="true" data-sanity={editAttr(cdoc, "clientName")}>
                  <div className={styles.track}>
                    {[0, 1].map((k) => (
                      <span key={k}>
                        {Array.from({ length: 4 }, (_, j) => (
                          <span key={j} className={styles.word}>
                            {clean(c.clientName)}
                          </span>
                        ))}
                      </span>
                    ))}
                  </div>
                </div>

                <figure className={styles.card} data-fixed>
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.cardImg}
                      src={photo}
                      alt={clean(c.image?.alt) ?? ""}
                      width={1325}
                      height={476}
                      loading="lazy"
                      data-sanity={editAttr(cdoc, "image")}
                    />
                  )}
                  <figcaption className={styles.tag}>{c.tag}</figcaption>
                  {logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.logo}
                      src={logo}
                      alt={clean(c.logo?.alt) ?? ""}
                      style={{ "--size": c.logoSize } as React.CSSProperties}
                      loading="lazy"
                      data-sanity={editAttr(cdoc, "logo")}
                    />
                  )}
                </figure>

                <div className={styles.info}>
                  <div>
                    <h3 id={`cas-${slug}-title`} className={styles.caseTitle}>
                      <span className={styles.name}>{c.clientName} :</span> {c.question}
                    </h3>
                    <ul className={styles.items}>
                      {c.highlights?.map((it, n) => (
                        <li key={n}>{it}</li>
                      ))}
                    </ul>
                    {stat?.result && (
                      <p className={styles.stat}>
                        <strong>{stat.result}</strong> {stat.detail}
                      </p>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <p className={styles.discover}>
                      <small>Découvrez</small>
                      Le cas {c.clientName}
                    </p>
                    {casClients.cta?.href && (
                      <a href={clean(casClients.cta.href)} className={`btn ${styles.cta}`}>
                        {casClients.cta.label}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
