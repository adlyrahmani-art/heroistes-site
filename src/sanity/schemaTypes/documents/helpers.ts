import { defineField } from "sanity";

/** Texte court affiché, obligatoire (sauf optionnel), avec limite de caractères optionnelle. */
export const str = (name: string, title: string, max?: number, optional = false) =>
  defineField({
    name,
    title,
    type: "string",
    description: max ? `${max} caractères maximum` : undefined,
    validation: (Rule) => {
      let rule = optional ? Rule : Rule.required().error(`${title} : champ obligatoire.`);
      if (max) rule = rule.max(max).error(`${title} : ${max} caractères maximum.`);
      return rule;
    },
  });

/** Texte long affiché, obligatoire (sauf optionnel). */
export const txt = (name: string, title: string, description?: string, optional = false) =>
  defineField({
    name,
    title,
    type: "text",
    rows: 4,
    description,
    validation: (Rule) => (optional ? Rule : Rule.required().error(`${title} : champ obligatoire.`)),
  });

export const BOLD_HINT = "Mettre en gras avec **texte**.";

export const img = (name: string, title: string, optional = false) =>
  defineField({
    name,
    title,
    type: "imageWithAlt",
    validation: (Rule) => (optional ? Rule : Rule.required().error(`${title} : image obligatoire.`)),
  });

export const btn = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "button",
    validation: (Rule) => Rule.required().error(`${title} : obligatoire.`),
  });
