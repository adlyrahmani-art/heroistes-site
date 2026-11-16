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
  /** Sans adresse : entrée affichée mais pas encore cliquable (page à venir) */
  href?: string;
  /** Sous-menu : liste de liens */
  links?: NavLink[];
  /** Phrase d'accroche affichée dans le panneau du sous-menu */
  pitch?: string;
};

export const navigation: NavItem[] = [
  // Page dédiée à venir : sans lien pour l'instant. Sous-menu : les 6 expertises des cartes de l'accueil,
  // dont les pages restent à construire (404 en attendant).
  {
    key: "expertises",
    label: "Expertises",
    pitch: "Six expertises réunies dans une agence 360, pour des actions qui se renforcent.",
    links: [
      { label: "Conseil", href: "/conseil/" },
      { label: "Développement commercial", href: "/developpement-commercial/" },
      { label: "Branding et contenu", href: "/branding/" },
      { label: "Digital Experience", href: "/digital/" },
      { label: "Acquisition et performance", href: "/acquisition/" },
      { label: "Cybersécurité", href: "/cybersecurite/" },
    ],
  },
  { key: "casClients", label: "Cas clients", href: "#cas-clients" },
  { key: "agence", label: "L’agence", href: "/agence/" },
  { key: "contact", label: "Contact", href: "#contact" },
];
