import { expect, test } from "vitest";
import { schemaTypes } from "@/sanity/schemaTypes";

const documents = schemaTypes.filter((t) => t.type === "document");
const fieldNames = (name: string) =>
  ((documents.find((d) => d.name === name) as { fields: { name: string }[] }) ?? { fields: [] }).fields.map(
    (f) => f.name,
  );

test("les 6 documents existent", () => {
  expect(documents.map((d) => d.name).sort()).toEqual(
    ["blogPost", "caseStudy", "contactForm", "contactRequest", "homePage", "siteSettings"].sort(),
  );
});

test("chaque document a un champ language", () => {
  for (const doc of documents) expect(fieldNames(doc.name), doc.name).toContain("language");
});

test("homePage contient les lames dans l'ordre du site", () => {
  const order = [
    "hero", "engagementsTitle", "engagements", "logosBand", "besoins", "expertises",
    "pourquoi", "plan", "casClients", "blog", "faq", "contactLead",
  ];
  expect(fieldNames("homePage").filter((n) => order.includes(n))).toEqual(order);
});

test("caseStudy propose les 7 secteurs", () => {
  const cs = documents.find((d) => d.name === "caseStudy") as { fields: { name: string; options?: { list: string[] } }[] };
  expect(cs.fields.find((f) => f.name === "sector")?.options?.list).toEqual([
    "Industrie", "Tech & SaaS", "Services B2B", "Distribution & logistique",
    "Bien-être", "Promotion immobilière", "Associatif",
  ]);
});

test("contactForm a des messages de succès, d'erreur et de limite par défaut", () => {
  const cf = documents.find((d) => d.name === "contactForm") as { initialValue?: Record<string, string> };
  for (const key of ["successMessage", "errorMessage", "rateLimitMessage"]) {
    expect(cf.initialValue?.[key], key).toMatch(/\S/);
  }
});

test("lien de bouton : relatif, ancre, http(s), mailto, tel acceptés ; le reste refusé", async () => {
  const { validateHref } = await import("@/sanity/schemaTypes/objects/button");
  for (const ok of ["/blog/", "#contact", "https://exemple.fr/x", "http://a.fr", "mailto:a@b.fr", "tel:+33123456789", undefined])
    expect(validateHref(ok), String(ok)).toBe(true);
  for (const ko of ["javascript:alert(1)", "exemple.fr", "ftp://a.fr", "/a b"])
    expect(validateHref(ko), ko).toEqual(expect.stringContaining("Lien invalide"));
});
