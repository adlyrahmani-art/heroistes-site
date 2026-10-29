"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { footer } from "@/content/accueil";
import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { SETTINGS_QUERY_RESULT } from "../../sanity.types";
import styles from "./Footer.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Footer · Bloc 9.10 Contact (maquette « Footer »).
 * Entrée comme la section Expertises : en bas de la FAQ, la molette fait défiler de droite à
 * gauche le titre « Votre prochaine étape » (la FAQ, épinglée, part vers la gauche), puis le
 * footer ; le défilement redevient ensuite vertical dans le footer.
 * Mécanique : la zone chevauche le dernier écran de la FAQ (marge −100svh) et réserve deux écrans
 * de défilement ; la piste (titre à gauche du footer) y reste collée en haut le temps du glissement.
 */
export default function Footer({
  lead,
  settings,
}: {
  lead: string[];
  settings: NonNullable<SETTINGS_QUERY_RESULT>;
}) {
  const f = settings.footer;
  const visualSrc = imageUrl(f?.visual, 652, 436);
  const email = f?.email || footer.email;
  const emailHref = clean(email);
  const linkedin = clean(settings.social?.linkedin) || footer.linkedin;
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const zone = ref.current!;
    const track = trackRef.current!;
    const title = titleRef.current!;
    const faq = document.getElementById("faq");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setTone = (v: "light" | "dark") => requestAnimationFrame(() => (document.body.dataset.tone = v));

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 1025px)": () => {
          if (reduce || !faq) {
            title.classList.add(styles.in);
            return;
          }
          const first = { trigger: zone, start: "top top", end: "+=100%", scrub: true, invalidateOnRefresh: true };
          // La FAQ reste en place (épinglée) pendant le premier glissement ; on anime son contenu,
          // jamais le conteneur épinglé
          ScrollTrigger.create({ trigger: zone, start: "top top", end: "+=100%", pin: faq, pinSpacing: false });
          gsap.fromTo(faq.children, { x: 0 }, { x: () => -innerWidth, ease: "none", scrollTrigger: first });
          // Piste : le titre puis le footer, deux écrans de droite à gauche
          gsap.fromTo(
            track,
            { x: () => 2 * innerWidth },
            {
              x: 0,
              ease: "none",
              scrollTrigger: {
                ...first,
                end: "+=200%",
                onUpdate: (self) => {
                  // Header : blanc sur la FAQ, encre dès que le titre clair occupe l'écran
                  setTone(self.progress > 0.4 ? "light" : "dark");
                  if (self.progress > 0.1) title.classList.add(styles.in);
                },
                onLeave: () => setTone("light"),
              },
            },
          );
        },
        "(max-width: 1024px)": () => {
          title.classList.add(styles.in);
          ScrollTrigger.create({
            trigger: zone,
            start: "top 60px",
            onToggle: (self) => setTone(self.isActive ? "light" : "dark"),
          });
        },
      });
    }, zone);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={ref} id="contact" className={styles.zone} aria-labelledby="contact-title">
      <div ref={trackRef} className={styles.track}>
        {/* Titre (maquette « Footer titre »), à gauche du footer sur la piste */}
        <div ref={titleRef} className={styles.titlePanel}>
          <p className={styles.bigTitle}>
            {lead.map((l, i) => (
              <span key={i} className={styles.ln}>
                <span>{l}</span>
              </span>
            ))}
            <span className={styles.bar} aria-hidden="true" />
          </p>
          <Bolt className={styles.bolt} />
        </div>

        <div className={styles.sheet}>
        <span className={styles.axis} aria-hidden="true" />

        {/* Colonne gauche : marque, newsletter, contact */}
        <div className={styles.brandCol}>
          {visualSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.visual}
              src={visualSrc}
              alt={clean(f?.visual?.alt) ?? ""}
              width={652}
              height={436}
              loading="lazy"
              data-sanity={editAttr(settings, "footer.visual")}
            />
          )}

          <p className={styles.brand}>
            {footer.brand}
            <span>{f?.baseline ?? footer.baseline}</span>
          </p>

          <form className={styles.newsletter} onSubmit={(e) => e.preventDefault()}>
            {/* [À brancher] inscription newsletter (outil d'e-mailing à définir) */}
            <h3 className={styles.newsTitle}>{f?.newsletterTitle ?? footer.newsletter.title}</h3>
            <p className={styles.newsText}>{f?.newsletterText ?? footer.newsletter.text}</p>
            <label className="visually-hidden" htmlFor="news-email">
              Votre adresse e-mail
            </label>
            <input
              id="news-email"
              className={styles.input}
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={footer.newsletter.placeholder}
            />
            <button type="submit" className={styles.subscribe}>
              {footer.newsletter.submit}
            </button>
          </form>

          <a className={styles.linkedin} href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="Héroïstes sur LinkedIn">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="3" fill="currentColor" />
              <path
                d="M9.3 12.6h3v9.8h-3zM10.8 7.8a1.7 1.7 0 1 1 0 3.5 1.7 1.7 0 0 1 0-3.5zM14.2 12.6h2.9v1.3c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7v5.4h-3v-4.8c0-1.1 0-2.6-1.6-2.6s-1.9 1.3-1.9 2.5v4.9h-3z"
                fill="var(--fond-clair)"
              />
            </svg>
          </a>
          <p className={styles.copyright}>{f?.copyright ?? footer.copyright}</p>
          <a className={styles.email} href={`mailto:${emailHref}`}>
            <span>{email.split("@")[0]}</span>
            <span>@{email.split("@")[1]}</span>
          </a>
        </div>

        {/* Colonne droite : formulaire de contact */}
        <div className={styles.formCol}>
          <h2 id="contact-title" className={styles.title}>
            {footer.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
          <p className={styles.intro}>
            <RichText text={footer.intro} />
          </p>

          {/* [À brancher] envoi du formulaire, message de confirmation et conversion GA4 */}
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            {footer.fields.map((f) => (
              <div key={f.name} className={styles.field}>
                <label htmlFor={`contact-${f.name}`} className={styles.label}>
                  {f.label} *
                </label>
                <input
                  id={`contact-${f.name}`}
                  className={styles.input}
                  name={f.name}
                  type={f.type}
                  required
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <div className={styles.field}>
              <label htmlFor="contact-description" className={styles.label}>
                {footer.description.label} *
              </label>
              <textarea
                id="contact-description"
                className={`${styles.input} ${styles.textarea}`}
                name={footer.description.name}
                required
                placeholder={footer.description.placeholder}
              />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.send}`}>
              {footer.submit}
            </button>
            <p className={styles.privacy}>
              {footer.privacy.text} <a href={footer.privacy.link.href}>{footer.privacy.link.label}</a>
            </p>
          </form>
        </div>
        </div>
      </div>
    </footer>
  );
}
