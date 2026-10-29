import { defineField, defineType } from "sanity";
import { languageField } from "../fields";
import { btn, img, str } from "./helpers";

const NAV = [
  ["accueil", "Accueil"],
  ["expertises", "Expertises"],
  ["conseil", "Conseil"],
  ["casClients", "Cas clients"],
  ["secteurs", "Secteurs"],
  ["agence", "Agence"],
  ["blog", "Blog"],
  ["contact", "Contact"],
] as const;

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Réglages",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "navLabels",
      title: "Libellés du menu",
      type: "object",
      fields: NAV.map(([name, title]) => str(name, title)),
    }),
    btn("headerCta", "Bouton de l’en-tête"),
    defineField({
      name: "footer",
      title: "Pied de page",
      type: "object",
      fields: [
        img("visual", "Visuel"),
        str("baseline", "Signature"),
        str("newsletterTitle", "Titre newsletter"),
        str("newsletterText", "Texte newsletter"),
        { ...str("copyright", "Copyright"), description: "Ligne en bas du pied de page, villes comprises." },
        defineField({
          name: "email",
          title: "E-mail",
          type: "string",
          validation: (Rule) =>
            Rule.required().error("E-mail : champ obligatoire.").email().error("E-mail : adresse invalide (exemple : contact@heroistes.com)."),
        }),
      ],
    }),
    defineField({
      name: "social",
      title: "Réseaux sociaux",
      type: "object",
      fields: [
        defineField({
          name: "linkedin",
          title: "LinkedIn",
          type: "url",
          validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO par défaut", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Réglages" }) },
});
