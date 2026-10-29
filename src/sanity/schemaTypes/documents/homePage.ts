import { defineArrayMember, defineField, defineType } from "sanity";
import { exactCount, languageField } from "../fields";
import { signatureTitleField } from "../signatureTitle";
import { BOLD_HINT, btn, img, str, txt } from "./helpers";

type Fields = ReturnType<typeof defineField>[];

/** Une lame de la page d'accueil = un objet de premier niveau. */
const section = (name: string, title: string, fields: Fields) =>
  defineField({ name, title, type: "object", fields });

/** Liste à nombre fixe d'objets : le client modifie le contenu, jamais le nombre. */
const fixedList = (name: string, title: string, count: number, itemName: string, fields: Fields, titleField = "title") =>
  defineField({
    name,
    title,
    type: "array",
    description: `Exactement ${count} éléments.`,
    of: [
      defineArrayMember({
        type: "object",
        name: itemName,
        fields,
        preview: { select: { title: titleField } },
      }),
    ],
    validation: (Rule) => Rule.custom(exactCount(count)),
  });

/** Tableau de textes à nombre fixe. */
const fixedTexts = (name: string, title: string, count: number) =>
  defineField({
    name,
    title,
    type: "array",
    description: `Exactement ${count} paragraphes.`,
    of: [defineArrayMember({ type: "text", rows: 4 })],
    validation: (Rule) => Rule.custom(exactCount(count)),
  });

const sig = signatureTitleField;

export const homePage = defineType({
  name: "homePage",
  title: "Accueil",
  type: "document",
  fields: [
    languageField,
    section("hero", "Hero", [
      sig("eyebrow", "Sur-titre", { maxLines: 3, maxChars: 12 }),
      sig("titleLines", "Titre", { maxLines: 2, maxChars: 14 }),
      str("subtitle", "Sous-titre", 16),
      str("highlight", "Mot mis en avant", 10),
      txt("text", "Texte", BOLD_HINT),
      btn("ctaPrimary", "Bouton principal"),
      btn("ctaSecondary", "Bouton secondaire"),
      img("image", "Image (photo WebGL)"),
    ]),
    str("engagementsTitle", "Titre des engagements", 20),
    fixedList("engagements", "Engagements", 4, "engagement", [
      sig("title", "Titre", { maxLines: 2, maxChars: 14 }),
      str("ghost", "Mot en filigrane", 8),
      txt("text", "Texte", BOLD_HINT),
      img("image", "Image"),
      defineField({
        name: "side",
        title: "Côté du titre",
        type: "string",
        options: { list: [{ title: "Gauche", value: "left" }, { title: "Droite", value: "right" }], layout: "radio" },
        validation: (Rule) => Rule.required(),
      }),
    ]),
    section("logosBand", "Bandeau de logos", [
      txt("text", "Texte"),
      defineField({
        name: "clients",
        title: "Logos clients",
        description: "4 à 12 logos. Le texte alternatif est le nom du client.",
        type: "array",
        of: [defineArrayMember({ type: "imageWithAlt" })],
        validation: (Rule) => Rule.required().min(4).max(12),
      }),
    ]),
    section("besoins", "Vos besoins, nos solutions", [
      str("title", "Titre", 48),
      txt("intro", "Introduction", BOLD_HINT),
      fixedList("items", "Besoins", 6, "besoin", [
        str("title", "Titre", 48),
        str("offer", "Offre"),
        str("href", "Lien"),
        txt("text", "Texte", BOLD_HINT),
        img("image", "Image"),
      ]),
    ]),
    section("expertises", "Expertises", [
      sig("title", "Titre", { maxLines: 2, maxChars: 24 }),
      str("heading", "Intitulé"),
      txt("intro", "Introduction", BOLD_HINT),
      img("image", "Image"),
      fixedList(
        "cards",
        "Cartes",
        6,
        "expertiseCard",
        [
          sig("title", "Titre", { maxLines: 2, maxChars: 14 }),
          str("lead", "Première phrase (en gras)"),
          txt("text", "Texte", undefined, true),
          defineField({
            name: "link",
            title: "Lien (optionnel)",
            type: "object",
            fields: [str("before", "Phrase avant le lien"), str("label", "Texte du lien"), str("href", "Adresse")],
          }),
        ],
        "lead",
      ),
    ]),
    section("pourquoi", "Pourquoi une agence spécialisée", [
      sig("title", "Titre", { maxLines: 2, maxChars: 28 }),
      txt("intro", "Introduction", BOLD_HINT),
      fixedList("items", "Réalités", 3, "pourquoiItem", [
        sig("title", "Titre", { maxLines: 3, maxChars: 14 }),
        txt("text", "Texte", BOLD_HINT),
        img("image", "Image"),
      ], "text"),
      txt("outro", "Conclusion"),
      btn("cta", "Bouton"),
    ]),
    section("plan", "Du plan aux résultats", [
      str("title", "Titre", 24),
      str("subtitle", "Sous-titre", 40),
      txt("intro", "Introduction"),
      fixedList("steps", "Étapes", 2, "planStep", [
        sig("title", "Titre", { maxLines: 2, maxChars: 20 }),
        txt("text", "Texte"),
        img("image", "Image"),
      ], "text"),
      fixedTexts("outro", "Conclusion", 2),
      btn("cta", "Bouton"),
    ]),
    section("casClients", "Cas clients", [
      sig("title", "Titre", { maxLines: 3, maxChars: 17 }),
      txt("intro", "Introduction", BOLD_HINT),
      img("image", "Image"),
      defineField({
        name: "cases",
        title: "Cas clients à la une",
        description: "Exactement 3 cas clients.",
        type: "array",
        of: [defineArrayMember({ type: "reference", to: [{ type: "caseStudy" }] })],
        validation: (Rule) => Rule.custom(exactCount(3)),
      }),
      btn("cta", "Bouton"),
    ]),
    section("blog", "Blog", [
      sig("title", "Titre", { maxLines: 3, maxChars: 14 }),
      btn("cta", "Bouton"),
    ]),
    section("faq", "FAQ", [
      sig("title", "Titre", { maxLines: 2, maxChars: 15 }),
      fixedList("items", "Questions", 5, "faqItem", [str("question", "Question"), txt("answer", "Réponse")], "question"),
    ]),
    section("contactLead", "Accroche avant le pied de page", [
      sig("lead", "Accroche", { maxLines: 2, maxChars: 24 }),
    ]),
  ],
  preview: { prepare: () => ({ title: "Accueil" }) },
});
