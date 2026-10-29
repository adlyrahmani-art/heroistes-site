import { expect, test } from "vitest";
import { resolveDocumentActions, resolveNewDocumentOptions } from "@/sanity/documentRules";

const act = (action: string) => ({ action }) as never;
const all = ["publish", "discardChanges", "restore", "delete", "duplicate", "unpublish", "schedule"].map(act);
const names = (list: { action?: string }[]) => list.map((a) => a.action);

test.each(["homePage", "siteSettings", "contactForm"])("%s : ni delete, ni duplicate, ni unpublish", (type) => {
  const result = names(resolveDocumentActions(all, type));
  for (const banned of ["delete", "duplicate", "unpublish"]) expect(result).not.toContain(banned);
  expect(result).toContain("publish");
});

test("contactRequest : aucune action d'écriture", () => {
  const result = names(resolveDocumentActions(all, "contactRequest"));
  for (const banned of ["publish", "delete", "duplicate", "unpublish", "discardChanges", "restore"])
    expect(result).not.toContain(banned);
});

test("blogPost garde toutes ses actions", () => {
  expect(resolveDocumentActions(all, "blogPost")).toHaveLength(all.length);
});

test("newDocumentOptions ne propose que blogPost et caseStudy", () => {
  const items = ["homePage", "siteSettings", "contactForm", "contactRequest", "blogPost", "caseStudy"].map(
    (templateId) => ({ templateId }) as never,
  );
  expect(resolveNewDocumentOptions(items).map((i) => i.templateId)).toEqual([
    "blogPost",
    "caseStudy",
  ]);
});
