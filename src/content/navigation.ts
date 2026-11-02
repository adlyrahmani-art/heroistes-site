// Arborescence du menu (ressources/Menu.png)
// [À valider] Les URL des pages internes sont provisoires, construites à partir des intitulés.

export type NavLink = { label: string; href: string };
/** Clés des libellés de 1er niveau dans les Réglages (siteSettings.navLabels) */
export type NavKey = "expertises" | "casClients" | "agence" | "contact";
export type NavLabels = Partial<Record<NavKey, string | null | undefined>>;
export type NavItem = {
  /** Clé du libellé éditable dans les Réglages */
  key: NavKey;
  /** Libellé par défaut (remplacé par celui des Réglages quand il existe) */
  label: string;
  href: string;
  /** Sous-menu : liste de liens */
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

export const navigation: NavItem[] = [
  // Sans sous-menu : deviendra une page entière
  { key: "expertises", label: "Expertises", href: "#expertises" },
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
  { key: "agence", label: "L’agence", href: "/agence/" },
  { key: "contact", label: "Contact", href: "#contact" },
];
