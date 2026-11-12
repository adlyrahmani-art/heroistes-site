import { expect, test } from "vitest";
import { getCaseExtras } from "@/content/cases";

const slugOf = (href?: string) => href?.replace("/cas-clients/", "");

test("projets voisins : Minos → Pranéo → Carpigiani → Beauchamp → Minos", () => {
  const chain = ["praneo", "carpigiani", "beauchamp"];
  expect(slugOf(getCaseExtras("praneo").nav?.prev?.href)).toBe("minos");
  expect(slugOf(getCaseExtras("beauchamp").nav?.next?.href)).toBe("minos");
  for (let i = 0; i < chain.length - 1; i++) {
    expect(slugOf(getCaseExtras(chain[i]).nav?.next?.href)).toBe(chain[i + 1]);
    expect(slugOf(getCaseExtras(chain[i + 1]).nav?.prev?.href)).toBe(chain[i]);
  }
});

test("résultats : 1 à 3 chiffres, suffixes « + » ou « % »", () => {
  for (const slug of ["praneo", "carpigiani", "beauchamp"]) {
    const r = getCaseExtras(slug).results!;
    expect(r.stats.length).toBeGreaterThanOrEqual(1);
    expect(r.stats.length).toBeLessThanOrEqual(3);
    for (const s of r.stats) expect([undefined, "+", "%"]).toContain(s.suffix);
  }
  expect(getCaseExtras("inconnu")).toEqual({});
});
