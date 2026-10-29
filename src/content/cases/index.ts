import { praneo } from "./praneo";
import type { CaseExtras } from "./types";

export type * from "./types";

const extras: Record<string, CaseExtras> = { praneo };

/** Sections de fin de page d'un cas (contenu statique provisoire) ; vide si le slug n'en a pas. */
export function getCaseExtras(slug: string): CaseExtras {
  return Object.hasOwn(extras, slug) ? extras[slug] : {};
}
