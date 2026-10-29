// Arborescence du menu (ressources/Menu.png)
// [À valider] Les URL des pages internes sont provisoires, construites à partir des intitulés.

export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; links: NavLink[] };
/** Clés des libellés de 1er niveau dans les Réglages (siteSettings.navLabels) */
export type NavKey = "accueil" | "expertises" | "conseil" | "casClients" | "secteurs" | "agence" | "blog" | "contact";
export type NavLabels = Partial<Record<NavKey, string | null | undefined>>;
export type NavItem = {
  /** Clé du libellé éditable dans les Réglages */
  key: NavKey;
  /** Libellé par défaut (remplacé par celui des Réglages quand il existe) */
  label: string;
  href: string;
  /** Sous-menu : groupes titrés (Expertises) ou liste simple */
  groups?: NavGroup[];
  links?: NavLink[];
  /** Phrase d'accroche affichée dans le panneau du sous-menu */
  pitch?: string;
};

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "et")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const links = (base: string, labels: string[]): NavLink[] =>
  labels.map((label) => ({ label, href: `${base}${slug(label)}/` }));

const group = (label: string, items: string[]): NavGroup => ({
  label,
  links: links(`/expertises/${slug(label)}/`, items),
});

export const navigation: NavItem[] = [
  { key: "accueil", label: "Accueil", href: "#accueil" },
  {
    key: "expertises",
    label: "Expertises",
    href: "#expertises",
    pitch: "Six expertises réunies dans une agence 360, pour des actions qui se renforcent.",
    groups: [
      group("Développement commercial", ["Stratégie commerciale", "Prospection commerciale", "Génération de leads"]),
      group("Branding & contenu", [
        "Plateforme de marque",
        "Identité visuelle",
        "Création de contenu",
        "Vidéo corporate",
        "Agence social media",
      ]),
      group("Digital experience", ["Site institutionnel", "E-commerce B2B", "Landing page", "Application métier", "UX Design"]),
      group("Acquisition & performance", ["SEO", "GEO", "Google Ads", "Social Ads", "Marketing automation", "Web analytics"]),
    ],
  },
  {
    key: "conseil",
    label: "Conseil",
    href: "/conseil/",
    pitch: "Un regard extérieur sur vos ventes et votre marketing, et un plan d’action concret.",
    links: links("/conseil/", ["Audit commercial", "Audit digital", "Accompagnement dirigeant"]),
  },
  {
    key: "casClients",
    label: "Cas clients",
    href: "#cas-clients",
    pitch: "Des projets menés pour nos clients, chacun en réponse à un enjeu précis.",
    links: links("/cas-clients/", [
      "Pranéo",
      "Carpigiani",
      "Beauchamp",
      "Rezo Partage",
      "Bioport",
      "Isère Habitat",
      "Arkolia",
      "Air DDM",
      "Orrizzon",
      "Peektoria",
      "Isotac",
      "Minos",
    ]),
  },
  {
    key: "secteurs",
    label: "Secteurs",
    href: "/secteurs/",
    pitch: "Des équipes qui connaissent les cycles de vente de votre secteur.",
    links: [
      { label: "Industrie", href: "/secteurs/industrie/" },
      { label: "Tech & SaaS", href: "/secteurs/tech-saas/" },
      { label: "Services B2B", href: "/secteurs/services-b2b/" },
      { label: "Distribution & logistique", href: "/secteurs/distribution-logistique/" },
    ],
  },
  { key: "agence", label: "L’agence", href: "/agence/" },
  { key: "blog", label: "Blog", href: "#blog" },
  { key: "contact", label: "Contact", href: "#contact" },
];
