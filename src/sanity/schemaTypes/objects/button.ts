import { defineField, defineType } from "sanity";

/** Lien valide : chemin relatif, ancre, http(s), mailto ou tel. */
export const HREF_PATTERN = /^(\/|#|https?:\/\/|mailto:|tel:)\S*$/;
export const validateHref = (value: string | undefined) =>
  !value || HREF_PATTERN.test(value) ? true : "Lien invalide : utilisez /chemin, #ancre, https://…, mailto: ou tel:.";

export const button = defineType({
  name: "button",
  title: "Bouton",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Libellé",
      type: "string",
      validation: (Rule) => Rule.required().error("Libellé obligatoire."),
    }),
    defineField({
      name: "href",
      title: "Lien",
      type: "string",
      validation: (Rule) => Rule.required().error("Lien obligatoire.").custom(validateHref),
    }),
  ],
});
