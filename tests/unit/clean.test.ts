import { vercelStegaCombine } from "@vercel/stega";
import { describe, expect, test } from "vitest";
import { clean, editAttr } from "@/sanity/lib/clean";

const enc = vercelStegaCombine("Approche", { origin: "sanity.io", href: "/studio" });

describe("clean / editAttr", () => {
  test("clean retire les caractères invisibles d'une chaîne", () => expect(clean(enc)).toBe("Approche"));
  test("clean nettoie en profondeur", () =>
    expect(clean({ title: [enc], cta: { href: vercelStegaCombine("#contact", { href: "/studio" }) } })).toEqual({
      title: ["Approche"],
      cta: { href: "#contact" },
    }));
  test("clean laisse intacte une chaîne propre", () => expect(clean("Impact")).toBe("Impact"));
  test("editAttr encode le document et le chemin", () =>
    expect(editAttr({ _id: "homePage", _type: "homePage" }, "engagements[0].ghost")).toContain("homePage"));
});
