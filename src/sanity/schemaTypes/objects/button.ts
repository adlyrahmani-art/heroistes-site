import { defineField, defineType } from "sanity";

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
      validation: (Rule) => Rule.required().error("Lien obligatoire."),
    }),
  ],
});
