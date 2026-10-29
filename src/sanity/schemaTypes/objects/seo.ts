import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Titre SEO", type: "string" }),
    defineField({ name: "description", title: "Description SEO", type: "text" }),
    defineField({ name: "image", title: "Image de partage", type: "imageWithAlt" }),
  ],
});
