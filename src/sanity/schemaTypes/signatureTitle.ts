import { defineField } from "sanity";

export type SignatureLimits = { maxLines: number; maxChars: number };

export const validateSignatureLines = (
  lines: string[] | undefined,
  limits: SignatureLimits,
): true | string => {
  if (!lines || lines.length === 0) return "Titre obligatoire.";

  const newlineIndex = lines.findIndex((line) => /[\r\n]/.test(line));
  if (newlineIndex !== -1)
    return `Ligne ${newlineIndex + 1} : pas de retour à la ligne, ajoutez une nouvelle ligne.`;

  if (lines.length > limits.maxLines)
    return `${limits.maxLines} lignes maximum (${lines.length} saisies).`;

  for (let i = 0; i < lines.length; i++) {
    const visible = [...(lines[i] ?? "").trim()];
    if (visible.length === 0) return `Ligne ${i + 1} vide.`;
    if (visible.length > limits.maxChars)
      return `Ligne ${i + 1} : ${visible.length} caractères, ${limits.maxChars} maximum.`;
  }

  return true;
};

/** Variante facultative : vide accepté, sinon mêmes limites qu'un titre-signature. */
export const validateOptionalSignatureLines = (
  lines: string[] | undefined,
  limits: SignatureLimits,
): true | string => (!lines || lines.length === 0 ? true : validateSignatureLines(lines, limits));

export const signatureTitleField = (
  name: string,
  title: string,
  limits: SignatureLimits,
  optional = false,
) =>
  defineField({
    name,
    title,
    type: "array",
    of: [{ type: "string" }],
    description: `${optional ? "Facultatif. " : ""}${limits.maxLines} ligne(s) maximum, ${limits.maxChars} caractères par ligne`,
    validation: (Rule) =>
      Rule.custom((lines) =>
        (optional ? validateOptionalSignatureLines : validateSignatureLines)(
          lines as string[] | undefined,
          limits,
        ),
      ),
  });
