import type { StructureResolver } from "sanity/structure";
import { SINGLETON_IDS } from "./documentRules";

const page = (S: Parameters<StructureResolver>[0], type: keyof typeof SINGLETON_IDS, title: string) =>
  S.listItem()
    .title(title)
    .id(type)
    .child(S.document().schemaType(type).documentId(SINGLETON_IDS[type]).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenu")
    .items([
      S.listItem()
        .title("Pages")
        .id("pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              page(S, "siteSettings", "Réglages"),
              page(S, "homePage", "Accueil"),
              page(S, "contactForm", "Formulaire de contact"),
            ]),
        ),
      S.documentTypeListItem("blogPost").title("Articles de blog"),
      S.documentTypeListItem("caseStudy").title("Cas clients"),
      S.documentTypeListItem("contactRequest").title("Demandes de contact"),
    ]);
