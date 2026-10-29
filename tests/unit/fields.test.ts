import { expect, test } from "vitest";
import { exactCount, languageField } from "@/sanity/schemaTypes/fields";

test("exactCount accepte exactement n éléments", () => {
  expect(exactCount(4)([1, 2, 3, 4])).toBe(true);
  expect(exactCount(4)([1, 2, 3])).toBe("Cette liste doit contenir exactement 4 éléments.");
  expect(exactCount(4)(undefined)).toBe("Cette liste doit contenir exactement 4 éléments.");
});
test("languageField vaut fr par défaut, masqué et en lecture seule", () => {
  expect(languageField).toMatchObject({ name: "language", initialValue: "fr", hidden: true, readOnly: true });
});
