// Contenu de la page d'accueil (source : ressources/CONTENU_ACCUEIL_2026-10-19.docx + maquettes)

export const hero = {
  eyebrow: ["Le", "héros", "du R.O.I."],
  titleLines: ["L’agence", "marketing B2B"],
  subtitle: "jugée sur vos",
  highlight: "ventes",
  // Texte en gras entre ** **
  text: "Notre obsession ? **Aider les PME et ETI à se développer**, en réunissant stratégie, prospection, marque, digital et acquisition chez un seul partenaire, pour une croissance qui dure, année après année.",
  ctaPrimary: { label: "Discutons de votre projet", href: "#contact" },
  ctaSecondary: { label: "Découvrez nos expertises", href: "#expertises" },
};

export type Engagement = {
  num: string;
  title: [string, string];
  ghost: string;
  text: string;
  image: string;
  imageAlt: string;
  side: "left" | "right"; // côté du titre par rapport à la ligne centrale
};

export const engagements: Engagement[] = [
  {
    num: "01.",
    title: ["Approche", "globale"],
    ghost: "Globale",
    text: "**Marque, site et acquisition** sont pensés ensemble, pour que vos actions se renforcent au lieu de se contredire.",
    image: "/images/approche-globale.png",
    imageAlt: "Deux poings tendus vers l’objectif",
    side: "left",
  },
  {
    num: "02.",
    title: ["Spécialisation", "B2B"],
    ghost: "B2B",
    text: "Des cycles de vente longs, plusieurs décideurs : nous ne travaillons qu’avec **des entreprises qui vendent aux entreprises.**",
    image: "/images/specialisation-b2b.png",
    imageAlt: "Professionnels marchant devant un mur de béton",
    side: "right",
  },
  {
    num: "03.",
    title: ["Accès", "direct"],
    ghost: "Direct",
    text: "**Vous échangez avec les associés qui décident**, pas avec un chef de projet intermédiaire.",
    image: "/images/acces-direct.png",
    imageAlt: "Mains sur le clavier d’un ordinateur portable",
    side: "left",
  },
  {
    num: "04.",
    title: ["Impact", "mesuré"],
    ghost: "Impact",
    text: "**Chaque action se mesure** à ce qu’elle apporte à votre chiffre d’affaires, pas en clics.",
    image: "/images/impact-mesure.png",
    imageAlt: "Silhouette dans une rue baignée de lumière",
    side: "right",
  },
];

export const logos = {
  text: "Ils nous confient déjà leur croissance, de la stratégie aux campagnes.",
  // Logos gris sur fond transparent ; largeur/hauteur = taille native du PNG
  clients: [
    { name: "Carpigiani", src: "/images/logos/carpigiani.png", w: 173, h: 74 },
    { name: "Pranéo", src: "/images/logos/praneo.png", w: 126, h: 126 },
    { name: "Arkolia", src: "/images/logos/arkolia.png", w: 188, h: 82 },
    { name: "Isère Habitat", src: "/images/logos/isere-habitat.png", w: 154, h: 146 },
    { name: "Beauchamp", src: "/images/logos/beauchamp.png", w: 210, h: 49 },
    { name: "Isotac", src: "/images/logos/isotac.png", w: 147, h: 26 },
    { name: "Rezo Partage", src: "/images/logos/rezo-partage.png", w: 176, h: 135 },
  ],
};

export const besoins = {
  title: "Vos besoins, nos solutions",
  intro:
    "**Un bon accompagnement** commence par le bon problème.\nLeads trop rares, site silencieux, marque floue, visibilité en berne : trouvez le vôtre parmi ces six situations. Nous démarrons par lui, sans bousculer vos partenaires actuels.",
  items: [
    {
      title: "Je manque de leads",
      text: "Vos commerciaux attendent des contacts qui n’arrivent pas. Nous activons les canaux adaptés à vos acheteurs pour **générer plus de leads qualifiés**.",
      offer: "Génération de leads",
      href: "/developpement-commercial/generation-leads/",
      image: "/images/besoin-leads.jpg",
    },
    {
      title: "Mon site ne génère aucune demande",
      text: "Du trafic, mais ni appel ni formulaire envoyé. Nous repensons vos pages pour obtenir **un site qui transforme vos visiteurs en contacts**.",
      offer: "Site institutionnel",
      href: "/digital/site-institutionnel/",
      image: "/images/besoin-site.jpg",
    },
    {
      title: "Ma marque n’est pas claire",
      text: "Chacun présente l’entreprise à sa façon, vos prospects s’y perdent. Nous vous aidons à **clarifier votre positionnement de marque** pour de bon.",
      offer: "Plateforme de marque",
      href: "/branding/plateforme-de-marque/",
      image: "/images/besoin-marque.jpg",
    },
    {
      title: "Mes ventes plafonnent",
      text: "Le chiffre d’affaires stagne malgré l’énergie de vos équipes. Notre audit commercial permet de **comprendre ce qui bloque vos ventes**, puis d’agir.",
      offer: "Audit commercial",
      href: "/conseil/audit-diagnostic-commercial/",
      image: "/images/besoin-ventes.jpg",
    },
    {
      title: "On ne nous trouve ni sur Google ni dans les IA",
      text: "Vos concurrents ressortent partout, pas vous. Nous travaillons votre SEO et votre GEO pour **être visible sur Google et dans les IA**.",
      offer: "SEO",
      href: "/acquisition/seo/",
      image: "/images/besoin-visibilite.jpg",
    },
    {
      title: "Je ne sais pas ce qui rapporte",
      text: "Publicité, salons, réseaux sociaux : impossible de dire ce qui paie. Nous installons un suivi pour **mesurer ce que rapporte chaque canal**.",
      offer: "Web analytics",
      href: "/acquisition/tracking-analytics/",
      image: "/images/besoin-analytics.jpg",
    },
  ],
};

export type Expertise = {
  title: [string] | [string, string];
  lead: string; // première phrase, en gras
  text: string;
  link?: { before: string; label: string; href: string }; // phrase finale avec lien explicite
};

/** Bloc 9.4 · Expertises (maquettes « Expertises - Titre / Details / Cards »). */
export const expertises = {
  title: ["Six expertises réunies", "dans une agence 360"],
  heading: "Nos expertises",
  intro:
    "Une agence qui fait tout ne fait rien à fond ?\n**Chez Héroïstes, chaque pôle a ses propres spécialistes.**\nLes trois premiers posent la stratégie, les trois suivants la déploient, et tous travaillent sur le même dossier : le vôtre.",
  image: "/images/expertises-dactylo.jpg",
  strategy: [
    {
      title: ["Conseil"],
      lead: "Avant d’investir, sachez où agir.",
      text: "Nous analysons votre stratégie marketing et votre stratégie numérique, puis traçons une feuille de route claire.",
      link: { before: "Un regard extérieur précieux pour les dirigeants : découvrez notre offre de", label: "conseil et stratégie digitale", href: "/conseil/" },
    },
    {
      title: ["Développement", "commercial"],
      lead: "Prospection commerciale, génération de leads, séquences de relance : nous alimentons votre pipeline commercial.",
      text: "Vos commerciaux cherchent moins de contacts et signent davantage.",
      link: { before: "Pour sortir de la dépendance au bouche-à-oreille, nous vous aidons à", label: "développer vos ventes", href: "/developpement-commercial/" },
    },
    {
      title: ["Branding", "et contenu"],
      lead: "Plateforme de marque, identité visuelle, marketing de contenu : nous agissons en agence de communication B2B, au service de vos ventes.",
      text: "",
      link: { before: "Votre offre mérite d’être bien racontée : nous vous aidons à", label: "structurer votre image de marque", href: "/branding/" },
    },
  ] as Expertise[],
  delivery: [
    {
      title: ["Digital", "Experience"],
      lead: "Site institutionnel, e-commerce, landing pages, applications métier, UX/UI : des outils pensés pour la conversion et connectés à votre CRM.",
      text: "",
      link: { before: "Une étape clé de votre transformation numérique, menée avec vous : découvrez", label: "nos sites et outils digitaux", href: "/digital/" },
    },
    {
      title: ["Acquisition", "et performance"],
      lead: "SEO, GEO, publicité en ligne sur Google Ads et LinkedIn, marketing automation : nous pilotons tout votre webmarketing, jusque dans les moteurs d’intelligence artificielle.",
      text: "",
      link: { before: "Pour une acquisition client maîtrisée, nous vous aidons à", label: "structurer votre acquisition digitale", href: "/acquisition/" },
    },
    {
      // Pas de lien tant que la page /cybersecurite/ n'est pas publiée (note du docx)
      title: ["Cybersécurité"],
      lead: "Un site piraté ou des données exposées peuvent ruiner des mois d’efforts commerciaux.",
      text: "Nous auditons la sécurité de vos outils digitaux, puis corrigeons les failles prioritaires, pour préserver la confiance de vos clients sans monter d’équipe dédiée.",
    },
  ] as Expertise[],
};

/** Bloc 9.5 · Pourquoi une agence spécialisée (maquette « Section Pourquoi choisir »). */
export const pourquoi = {
  title: ["Pourquoi choisir une", "agence spécialisée en B2B ?"],
  intro:
    "**Vendre à une entreprise ne ressemble en rien à vendre à un particulier**.\nLes recettes du marketing grand public y fonctionnent mal, et une agence généraliste le découvre souvent trop tard. Trois réalités changent la donne :",
  items: [
    {
      title: ["Un cycle de", "vente long"],
      text: "Entre le premier contact et la signature, il s’écoule souvent des mois. **Vos prospects doivent trouver le bon contenu** à chaque étape, sans relance maladroite.",
      image: "/images/pourquoi-cycle.jpg",
      imageAlt: "Longue route droite qui file vers l’horizon",
    },
    {
      title: ["Plusieurs", "décideurs à", "convaincre"],
      text: "**Dirigeant, acheteur, direction technique** : chacun juge votre offre avec ses propres critères. Votre discours doit rassurer chacun d’eux, sans jamais en oublier un seul.",
      image: "/images/pourquoi-decideurs.jpg",
      imageAlt: "Homme devant un mur couvert de portraits épinglés",
    },
    {
      title: ["Des ventes et", "un marketing", "à aligner"],
      text: "Quand le marketing envoie des contacts que vos commerciaux jugent inutiles, tout le monde perd. **Une logique RevOps donne les mêmes objectifs aux deux équipes.**",
      image: "/images/pourquoi-alignement.jpg",
      imageAlt: "Téléphone public couvert de graffitis",
    },
  ],
  outro:
    "Nos associés cumulent 15 ans d’expérience en marketing et en développement commercial. Ils ont fondé Héroïstes pour mettre ce savoir-faire au service des dirigeants qui veulent des résultats concrets.",
  cta: { label: "Découvrez l’agence Héroïstes", href: "/agence/" },
};

/** Bloc 9.6 · Du plan aux résultats (maquette « Agence marketing B2B _ comment passer du plan aux résultats »). */
export const plan = {
  title: "Agence marketing B2B :",
  subtitle: "Comment passer du plan aux résultats ?",
  intro:
    "Combien de plans marketing ne dépassent jamais le stade du document ? Une agence B2B ne devrait pas s’arrêter au conseil.\nChez Héroïstes, les mêmes équipes conçoivent le plan, le déploient, puis répondent de ses résultats.",
  steps: [
    {
      title: ["Définir la stratégie"],
      text: "Tout commence par un diagnostic de vos ventes, de votre marché et de votre marque. Avec vous, nous fixons cibles prioritaires, positionnement et objectifs commerciaux, puis une feuille de route : quelles actions, dans quel ordre, avec quel budget.",
      image: "/images/plan-strategie.jpg",
      imageAlt: "Partie d’échecs géants sur une place",
    },
    {
      title: ["La mettre en œuvre", "et la mesurer"],
      text: "Nos équipes déploient ensuite le plan : prospection, site web, contenus, campagnes Google Ads ou LinkedIn, marketing automation.\nAucun passage de relais entre prestataires. Chaque action est tracée jusque dans votre CRM, et nos rapports parlent de leads et de ventes.",
      image: "/images/plan-mesure.jpg",
      imageAlt: "Compteur à aiguille sur un tableau de bord ancien",
    },
  ],
  outro: [
    "C’est tout le sens de notre signature, le Héros du R.O.I. Nous savons ce que produit chaque action : ce qui fait avancer vos ventes est renforcé, le reste est corrigé ou arrêté.",
    "Les objectifs sont fixés avec vous dès le départ, et nous faisons le point ensemble à chaque étape. Vous restez libre : on peut commencer par un seul besoin, puis aller plus loin quand vous êtes convaincu.",
  ],
  cta: { label: "Discutons de votre projet", href: "/contact/" },
};

/* ---------- Bloc 9.7 · Cas clients ---------- */
export type CasClient = {
  slug: string;
  /** Nom du client : en turquoise dans le titre, et en grand dans le texte défilant */
  name: string;
  question: string;
  tag: string;
  image: string;
  imageAlt: string;
  /** Fond flouté et assombri, plein écran */
  bg: string;
  logo: string;
  logoAlt: string;
  /** Diamètre du logo sur la maquette (px à 1920) */
  logoSize: number;
  items: string[];
  /** Chiffre clé (Isère Habitat seulement) : résultat en gras, puis période et source */
  stat?: { result: string; detail: string };
};

export const casClients = {
  title: ["Nos cas clients", "trois expertises", "en action"],
  intro:
    "Plutôt que de longs discours, voici quelques projets menés pour nos clients. Choisir une agence digitale B2B, c’est attendre des réponses concrètes : **chacun de ces cas répond à un enjeu précis**, avec l’expertise la mieux placée pour le traiter.",
  image: "/images/cas-intro.jpg",
  imageAlt: "Bureau d’agence : écran affichant une carte, documents et affiches au mur",
  cases: [
    {
      slug: "praneo",
      name: "Pranéo",
      question: "comment lancer une offre avec des landing pages dédiées ?",
      tag: "Landing pages · Bien-être",
      image: "/images/cas-praneo.jpg",
      imageAlt: "Soin bien-être : une praticienne auprès d’une cliente allongée",
      bg: "/images/cas-praneo-bg.jpg",
      logo: "/images/logo-praneo.png",
      logoAlt: "Logo Pranéo",
      logoSize: 122,
      items: ["Stratégie de lancement", "Landing pages et SEO", "Campagnes Google et Meta", "Tracking et séquences e-mail"],
    },
    {
      slug: "rezo-partage",
      name: "Rezo Partage",
      question: "comment clarifier sa marque et son offre ?",
      tag: "Plateforme de marque",
      image: "/images/cas-rezo-partage.jpg",
      imageAlt: "Mains assemblant les pièces d’un puzzle",
      bg: "/images/cas-rezo-partage-bg.jpg",
      logo: "/images/logo-rezo-partage.png",
      logoAlt: "Logo Rezo Partage",
      logoSize: 177,
      items: ["Audit de l’existant", "Ateliers de marque", "Architecture de l’offre"],
    },
    {
      slug: "isere-habitat",
      name: "Isère Habitat",
      question: "comment gagner en visibilité sur Google ?",
      tag: "Site web · Promotion immobilière",
      image: "/images/cas-isere-habitat.jpg",
      imageAlt: "Résidence neuve au pied des montagnes",
      bg: "/images/cas-isere-habitat-bg.jpg",
      logo: "/images/logo-isere-habitat.png",
      logoAlt: "Logo Isère Habitat",
      logoSize: 177,
      items: ["Audit complet", "Refonte du site", "Suivi des résultats"],
      stat: {
        result: "+12 % de clics Google sur 4 mois.",
        detail: "Juin à octobre 2026, comparé à la même période de 2025, source Google Search Console.",
      },
    },
  ] satisfies CasClient[],
  cta: { label: "Voir nos cas clients", href: "/cas-clients/" },
};

/* ---------- Bloc 9.8 · Blog (derniers articles) ---------- */
export type Article = {
  /** Début du titre en gras, suite en texte courant */
  lead: string;
  rest: string;
  date: string;
  /** Format de la photo sur la maquette : haute (438 × 454) ou basse (438 × 321) */
  tall: boolean;
  image: string;
  imageAlt: string;
  href: string;
};

export const blog = {
  title: ["Blog", "Nos dernières", "publications"],
  // [À brancher] Les 3 derniers articles publiés doivent remonter automatiquement ; URL à confirmer
  articles: [
    {
      lead: "L’illusion de l’esthétique :",
      rest: "pourquoi votre refonte UI ne convertit pas (et la méthode à adopter)",
      date: "27 octobre 2026",
      tall: true,
      image: "/images/blog-1.jpg",
      imageAlt: "Plans d’architecte et crayons sur une table à dessin",
      href: "/blog/illusion-esthetique-refonte-ui/",
    },
    {
      lead: "Comment une simple refonte de la grille de layout a fait chuter le taux de rebond de 40%",
      rest: "",
      date: "27 octobre 2026",
      tall: false,
      image: "/images/blog-2.jpg",
      imageAlt: "Visage derrière un filet tendu",
      href: "/blog/refonte-grille-layout-taux-de-rebond/",
    },
    {
      lead: "Petits détails, grands impacts :",
      rest: "l’art du design comportemental dans la conversion B2B",
      date: "27 octobre 2026",
      tall: true,
      image: "/images/blog-3.jpg",
      imageAlt: "Femme sur un balcon face à l’Arc de triomphe",
      href: "/blog/design-comportemental-conversion-b2b/",
    },
    {
      lead: "Friction intentionnelle :",
      rest: "quand briser les règles de l’UX classique génère plus d’engagement",
      date: "27 octobre 2026",
      tall: false,
      image: "/images/blog-4.jpg",
      imageAlt: "Bureau lumineux avec un ordinateur",
      href: "/blog/friction-intentionnelle-ux/",
    },
  ] satisfies Article[],
  cta: { label: "Tous nos articles", href: "/blog/" },
};

/* ---------- Bloc 9.9 · FAQ ---------- */
export const faq = {
  title: ["Vos questions,", "nos réponses"],
  items: [
    {
      q: "Que fait concrètement une agence marketing B2B ?",
      a: "Une agence marketing B2B commence par trouver où se bloquent vos ventes, puis mobilise les bons leviers pour générer des leads qualifiés. Prenons un fabricant qui reçoit des visites mais peu de devis : l’agence analyse son parcours, revoit les pages clés, cible les acheteurs de son secteur et suit chaque demande jusqu’à la vente.",
    },
    {
      q: "Quelle différence entre le marketing B2B et le B2C ?",
      a: "En B2B, vous vendez à une entreprise : le montant est plus élevé, le cycle plus long et la décision partagée entre plusieurs personnes. Le B2C joue davantage sur l’émotion et l’impulsion. Il faut donc d’abord rassurer, prouver son expertise et soigner la fidélisation client, d’où l’intérêt d’une agence marketing BtoB habituée à ces parcours.",
    },
    {
      q: "Comment structurer son marketing quand on vend aux entreprises ?",
      a: "Commencez par définir vos cibles prioritaires et votre positionnement, puis choisissez deux ou trois canaux adaptés à vos acheteurs plutôt que d’être partout. Fixez des objectifs mesurables, partagés avec les commerciaux, et suivez les résultats dans votre CRM. Quand marketing et ventes partagent les mêmes indicateurs, aucun lead ne se perd entre les deux équipes.",
    },
    {
      q: "Quel marketing est le plus efficace pour trouver des clients professionnels ?",
      a: "Il n’existe pas de canal miracle : tout dépend de votre cible et du rythme de vos ventes. Le marketing de contenu et le SEO attirent des prospects en recherche, LinkedIn et Google Ads accélèrent la visibilité, le marketing automation entretient le lien. Combinés en inbound marketing, ces leviers offrent le meilleur retour sur investissement.",
    },
    {
      q: "Qui sont les clients B2B et comment les atteindre ?",
      a: "Ce sont avant tout des entreprises, le plus souvent des PME et des ETI, mais aussi des grands comptes et des administrations. Pour les atteindre, identifiez les décideurs, comprenez leurs priorités et soyez présent là où ils s’informent : Google, assistants d’IA, LinkedIn, salons professionnels. Votre message doit parler de leur problème avant votre offre.",
    },
  ],
};

/* ---------- Footer · Bloc 9.10 Contact ---------- */
export const footer = {
  // H2 du brief (bloc 9.10), en grand avant le footer
  lead: ["Votre prochaine étape :", "un premier échange"],
  title: ["Démarrez", "votre projet"],
  intro:
    "Quelques informations suffisent pour démarrer.\n**Remplissez le formulaire ci-dessous** : nous revenons vers vous pour échanger sur votre projet, sans engagement.",
  // Champs du formulaire de la page Contact (https://heroistes.com/contact/), libellés visibles
  fields: [
    { name: "nom", label: "Nom", type: "text", placeholder: "Martin", autoComplete: "family-name" },
    { name: "prenom", label: "Prénom", type: "text", placeholder: "Olivier", autoComplete: "given-name" },
    { name: "email", label: "Email", type: "email", placeholder: "olivier_martin@gmail.com", autoComplete: "email" },
    { name: "telephone", label: "Téléphone", type: "tel", placeholder: "+33 123 456 789", autoComplete: "tel" },
    { name: "sujet", label: "Sujet", type: "text", placeholder: "Créer mon site web", autoComplete: "off" },
  ],
  description: { name: "description", label: "Description du projet", placeholder: "Description ici" },
  submit: "Envoyer ma demande",
  // [À valider] Mention RGPD demandée par le brief ; URL de la politique à confirmer
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
