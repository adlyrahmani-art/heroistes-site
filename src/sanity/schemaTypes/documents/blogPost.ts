import { defineField, defineType } from "sanity";
import { languageField } from "../fields";
import { bodyField } from "./body";
import { img, str, txt } from "./helpers";

export const blogPost = defineType({
  name: "blogPost",
  title: "Article de blog",
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
    defineField({
      name: "publishedAt",
      title: "Date de publication",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    txt("excerpt", "Résumé"),
    img("cover", "Image de couverture"),
    bodyField,
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  orderings: [{ title: "Plus récents", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "publishedAt", media: "cover" } },
});
