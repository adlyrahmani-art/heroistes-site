import { createDataAttribute, stegaClean } from "next-sanity";
import { dataset, projectId, studioUrl } from "../env";

/** Retire récursivement les caractères stega (à utiliser hors texte HTML visible). */
export function clean<T>(value: T): T {
  return stegaClean(value) as T;
}

/** Valeur d'attribut `data-sanity` pour garder le clic vers le bon champ. */
export function editAttr(doc: { _id: string; _type: string }, path: string): string {
  return createDataAttribute({ id: doc._id, type: doc._type, path, baseUrl: studioUrl, projectId, dataset }).toString();
}
