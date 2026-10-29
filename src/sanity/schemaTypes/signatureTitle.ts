import { defineField } from "sanity";

export type SignatureLimits = { maxLines: number; maxChars: number };

export const validateSignatureLines = (
  lines: string[] | undefined,
  limits: SignatureLimits,
): true | string => {
  if (!lines || lines.length === 0) return "Titre obligatoire.";

  const newlineIndex = lines.findIndex((line) => /[\r\n]/.test(line));
  if (newlineIndex !== -1)
    return `Ligne ${newlineIndex + 1} : un seul retour à la ligne par ligne saisie, ajoutez une ligne.`;

  if (lines.length > limits.maxLines)
    return `${limits.maxLines} lignes maximum (${lines.length} saisies).`;

  for (let i = 0; i < lines.length; i++) {
    const visible = [...lines[i].trim()];
    if (visible.length === 0) return `Ligne ${i + 1} vide.`;
    if (visible.length > limits.maxChars)
      return `Ligne ${i + 1} : ${visible.length} caractères, ${limits.maxChars} maximum.`;
  }

  return true;
};

export const signatureTitleField = (
  name: string,
  title: string,
  limits: SignatureLimits,
) =>
  defineField({
    name,
    title,
    type: "array",
    of: [{ type: "string" }],
    description: `${limits.maxLines} ligne(s) maximum, ${limits.maxChars} caractères par ligne`,
    validation: (Rule) =>
      Rule.custom((lines) =>
        validateSignatureLines(lines as string[] | undefined, limits),
      ),
  });
