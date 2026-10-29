import { expect, test } from "vitest";
import { validateSignatureLines } from "@/sanity/schemaTypes/signatureTitle";

const lim = { maxLines: 2, maxChars: 14 };
test("accepte un titre dans les limites", () => expect(validateSignatureLines(["L’agence", "marketing B2B"], lim)).toBe(true));
test("refuse trop de lignes", () => expect(validateSignatureLines(["a", "b", "c"], lim)).toBe("2 lignes maximum (3 saisies)."));
test("refuse une ligne trop longue", () =>
  expect(validateSignatureLines(["Spécialisation B2B!"], lim)).toBe("Ligne 1 : 19 caractères, 14 maximum."));
test("mesure après trim et refuse une ligne vide", () => {
  expect(validateSignatureLines(["  Accès  ", "direct"], lim)).toBe(true);
  expect(validateSignatureLines(["Accès", "   "], lim)).toBe("Ligne 2 vide.");
});
test("refuse un titre absent", () => expect(validateSignatureLines(undefined, lim)).toBe("Titre obligatoire."));
test("refuse une ligne contenant un retour à la ligne", () =>
  expect(validateSignatureLines(["Accès\ndirect"], lim)).toBe("Ligne 1 : pas de retour à la ligne, ajoutez une nouvelle ligne."));
test("traite un élément absent comme une ligne vide", () =>
  expect(validateSignatureLines(["Accès", undefined as unknown as string], lim)).toBe("Ligne 2 vide."));
