import { defineArrayMember, defineField } from "sanity";

export const bodyField = defineField({
  name: "body",
  title: "Contenu",
  type: "array",
  of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "imageWithAlt" })],
});
