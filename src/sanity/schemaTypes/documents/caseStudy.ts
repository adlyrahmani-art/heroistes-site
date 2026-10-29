import { defineArrayMember, defineField, defineType } from "sanity";
import { countBetween, languageField } from "../fields";
import { signatureTitleField } from "../signatureTitle";
import { bodyField } from "./body";
import { BOLD_HINT, img, str, txt } from "./helpers";

export const SECTORS = [
  "Industrie",
  "Tech & SaaS",
  "Services B2B",
  "Distribution & logistique",
  "Bien-être",
  "Promotion immobilière",
  "Associatif",
];

type Field = ReturnType<typeof defineField>;
const inGroup = (group: string, fields: Field[]) => fields.map((f) => ({ ...f, group }));
const sig = signatureTitleField;
const OPTIONAL = true;

/** Page détail : tout est facultatif au niveau du document (les cas sans contenu détaillé restent publiables). */
const detailFields: Field[] = [
  defineField({
    name: "detailHero",
    title: "En-tête",
    description: "Le logo, le nom du client et les points forts sont repris de l'onglet Carte.",
    type: "object",
    options: { collapsible: true, collapsed: false },
    fields: [
      img("background", "Image de fond", OPTIONAL),
      sig("subtitle", "Sous-titre", { maxLines: 2, maxChars: 40 }, OPTIONAL),
      txt("intro", "Introduction", BOLD_HINT, OPTIONAL),
    ],
  }),
  defineField({
    name: "detailIntro",
    title: "Introduction",
    type: "object",
    options: { collapsible: true, collapsed: false },
    fields: [
      sig("title", "Titre", { maxLines: 2, maxChars: 30 }, OPTIONAL),
      txt("text", "Texte", BOLD_HINT, OPTIONAL),
      img("image", "Grande image", OPTIONAL),
    ],
  }),
  defineField({
    name: "challenge",
    title: "Notre défi",
    type: "object",
    options: { collapsible: true, collapsed: false },
    fields: [
      defineField({ ...str("title", "Titre", 20, OPTIONAL), initialValue: "Notre défi" }),
      str("lead", "Accroche", 80, OPTIONAL),
      txt("text", "Texte", BOLD_HINT, OPTIONAL),
    ],
  }),
  defineField({
    name: "chapters",
    title: "Chapitres",
    description: "0 à 5 chapitres : grand titre, blocs de texte et image facultative.",
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        name: "caseChapter",
        title: "Chapitre",
        fields: [
          sig("title", "Grand titre", { maxLines: 3, maxChars: 22 }),
          defineField({
            name: "blocks",
            title: "Blocs de texte",
            description: "1 à 3 blocs.",
            type: "array",
            of: [
              defineArrayMember({
                type: "object",
                name: "caseBlock",
                title: "Bloc",
                fields: [
                  sig("title", "Titre du bloc", { maxLines: 3, maxChars: 40 }, OPTIONAL),
                  txt("text", "Texte", BOLD_HINT),
                ],
                preview: {
                  select: { title: "title", subtitle: "text" },
                  prepare: ({ title, subtitle }) => ({
                    title: Array.isArray(title) && title.length ? title.join(" ") : "(bloc sans titre)",
                    subtitle,
                  }),
                },
              }),
            ],
            validation: (Rule) => Rule.custom(countBetween(1, 3, "bloc")),
          }),
          img("image", "Image", OPTIONAL),
          defineField({
            name: "imageSide",
            title: "Côté de l'image",
            description: "Image à droite : textes à gauche. Image à gauche : textes à droite, alignés à droite.",
            type: "string",
            options: {
              list: [
                { title: "Gauche", value: "left" },
                { title: "Droite", value: "right" },
              ],
              layout: "radio",
            },
            initialValue: "right",
          }),
        ],
        preview: {
          select: { title: "title", media: "image" },
          prepare: ({ title, media }) => ({ title: Array.isArray(title) ? title.join(" ") : title, media }),
        },
      }),
    ],
    validation: (Rule) => Rule.custom(countBetween(0, 5, "chapitre")),
  }),
];

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Cas client",
  type: "document",
  groups: [
    { name: "carte", title: "Carte", default: true },
    { name: "detail", title: "Page détail" },
  ],
  fields: [
    languageField,
    ...inGroup("carte", [
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
    ]),
    ...inGroup("detail", detailFields),
  ],
  preview: { select: { title: "title", subtitle: "clientName", media: "image" } },
});
