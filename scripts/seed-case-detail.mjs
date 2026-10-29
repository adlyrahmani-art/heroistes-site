/**
 * Contenu « Page détail » du cas Pranéo, transcrit de la maquette « Page-Cas 1 _ Pranéo détails ».
 *
 * Exécution : node --env-file=.env.local scripts/seed-case-detail.mjs
 * Nécessite SANITY_API_WRITE_TOKEN (jamais affiché).
 *
 * Idempotent : les images sont dédoublonnées par Sanity (même contenu = même asset), les _key sont
 * fixes, et le script ne fait qu'un `patch().set()` des champs de la page détail (plus les points
 * forts) sur le document publié `caseStudy-praneo`. Aucun autre champ ni document n'est touché.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const DOC_ID = "caseStudy-praneo";
const RES = path.join(process.cwd(), "ressources");

for (const name of ["NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET", "SANITY_API_WRITE_TOKEN"]) {
  if (!process.env[name]) {
    console.error(`Erreur : ${name} est absent (lancer avec --env-file=.env.local).`);
    process.exit(1);
  }
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});

/** Espaces insécables avant : ; ? ! (typographie française). */
const fr = (s) => s.replace(/ ([:;?!])/g, " $1");

/** Téléverse une image de ressources/ et renvoie un champ imageWithAlt. */
async function image(file, alt) {
  const asset = await client.assets.upload("image", readFileSync(path.join(RES, file)), { filename: file });
  return { _type: "imageWithAlt", asset: { _type: "reference", _ref: asset._id }, alt };
}

const block = (key, title, text) => ({
  _key: key,
  _type: "caseBlock",
  ...(title && { title }),
  text: fr(text),
});

const existing = await client.getDocument(DOC_ID);
if (!existing) {
  console.error(`Erreur : le document publié ${DOC_ID} est introuvable.`);
  process.exit(1);
}
if (await client.getDocument(`drafts.${DOC_ID}`)) {
  console.warn(`Attention : un brouillon drafts.${DOC_ID} existe ; il masquera ces changements dans le Studio tant qu'il n'est pas publié ou abandonné.`);
}

const [background, introImage, image2, image3] = await Promise.all([
  image(
    "Page-Cas 1 _ Pranéo détails-header bg.png",
    "Praticienne du bien-être debout près d’une patiente allongée pendant une séance, photo en noir et blanc assombrie",
  ),
  image(
    "Page-Cas 1 _ Pranéo détails-image1.png",
    "Femme allongée, les yeux fermés, recevant un soin d’acupuncture sur le front, photo en noir et blanc",
  ),
  image(
    "Page-Cas 1 _ Pranéo détails-image2.png",
    "Jeune femme en pull écrivant dans un carnet près d’une fenêtre, photo en noir et blanc",
  ),
  image(
    "Page-Cas 1 _ Pranéo détails-image3.png",
    "Visuel de campagne Pranéo « 14 jours d’essai » : une praticienne souriante tient une tablette, entourée des fonctionnalités de la solution",
  ),
]);

const fields = {
  highlights: ["30+ contenus publiés au lancement", "Plus de 10 leads par jour", "100 inscriptions par mois"],
  detailHero: {
    background,
    subtitle: ["Orchestrer un lancement à double", "enjeu, professionnels et particuliers"],
    intro: fr(
      "Comment installer une nouvelle plateforme du bien-être sur son marché, recruter ses premiers praticiens et préparer l’acquisition de particuliers ? Pranéo a confié à Heroïstes une mission transverse : structurer sa visibilité, déployer son acquisition et donner à ses équipes les moyens de piloter leur croissance.",
    ),
  },
  detailIntro: {
    title: ["Une plateforme,", "deux publics à convaincre"],
    text: fr(
      "Pranéo associe deux offres complémentaires. Pour les particuliers, un annuaire facilite la recherche de praticiens du bien-être et la réservation de consultations. Pour les professionnels, une solution SaaS réunit les outils nécessaires à leur activité : agenda, rendez-vous, messagerie, visioconférence et suivi client.\nLe lancement devait donc répondre à deux besoins : convaincre les praticiens de rejoindre la plateforme et donner aux particuliers une raison de l’utiliser.",
    ),
    image: introImage,
  },
  challenge: {
    title: "Notre défi",
    lead: "Activer les deux côtés du marché dans le bon ordre",
    text: fr(
      "La priorité était de recruter des professionnels pour enrichir l’annuaire et leur faire découvrir la solution de gestion Pranéo. Cette première étape devait ensuite soutenir l’acquisition de particuliers et le développement des prises de rendez-vous.\n\nNous avons articulé la stratégie autour de cette progression : **constituer l’offre, attirer la demande et mesurer les conversions à chaque étape.**",
    ),
  },
  chapters: [
    {
      _key: "chapitre-1",
      _type: "caseChapter",
      title: ["Installer les", "fondations d’une", "visibilité durable"],
      blocks: [
        block(
          "chapitre-1-bloc-1",
          ["Une stratégie SEO pour", "deux parcours de recherche"],
          "**Heroïstes a construit une stratégie SEO couvrant les environnements professionnels et particuliers.** L’objectif : répondre aux recherches propres à chaque public, des besoins de gestion des praticiens à la découverte des spécialités du bien-être\n\nNous avons accompagné les développements techniques pour faciliter l’exploration et l’indexation des sites par les moteurs de recherche, tout en travaillant la clarté et la structuration des contenus pour leur compréhension par les assistants IA.",
        ),
        block(
          "chapitre-1-bloc-2",
          ["Des contenus qui expliquent l’offre", "et accompagnent la décision"],
          "**Plus de 30 contenus ont été déployés dès la sortie du site** : pages métiers, présentation des spécialités et contenus approfondis adaptés aux deux publics.\nUne production mensuelle prolonge ce travail pour élargir la couverture des recherches et soutenir l’acquisition naturelle de prospects.",
        ),
      ],
      image: image2,
      imageSide: "right",
    },
    {
      _key: "chapitre-2",
      _type: "caseChapter",
      title: ["Déployer une", "acquisition ciblée", "auprès des praticiens"],
      blocks: [
        block(
          "chapitre-2-bloc-1",
          ["Des campagnes reliées à", "des pages dédiées"],
          "Nous avons conçu et déployé des **campagnes Meta et Search** pour générer des contacts et des inscriptions.\nQuatre landing pages ont été créées pour les principales spécialités ciblées, afin de relier chaque campagne à un message adapté au métier du praticien et à ses besoins.",
        ),
        block(
          "chapitre-2-bloc-2",
          ["Un dispositif créatif et média dans", "la durée"],
          "La stratégie réseaux sociaux associait plan média, publications croisées et sponsorisation. Des créations dédiées ont été livrées chaque trimestre pour alimenter les prises de parole et les campagnes.\nLes visuels, messages et campagnes ont fait l’objet de tests A/B pour identifier les approches les plus efficaces et ajuster les investissements.",
        ),
      ],
      image: image3,
      imageSide: "left",
    },
    {
      _key: "chapitre-3",
      _type: "caseChapter",
      title: ["Relier les actions", "marketing aux", "conversions"],
      blocks: [
        block(
          "chapitre-3-bloc-1",
          null,
          "**Heroïstes a déployé le suivi des conversions sur les deux environnements et créé des tableaux de bord dédiés au pilotage de l’activité.**\n**Ce dispositif permet de suivre les parcours, de comparer les sources d’acquisition et d’orienter les optimisations à partir des actions réalisées sur la plateforme.**",
        ),
      ],
      imageSide: "right",
    },
  ],
};

const result = await client.patch(DOC_ID).set(fields).commit();
console.log(`OK : ${result._id} mis à jour (révision ${result._rev}). Champs : ${Object.keys(fields).join(", ")}.`);
