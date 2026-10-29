/**
 * Sections de fin de page détail cas client (résultats, appel à l'action, projets voisins).
 * Contenu statique provisoire, indexé par slug : ces sections passeront dans Sanity plus tard.
 * Les textes acceptent le gras entre ** **.
 */
export type CaseStat = {
  /** Valeur affichée (compteur animé de 0 à cette valeur). */
  value: number;
  /** Suffixe plus fin, en turquoise (« + »). */
  suffix?: string;
  text: string;
};

export type CaseResults = {
  /** Une ligne par entrée (titre en très grand). */
  title: string[];
  stats: CaseStat[];
  summary: string;
};

/** Morceau d'une ligne de titre ; `accent` : en turquoise. */
export type TitlePart = { text: string; accent?: boolean };

export type CaseCta = {
  /** Lignes du titre, chacune faite de morceaux. */
  title: TitlePart[][];
  subtitle: string[];
  text: string;
  button: { label: string; href: string };
};

export type CaseNavItem = {
  label: string;
  name: string;
  href: string;
  /** Portrait 280 × 386 affiché au survol (public/). */
  image: string;
};

export type CaseExtras = {
  results?: CaseResults;
  cta?: CaseCta;
  nav?: { prev?: CaseNavItem; next?: CaseNavItem };
};
