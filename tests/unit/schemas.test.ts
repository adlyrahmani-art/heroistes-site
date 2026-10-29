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
