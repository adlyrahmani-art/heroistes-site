/**
 * Sections de fin de page détail cas client (résultats, appel à l'action, projets voisins).
 * Contenu statique provisoire, indexé par slug : ces sections passeront dans Sanity plus tard.
 * Les textes acceptent le gras entre ** ** et les retours à la ligne (\n).
 */
export type CaseStat = {
  /** Valeur affichée (compteur animé de 0 à cette valeur). */
  value: number;
  /** « + » (dessiné en traits fins) ou « % » (même police, précédé d'une espace insécable). */
  suffix?: "+" | "%";
  /** Première ligne en gras (**…**), suite en normal ; \n force le retour à la ligne. */
  text: string;
};

export type CaseResults = {
  /** Une ligne par entrée (titre en très grand). */
  title: string[];
  /** Ligne plus petite sous le titre (« Après six mois de campagne »). */
  subtitle?: string;
  /** 1 à 3 chiffres. Un seul chiffre : chiffre et texte côte à côte. */
  stats: CaseStat[];
  /** Taille des chiffres en px à 1920 (128 par défaut). */
  statSize?: number;
  /** Largeur de la barre turquoise en px à 1920 (673 par défaut). */
  barWidth?: number;
  /** Texte en gras sous les chiffres ; \n force le retour à la ligne. */
  summary: string;
  /** Fond texturé (public/), calé en haut sur toute la largeur. */
  background?: string;
};

/** Morceau d'une ligne de titre ; `accent` : en turquoise. */
export type TitlePart = { text: string; accent?: boolean };

export type CaseCta = {
  /** Lignes du titre, chacune faite de morceaux. */
  title: TitlePart[][];
  /** Sous-titre en gras, une entrée par ligne. */
  subtitle: string[];
  /** Barre turquoise sous le sous-titre (maquette Pranéo). */
  bar?: boolean;
  /** Ligne de texte avant le bouton (maquette Pranéo). */
  text?: string;
  button: { label: string; href: string };
  /** Fond texturé (public/), calé en haut sur toute la largeur. */
  background?: string;
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
