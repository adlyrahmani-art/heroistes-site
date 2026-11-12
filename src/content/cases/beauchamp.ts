import type { CaseExtras } from "./types";

/** Maquettes « Cas 3 _ Beauchamp Intro » et « Beauchamp CTA Final » (textes transcrits tels quels). */
export const beauchamp: CaseExtras = {
  results: {
    title: ["Les", "résultats"],
    stats: [{ value: 70, suffix: "+", text: "**leads**\npar mois" }],
    statSize: 94,
    barWidth: 721,
    summary: "Des campagnes ciblées par matière et par solution ·\nUn accompagnement digital toute l’année",
    background: "/images/cases/case-results-bg.jpg",
  },
  cta: {
    title: [
      [{ text: "Votre " }, { text: "expertise", accent: true }, { text: " mérite de devenir" }],
      [{ text: "un levier d’acquisition" }],
    ],
    subtitle: [
      "Héroïstes vous aide à traduire vos savoir-faire en contenus, en parcours et en",
      "campagnes capables de soutenir votre développement commercial.",
    ],
    button: { label: "Parlons de vos objectifs d’acquisition", href: "#contact" },
    background: "/images/cases/case-cta-bg.jpg",
  },
  nav: {
    prev: { label: "Projet précédent", name: "Carpigiani", href: "/cas-clients/carpigiani", image: "/images/cases/carpigiani.png" },
    // Minos n'a pas encore de page détail : le lien mène à une 404 tant qu'elle n'existe pas.
    next: { label: "Projet suivant", name: "Minos", href: "/cas-clients/minos", image: "/images/cases/minos.png" },
  },
};
