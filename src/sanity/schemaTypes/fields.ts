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

/** Nombre d'éléments entre min et max ; liste absente = 0 élément. */
export const countBetween =
  (min: number, max: number, noun: string) =>
  (items: unknown[] | undefined): true | string => {
    const n = items?.length ?? 0;
    if (n < min) return `Au moins ${min} ${noun}${min > 1 ? "s" : ""} (${n} saisi${n > 1 ? "s" : ""}).`;
    if (n > max) return `${max} ${noun}s maximum (${n} saisis).`;
    return true;
  };
