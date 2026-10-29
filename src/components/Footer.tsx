"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { SETTINGS_QUERY_RESULT } from "../../sanity.types";
import type { ContactFormConfig } from "@/lib/contact/validate";
import styles from "./Footer.module.css";

/** Dernier recours : valeurs affichées seulement si Sanity ne renvoie rien (le contenu vient de Sanity). */
const footer = {
  title: ["Démarrez", "votre projet"],
  intro:
    "Quelques informations suffisent pour démarrer.\n**Remplissez le formulaire ci-dessous** : nous revenons vers vous pour échanger sur votre projet, sans engagement.",
  fields: [
    { name: "nom", label: "Nom", type: "text", placeholder: "Martin", autoComplete: "family-name" },
    { name: "prenom", label: "Prénom", type: "text", placeholder: "Olivier", autoComplete: "given-name" },
    { name: "email", label: "Email", type: "email", placeholder: "olivier_martin@gmail.com", autoComplete: "email" },
    { name: "telephone", label: "Téléphone", type: "tel", placeholder: "+33 123 456 789", autoComplete: "tel" },
    { name: "sujet", label: "Sujet", type: "text", placeholder: "Créer mon site web", autoComplete: "off" },
  ],
  description: { name: "description", label: "Description du projet", placeholder: "Description ici" },
  submit: "Envoyer ma demande",
  privacy: {
    text: "Vos données servent uniquement à vous recontacter au sujet de votre demande.",
    link: { label: "Politique de confidentialité", href: "/politique-de-confidentialite/" },
  },
  visual: "/images/footer-visuel.jpg",
  visualAlt: "Personne tenant un skateboard en ville, à côté du symbole Héroïstes",
  brand: "Héroïstes",
  baseline: "Héros du R.O.I",
  newsletter: {
    title: "Restez informé",
    text: "Recevez des conseils en design, les mises à jour de nos projets et nos dernières actualités directement dans votre boîte mail.",
    placeholder: "votre_adresse@email.com",
    submit: "S’abonner",
  },
  linkedin: "https://www.linkedin.com/company/heroistes/",
  copyright: "© 2026 — Grenoble · Paris — Tous droits réservés.",
  email: "contact@heroistes.com",
};


gsap.registerPlugin(ScrollTrigger);

const GENERIC_ERROR = "L’envoi n’a pas abouti. Réessayez dans un instant.";

type FormField = {
  key: "lastName" | "firstName" | "email" | "phone" | "subject" | "description";
  label: string;
  placeholder: string;
  type: string;
  autoComplete: string;
  required: boolean;
};

/** Champs affichés : libellés et exemples bruts (Sanity), repli sur les valeurs de dernier recours ; Téléphone / Sujet selon leur réglage. */
function formFields(cf: ContactFormConfig | null): FormField[] {
  const d = Object.fromEntries(footer.fields.map((f) => [f.name, f]));
  const pick = (cfg: { label?: string; placeholder?: string } | undefined, fb: { label: string; placeholder: string }) => ({
    label: cfg?.label || fb.label,
    placeholder: cfg?.placeholder || fb.placeholder,
  });
  const list: FormField[] = [
    { key: "lastName", type: "text", autoComplete: "family-name", required: true, ...pick(cf?.lastName, d.nom) },
    { key: "firstName", type: "text", autoComplete: "given-name", required: true, ...pick(cf?.firstName, d.prenom) },
    { key: "email", type: "email", autoComplete: "email", required: true, ...pick(cf?.email, d.email) },
  ];
  if (cf?.phone?.enabled !== false)
    list.push({ key: "phone", type: "tel", autoComplete: "tel", required: cf?.phone?.required !== false, ...pick(cf?.phone, d.telephone) });
  if (cf?.subject?.enabled !== false)
    list.push({ key: "subject", type: "text", autoComplete: "off", required: cf?.subject?.required !== false, ...pick(cf?.subject, d.sujet) });
  list.push({ key: "description", type: "text", autoComplete: "off", required: true, ...pick(cf?.description, footer.description) });
  return list;
}

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
  contactForm,
  staticTone,
}: {
  lead: string[];
  /** Page à fond clair fixe (pages détail) : aucun changement de ton du header au défilement. */
  staticTone?: "light";
  settings: Pick<NonNullable<SETTINGS_QUERY_RESULT>, "_id" | "_type" | "footer" | "social"> | null;
  /** Configuration du formulaire de contact (Sanity) ; repli sur les valeurs par défaut si absente. */
  contactForm?: ContactFormConfig | null;
}) {
  const cf = contactForm ?? null;
  const fields = formFields(cf);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const formEl = e.currentTarget;
    const body = Object.fromEntries(new FormData(formEl).entries());
    setStatus("sending");
    setMessage("");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string> };
      if (res.ok) {
        formEl.reset();
        setStatus("done");
      } else {
        const errs = json.errors ?? {};
        setErrors(errs);
        const first = fields.find((f) => errs[f.key]);
        if (first) requestAnimationFrame(() => formEl.querySelector<HTMLElement>(`#contact-${first.key}`)?.focus());
        setStatus("error");
      }
      setMessage(json.message || (res.ok ? "" : GENERIC_ERROR));
    } catch {
      setMessage(GENERIC_ERROR);
      setStatus("error");
    }
  }

  const f = settings?.footer;
  const visualSrc = imageUrl(f?.visual, 652, 436);
  const visualAlt = visualSrc ? clean(f?.visual?.alt) || footer.visualAlt : footer.visualAlt;
  const email = f?.email || footer.email;
  const emailHref = clean(email);
  const linkedin = clean(settings?.social?.linkedin) || footer.linkedin;
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
          if (staticTone) return;
          ScrollTrigger.create({
            trigger: zone,
            start: "top 60px",
            onToggle: (self) => setTone(self.isActive ? "light" : "dark"),
          });
        },
      });
    }, zone);

    return () => ctx.revert();
  }, [staticTone]);

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.visual}
            src={visualSrc ?? footer.visual}
            alt={visualAlt}
            width={652}
            height={436}
            loading="lazy"
            data-sanity={visualSrc && settings ? editAttr({ _id: clean(settings._id), _type: clean(settings._type) }, "footer.visual") : undefined}
          />

          <p className={styles.brand}>
            {footer.brand}
            <span>{f?.baseline || footer.baseline}</span>
          </p>

          <form className={styles.newsletter} onSubmit={(e) => e.preventDefault()}>
            {/* [À brancher] inscription newsletter (outil d'e-mailing à définir) */}
            <h3 className={styles.newsTitle}>{f?.newsletterTitle || footer.newsletter.title}</h3>
            <p className={styles.newsText}>{f?.newsletterText || footer.newsletter.text}</p>
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
          <p className={styles.copyright}>{f?.copyright || footer.copyright}</p>
          <a className={styles.email} href={`mailto:${emailHref}`}>
            <span>{email.split("@")[0]}</span>
            <span>@{email.split("@")[1]}</span>
          </a>
        </div>

        {/* Colonne droite : formulaire de contact */}
        <div className={styles.formCol}>
          <h2 id="contact-title" className={styles.title}>
            {(cf?.title?.length ? cf.title : footer.title).map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </h2>
          <p className={styles.intro}>
            <RichText text={cf?.intro || footer.intro} />
          </p>

          {/* [À brancher] conversion GA4 à l'envoi réussi */}
          <form className={styles.form} noValidate onSubmit={onSubmit} aria-busy={status === "sending"}>
            {fields.map((f) => {
              const id = `contact-${f.key}`;
              const err = errors[f.key];
              const common = {
                id,
                name: f.key,
                required: f.required,
                placeholder: clean(f.placeholder),
                "aria-invalid": err ? true : undefined,
                "aria-describedby": err ? `${id}-error` : undefined,
              };
              return (
                <div key={f.key} className={styles.field}>
                  <label htmlFor={id} className={styles.label}>
                    {f.label}
                    {f.required ? " *" : ""}
                  </label>
                  {f.key === "description" ? (
                    <textarea className={`${styles.input} ${styles.textarea}`} {...common} />
                  ) : (
                    <input className={styles.input} type={f.type} autoComplete={f.autoComplete} {...common} />
                  )}
                  {err && (
                    <p id={`${id}-error`} className={styles.error}>
                      {err}
                    </p>
                  )}
                </div>
              );
            })}
            {/* Champ piège : invisible pour les visiteurs, rempli par les robots. */}
            <div className={styles.trap} aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.send}`} disabled={status === "sending"}>
              {cf?.submitLabel || footer.submit}
            </button>
            <p
              role="status"
              aria-live="polite"
              className={`${styles.message} ${status === "error" ? styles.error : styles.success}`}
            >
              {message}
            </p>
            <p className={styles.privacy}>
              {cf?.privacyText || footer.privacy.text} <a href={clean(cf?.privacyLink?.href) || footer.privacy.link.href}>{cf?.privacyLink?.label || footer.privacy.link.label}</a>
            </p>
          </form>
        </div>
        </div>
      </div>
    </footer>
  );
}
