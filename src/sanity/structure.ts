import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) => S.list().title("Contenu").items(S.documentTypeListItems());
