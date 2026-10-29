import type { CaseExtras } from "./types";

/** Maquettes « Praneo resultats » et « Praneo CTA FInal » (textes transcrits tels quels). */
export const praneo: CaseExtras = {
  results: {
    title: ["Les", "premiers", "résultats"],
    stats: [
      { value: 30, suffix: "+", text: "**Contenus publiés au lancement,** complétés par une production mensuelle." },
      { value: 10, suffix: "+", text: "**Leads générés par jour** grâce aux campagnes d’acquisition." },
      { value: 100, text: "**Inscriptions par mois** sur la plateforme." },
    ],
    summary:
      "Au-delà de ces premiers volumes, Pranéo dispose d’un dispositif qui relie contenus, acquisition payante et mesure des conversions pour accompagner son développement.",
  },
  cta: {
    title: [
      [{ text: "Vous " }, { text: "lancez une offre", accent: true }, { text: " qui doit" }],
      [{ text: "convaincre plusieurs publics ?" }],
    ],
    subtitle: [
      "Positionnement, visibilité, acquisition et mesure :",
      "Heroïstes vous aide à articuler ces leviers autour de vos priorités business",
    ],
    text: "Un échange est nécessaire pour identifier vos publics prioritaires et les premières étapes de votre acquisition.",
    button: { label: "Parlons de votre lancement", href: "#contact" },
  },
  nav: {
    // Minos n'a pas encore de page détail : le lien mène à une 404 tant qu'elle n'existe pas.
    prev: { label: "Projet précédent", name: "Minos", href: "/cas-clients/minos", image: "/images/cases/minos.png" },
    next: { label: "Projet suivant", name: "Rezo partage", href: "/cas-clients/rezo-partage", image: "/images/cases/rezo-partage.png" },
  },
};
