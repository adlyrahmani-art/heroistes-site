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
    image: "/images/impact-mesure.jpg",
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
