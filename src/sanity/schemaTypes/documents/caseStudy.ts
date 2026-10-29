import { defineArrayMember, defineField, defineType } from "sanity";
import { languageField } from "../fields";
import { bodyField } from "./body";
import { img, str } from "./helpers";

export const SECTORS = [
  "Industrie",
  "Tech & SaaS",
  "Services B2B",
  "Distribution & logistique",
  "Bien-être",
  "Promotion immobilière",
  "Associatif",
];

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Cas client",
  type: "document",
  fields: [
    languageField,
    str("title", "Titre"),
    defineField({
      name: "slug",
      title: "Adresse (slug)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    str("clientName", "Nom du client"),
    defineField({
      name: "sector",
      title: "Secteur",
      type: "string",
      options: { list: SECTORS, layout: "dropdown" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "keyFigures",
      title: "Chiffres clés",
      description: "Optionnel, 3 maximum.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "keyFigure",
          fields: [str("result", "Résultat"), str("detail", "Détail")],
          preview: { select: { title: "result", subtitle: "detail" } },
        }),
      ],
      validation: (Rule) => Rule.max(3),
    }),
    img("image", "Photo de la carte"),
    str("tag", "Étiquette"),
    str("question", "Question"),
    img("background", "Fond flouté"),
    img("logo", "Logo"),
    defineField({
      name: "logoSize",
      title: "Taille du logo",
      type: "number",
      initialValue: 150,
      validation: (Rule) => Rule.required().min(60).max(200),
    }),
    defineField({
      name: "highlights",
      title: "Points forts",
      description: "1 à 5 lignes.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    bodyField,
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "clientName", media: "image" } },
});
