import { expect, test } from "vitest";
import { countBetween } from "@/sanity/schemaTypes/fields";
import { validateOptionalSignatureLines } from "@/sanity/schemaTypes/signatureTitle";
import { schemaTypes } from "@/sanity/schemaTypes";

const lim = { maxLines: 3, maxChars: 22 };

test("titre-signature facultatif : vide accepté, limites conservées", () => {
  expect(validateOptionalSignatureLines(undefined, lim)).toBe(true);
  expect(validateOptionalSignatureLines([], lim)).toBe(true);
  expect(validateOptionalSignatureLines(["Installer les", "fondations d’une"], lim)).toBe(true);
  expect(validateOptionalSignatureLines(["a", "b", "c", "d"], lim)).toBe("3 lignes maximum (4 saisies).");
  expect(validateOptionalSignatureLines(["Accès", " "], lim)).toBe("Ligne 2 vide.");
});

test("countBetween : chapitres 0 à 5", () => {
  const v = countBetween(0, 5, "chapitre");
  expect(v(undefined)).toBe(true);
  expect(v([])).toBe(true);
  expect(v([1, 2, 3, 4, 5])).toBe(true);
  expect(v([1, 2, 3, 4, 5, 6])).toBe("5 chapitres maximum (6 saisis).");
});

test("countBetween : blocs 1 à 3", () => {
  const v = countBetween(1, 3, "bloc");
  expect(v(undefined)).toBe("Au moins 1 bloc (0 saisi).");
  expect(v([1])).toBe(true);
  expect(v([1, 2, 3, 4])).toBe("3 blocs maximum (4 saisis).");
});

test("caseStudy : champs de la page détail dans le groupe « Page détail »", () => {
  const cs = schemaTypes.find((t) => t.name === "caseStudy") as unknown as {
    groups: { name: string; title: string }[];
    fields: { name: string; group?: string; validation?: unknown }[];
  };
  expect(cs.groups.find((g) => g.name === "detail")?.title).toBe("Page détail");
  const detail = cs.fields.filter((f) => f.group === "detail").map((f) => f.name);
  expect(detail).toEqual(["detailHero", "detailIntro", "challenge", "chapters"]);
  // Les champs historiques restent dans l'onglet Carte
  expect(cs.fields.find((f) => f.name === "highlights")?.group).toBe("carte");
});
