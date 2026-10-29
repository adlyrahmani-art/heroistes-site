import { defineField } from "sanity";

export const languageField = defineField({
  name: "language",
  type: "string",
  initialValue: "fr",
  hidden: true,
  readOnly: true,
});

export const exactCount =
  (n: number) =>
  (items: unknown[] | undefined): true | string =>
    items?.length === n
      ? true
      : `Cette liste doit contenir exactement ${n} éléments.`;
