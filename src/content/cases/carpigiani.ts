import type { CaseExtras } from "./types";

/** Maquettes « Cas 2 _ Carpigiani Intro » et « Carpigiani CTA Final » (textes transcrits tels quels). */
export const carpigiani: CaseExtras = {
  // Espacements des chapitres calés sur la maquette « Cas 2 _ Carpigiani détails » (px à 1920)
  chapters: [
    { gap: 54, colsGap: 83, imageGap: 10, blockGap: 58 },
    { gap: 92, colsGap: 83, blockGap: 49, blockWidths: [610, 565] },
    { gap: 130, colsGap: 35 },
  ],
  results: {
    title: ["Les", "résultats"],
    subtitle: "Après six mois de campagne",
    stats: [
      { value: 700, suffix: "+", text: "**leads uniques**\ngénérés" },
      { value: 200, suffix: "+", text: "**téléchargements**\nde catalogues." },
      { value: 30, suffix: "%", text: "**du new business généré**\npar les campagnes." },
    ],
    statSize: 94,
    barWidth: 721,
    summary:
      "À l’issue de ces six mois, Carpigiani France a renouvelé sa confiance à Héroïstes en lui confiant ses campagnes de fin d’année ainsi que l’ensemble de son dispositif digital pour 2027.",
    background: "/images/cases/case-results-bg.jpg",
  },
  cta: {
    title: [
      [{ text: "Vos " }, { text: "campagnes", accent: true }, { text: " doivent alimenter" }],
      [{ text: "votre activité commerciale ?" }],
    ],
    subtitle: [
      "Héroïstes conçoit et pilote des dispositifs qui relient vos offres, vos audiences et",
      "vos équipes commerciales, du premier contact à la maturation des prospects.",
    ],
    button: { label: "Parlons de vos objectifs d’acquisition", href: "#contact" },
    background: "/images/cases/case-cta-bg.jpg",
  },
  nav: {
    prev: { label: "Projet précédent", name: "Pranéo", href: "/cas-clients/praneo", image: "/images/cases/praneo.png" },
    next: { label: "Projet suivant", name: "Beauchamp", href: "/cas-clients/beauchamp", image: "/images/cases/beauchamp.png" },
  },
};
