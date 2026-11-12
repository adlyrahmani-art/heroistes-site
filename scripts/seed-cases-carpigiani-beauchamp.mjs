/**
 * Cas clients Carpigiani et Beauchamp (pages détail), transcrits des maquettes
 * « Page Carpigiani/ » et « Page Beauchamp/ », plus les corrections de texte de Pranéo.
 *
 * Exécution : node --env-file=.env.local scripts/seed-cases-carpigiani-beauchamp.mjs
 * Nécessite SANITY_API_WRITE_TOKEN (jamais affiché).
 *
 * Idempotent :
 * - les images sont dédoublonnées par Sanity (même contenu = même asset) ;
 * - `caseStudy-carpigiani` et `caseStudy-beauchamp` sont créés par `createIfNotExists` (squelette minimal),
 *   puis seuls les champs listés ici sont posés par `patch().set()` ; les autres champs ne sont pas touchés ;
 * - Pranéo : « Heroïstes » devient « Héroïstes » dans les seuls textes concernés (patch ciblé, rien si déjà fait).
 * Ces cas ne sont pas ajoutés à la liste « Nos cas clients » de l'accueil.
 *
 * Images dérivées des maquettes (dans ressources/, non versionné) :
 * - `*-hero-bg.png` : les 883 premiers pixels de « … Intro-BG.png » ;
 * - `*-logo.png` : logos détourés à 1:1 dans « … Intro.png » (différence avec le fond sans texte).
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

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

/** Espaces insécables avant : ; ? ! % (typographie française). */
const NBSP = String.fromCharCode(0xa0);
const fr = (s) => s.replace(/ ([:;?!%])/g, `${NBSP}$1`);

/** Retrouve un fichier de ressources/ (noms normalisés NFC, espaces spéciaux tolérés). */
function find(dir, file) {
  const norm = (s) => s.normalize("NFC").replace(/[\u2028\u00a0]/g, " ");
  const folder = readdirSync(RES).find((d) => norm(d) === norm(dir));
  if (!folder) throw new Error(`Dossier introuvable : ressources/${dir}`);
  const match = readdirSync(path.join(RES, folder)).find((f) => norm(f) === norm(file));
  if (!match) throw new Error(`Fichier introuvable : ressources/${dir}/${file}`);
  return path.join(RES, folder, match);
}

/** Téléverse une image et renvoie un champ imageWithAlt. */
async function image(dir, file, alt) {
  const asset = await client.assets.upload("image", readFileSync(find(dir, file)), { filename: file });
  return { _type: "imageWithAlt", asset: { _type: "reference", _ref: asset._id }, alt };
}

const block = (key, title, text) => ({ _key: key, _type: "caseBlock", ...(title && { title }), text: fr(text) });

/** Crée le document s'il manque (squelette), puis pose uniquement les champs fournis. */
async function upsert(id, skeleton, fields) {
  if (await client.getDocument(`drafts.${id}`)) {
    console.warn(`Attention : un brouillon drafts.${id} existe ; il masquera ces changements dans le Studio tant qu'il n'est pas publié ou abandonné.`);
  }
  await client.createIfNotExists({ _id: id, _type: "caseStudy", ...skeleton });
  const res = await client.patch(id).set(fields).commit();
  console.log(`OK : ${res._id} (révision ${res._rev}). Champs : ${Object.keys(fields).join(", ")}.`);
}

// ---------------------------------------------------------------- Carpigiani
{
  const D = "Page Carpigiani";
  const [heroBg, logo, img1, img2, img3] = await Promise.all([
    image(D, "carpigiani-hero-bg.png", "Coupes de glace artisanale vues du dessus, photo en noir et blanc assombrie"),
    image(D, "carpigiani-logo.png", "Carpigiani"),
    image(D, "Cas 2 _ Carpigiani-img1.png", "Coupe de glace « Gelato University Carpigiani » sur une soucoupe, avec une cuillère et des grains de café, photo en noir et blanc"),
    image(D, "Cas 2 _ Carpigiani-img2.png", "Cuve d’une machine à glace en marche, la pale en mouvement, photo en noir et blanc"),
    image(D, "Cas 2 _ Carpigiani-img3.png", "Glacier en tenue et casquette Carpigiani utilisant une machine à glace, photo en noir et blanc"),
  ]);
  const title = fr("Carpigiani France : comment soutenir la saison commerciale et générer plus de 700 leads ?");
  await upsert(
    "caseStudy-carpigiani",
    { language: "fr", title, slug: { _type: "slug", current: "carpigiani" } },
    {
      language: "fr",
      title,
      slug: { _type: "slug", current: "carpigiani" },
      clientName: "Carpigiani",
      sector: "Distribution & logistique",
      // Carte (non affichée sur l'accueil : le cas n'est pas dans la liste « Nos cas clients »)
      image: img1,
      tag: "Campagnes · Distribution & logistique",
      question: fr("comment soutenir la saison commerciale et générer plus de 700 leads ?"),
      background: heroBg,
      logo,
      logoSize: 150,
      highlights: ["700+ leads uniques", "200+ téléchargements de catalogues", fr("30 % du new business généré")],
      // Page détail
      detailHero: {
        background: heroBg,
        logo,
        nameLine2: "France",
        subtitle: ["Soutenir la saison commerciale", "et générer plus de 700 leads"],
        intro: fr(
          "Pour accompagner son lancement de saison, Carpigiani France a confié à Héroïstes un dispositif digital associant création, contenus, parcours de conversion et campagnes médias. L’objectif : alimenter les équipes commerciales en prospects issus de métiers ciblés.",
        ),
      },
      detailIntro: {
        title: ["Une marque de référence,", "des besoins propres à chaque métier"],
        text: fr(
          "Carpigiani France commercialise des équipements professionnels pour la fabrication de glaces artisanales, de glaces à l’italienne et de desserts glacés.\nArtisans glaciers, restaurateurs, forains ou boulangers : ses clients partagent un potentiel de développement autour de la glace, mais leurs contraintes et leurs besoins en équipements diffèrent.\nPour soutenir les opérations commerciales et promotionnelles de la marque, il fallait relier chaque offre aux attentes de ces différents publics.",
        ),
        image: img1,
      },
      challenge: {
        title: "Notre défi",
        lead: "Créer un flux continu de prospects pour les commerciaux",
        text: fr(
          "Le lancement de saison constitue un moment stratégique pour présenter les machines, valoriser les promotions et faire émerger des projets d’achat.\nLa mission d’Héroïstes : construire un dispositif capable d’attirer les professionnels ciblés, de les orienter vers les équipements adaptés et de maintenir le contact jusqu’à l’échange commercial.\n\nNous avons articulé la campagne autour d’un parcours complet : **capter l’attention, faciliter le choix et accompagner la décision.**",
        ),
      },
      chapters: [
        {
          _key: "chapitre-1",
          _type: "caseChapter",
          title: ["Faire émerger l’offre", "avec des créations et", "des contenus incarnés"],
          blocks: [
            block(
              "chapitre-1-bloc-1",
              ["Des créations au service des", "temps forts commerciaux"],
              "Nous avons conçu des visuels et messages dédiés aux promotions et aux campagnes, en cohérence avec le positionnement de Carpigiani.\n\n**Ces créations ont alimenté le plan média et les réseaux sociaux** pour donner de la visibilité aux offres tout au long de la campagne.",
            ),
            block(
              "chapitre-1-bloc-2",
              ["Dix vidéos pour montrer les machines", "à travers ceux qui les utilisent"],
              "**Une production de dix vidéos** a permis de mettre à l’honneur le savoir-faire des artisans et la place des équipements Carpigiani dans leur quotidien.\n\nAvec la maison Nardone, glacier historique lyonnais, ces contenus ont donné un visage à la marque et illustré l’histoire et la fiabilité de ses machines à travers une expérience concrète.",
            ),
          ],
          image: img2,
          imageSide: "right",
        },
        {
          _key: "chapitre-2",
          _type: "caseChapter",
          title: ["Orienter chaque", "professionnel", "vers une offre adaptée"],
          blocks: [
            block(
              "chapitre-2-bloc-1",
              ["Un hub central et cinq", "landing pages par métier"],
              "Nous avons créé un hub digital réunissant les machines et les promotions, complété par cinq landing pages dédiées aux métiers ciblés.\nChaque parcours permettait au prospect de découvrir les équipements correspondant à son activité et de poursuivre sa démarche auprès de Carpigiani.\n\n**Un point d’entrée commun pour la marque, des parcours spécifiques pour faciliter la conversion.**",
            ),
            block(
              "chapitre-2-bloc-2",
              ["Prolonger la relation après", "le premier contact"],
              "L’acquisition s’accompagnait d’un dispositif de relance connecté au CRM : trois séquences de cinq emails, conçues pour entretenir l’intérêt des prospects et accompagner leur réflexion.\nCes quinze emails prolongeaient les campagnes au-delà de la première visite ou du téléchargement d’un catalogue, afin de soutenir le travail des équipes commerciales.",
            ),
          ],
          image: img3,
          imageSide: "left",
        },
        {
          _key: "chapitre-3",
          _type: "caseChapter",
          title: ["Piloter les campagnes", "au service de l’activité", "commerciale"],
          blocks: [
            block(
              "chapitre-3-bloc-1",
              null,
              "**Héroïstes a assuré la stratégie et le pilotage des achats médias sur Meta et Google.**\n**Le dispositif associait ciblage des audiences, messages promotionnels et pages dédiées pour générer des contacts pertinents et optimiser la performance des campagnes.**\n\n**Création, acquisition et relance travaillaient ainsi vers un même objectif : alimenter les opportunités commerciales de Carpigiani France.**",
            ),
          ],
          imageSide: "right",
          textWidth: 660,
        },
      ],
    },
  );
}

// ---------------------------------------------------------------- Beauchamp
{
  const D = "Page Beauchamp";
  const [heroBg, logo, img1, img2, img3] = await Promise.all([
    image(D, "beauchamp-hero-bg.png", "Atelier de découpe industrielle avec machines et pièces en mousse, photo en noir et blanc assombrie"),
    image(D, "beauchamp-logo.png", "Beauchamp S.A"),
    image(D, "Cas 2 _ Beauchamp détails-img1.png", "Presse industrielle dans un atelier, photo en noir et blanc"),
    image(D, "Cas 2 _ Beauchamp détails-img2.png", "Technicien réglant une table de découpe numérique, photo en noir et blanc"),
    image(D, "Cas 2 _ Beauchamp détails-img3.png", "Tête de découpe au-dessus d’une plaque de mousse, un joint découpé au premier plan, photo en noir et blanc"),
  ]);
  const title = fr("Beauchamp : comment transformer l’expertise industrielle en opportunités commerciales ?");
  await upsert(
    "caseStudy-beauchamp",
    { language: "fr", title, slug: { _type: "slug", current: "beauchamp" } },
    {
      language: "fr",
      title,
      slug: { _type: "slug", current: "beauchamp" },
      clientName: "Beauchamp",
      sector: "Industrie",
      image: img1,
      tag: "Acquisition · Industrie",
      question: fr("comment transformer l’expertise industrielle en opportunités commerciales ?"),
      background: heroBg,
      logo,
      logoSize: 150,
      highlights: ["70+ leads par mois", "Campagnes ciblées par matière et par solution", "Accompagnement digital toute l’année"],
      detailHero: {
        background: heroBg,
        logo,
        subtitle: ["Transformer l’expertise industrielle", "en opportunités commerciales"],
        intro:
          "Héroïstes accompagne le groupe Beauchamp toute l’année pour valoriser son savoir-faire, faire évoluer ses outils digitaux et développer son acquisition. Un dispositif transverse, piloté en lien direct avec les équipes commerciales.",
      },
      detailIntro: {
        title: ["Un savoir-faire industriel à faire", "connaître et à faire choisir"],
        text: fr(
          "Spécialiste de la découpe et de la transformation de matériaux souples, Beauchamp réalise des pièces sur mesure pour des applications de filtration, d’étanchéité, d’isolation, de calage et d’emballage.\nL’enjeu : rendre cette expertise visible auprès des entreprises qui recherchent une matière, une application ou une réponse à une problématique industrielle précise.\nHéroïstes accompagne le groupe sur l’ensemble du parcours : présenter son offre, attirer les prospects et soutenir les échanges commerciaux.",
        ),
        image: img1,
      },
      challenge: {
        title: "Notre défi",
        lead: "Faire du digital un canal d’acquisition stratégique",
        text: fr(
          "Notre mission consiste à relier les enjeux de communication du groupe à ses objectifs commerciaux.\nNous coordonnons la maintenance et l’évolution des sites, les campagnes de référencement payant et la production de films promotionnels autour d’une même priorité : **générer des demandes pertinentes pour les équipes commerciales.**",
        ),
      },
      chapters: [
        {
          _key: "chapitre-1",
          _type: "caseChapter",
          title: ["Capter la demande", "par les matières et les", "solutions"],
          blocks: [
            block(
              "chapitre-1-bloc-1",
              ["Deux approches complémentaires pour", "répondre aux recherches des", "prospects"],
              "Les professionnels peuvent rechercher une matière précise ou partir d’un besoin : filtrer, isoler, protéger, assurer l’étanchéité ou caler un produit.\nNous structurons les campagnes Search autour de ces deux portes d’entrée. Les campagnes par matière valorisent les matériaux travaillés par Beauchamp ; les campagnes par solution mettent en avant leurs applications.\n**Cette organisation permet d’adapter les annonces à l’intention de recherche et d’orienter les prospects vers l’offre correspondante.**",
            ),
            block(
              "chapitre-1-bloc-2",
              ["Un pilotage continu avec les équipes", "commerciales"],
              "Tout au long de l’année, Héroïstes pilote les campagnes et échange avec le service commercial sur la pertinence des leads reçus.\nCes retours alimentent les optimisations et le suivi du retour sur investissement, pour rapprocher les décisions médias de la réalité des demandes et de leur potentiel commercial.\n\n**La qualité des contacts guide le pilotage, aux côtés du volume généré.**",
            ),
          ],
          image: img2,
          imageSide: "right",
          textWidth: 620,
        },
        {
          // Suite du chapitre 1 sans grand titre (maquette)
          _key: "chapitre-2",
          _type: "caseChapter",
          blocks: [
            block(
              "chapitre-2-bloc-1",
              ["Entretenir et faire évoluer", "les sites du groupe"],
              // La maquette isole le point final sur une ligne (« sauvegardes / . ») : coquille corrigée.
              "Les sites constituent le socle du dispositif d’acquisition : ils présentent les expertises et permettent aux prospects d’engager une prise de contact.\nHéroïstes assure leur maintenance et leurs évolutions, notamment les mises à jour des CMS et les sauvegardes.\n**Cet accompagnement continu permet aux outils digitaux de suivre les besoins de communication du groupe et de soutenir ses campagnes toute l’année.**",
            ),
            block(
              "chapitre-2-bloc-2",
              ["Montrer l’expertise sur les salons", "et sur le web"],
              "Nous réalisons des films promotionnels pour donner à voir le savoir-faire et les capacités de Beauchamp.\nUtilisés sur les salons et sur le web, ces contenus soutiennent les prises de parole de la marque et offrent aux équipes des supports concrets pour présenter l’entreprise.\nIls prolongent la visibilité du groupe entre les événements professionnels et les points de contact digitaux.",
            ),
          ],
          image: img3,
          imageSide: "left",
          textWidth: 580,
        },
        {
          _key: "chapitre-3",
          _type: "caseChapter",
          title: [fr("Les résultats : plus de 70"), "leads par mois"],
          blocks: [
            block(
              "chapitre-3-bloc-1",
              null,
              "**Le dispositif d’acquisition génère plus de 70 leads mensuels, avec des campagnes organisées autour des matières et des solutions proposées par Beauchamp.**",
            ),
          ],
          imageSide: "right",
          textWidth: 660,
        },
      ],
    },
  );
}

// ---------------------------------------------------------------- Pranéo : « Heroïstes » → « Héroïstes »
{
  const ID = "caseStudy-praneo";
  const doc = await client.getDocument(ID);
  if (!doc) {
    console.error(`Erreur : le document publié ${ID} est introuvable.`);
    process.exit(1);
  }
  const fix = (s) => (typeof s === "string" ? s.replaceAll("Heroïstes", "Héroïstes") : s);
  const set = {};
  if (doc.detailHero?.intro !== fix(doc.detailHero?.intro)) set["detailHero.intro"] = fix(doc.detailHero.intro);
  for (const ch of doc.chapters ?? []) {
    for (const b of ch.blocks ?? []) {
      if (b.text !== fix(b.text)) set[`chapters[_key=="${ch._key}"].blocks[_key=="${b._key}"].text`] = fix(b.text);
    }
  }
  if (Object.keys(set).length) {
    const res = await client.patch(ID).set(set).commit();
    console.log(`OK : ${res._id} (révision ${res._rev}). Corrigé : ${Object.keys(set).join(", ")}.`);
  } else {
    console.log(`OK : ${ID} déjà à jour.`);
  }
}
