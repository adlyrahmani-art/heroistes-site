import { describe, expect, it } from "vitest";
import { imageUrl } from "@/sanity/lib/image";
import type { ImageWithAlt } from "../../sanity.types";

const make = (x: number) =>
  ({
    _type: "imageWithAlt",
    alt: "test",
    asset: { _type: "reference", _ref: "image-abc123def456-2000x1000-jpg" },
    crop: { _type: "sanity.imageCrop", top: 0.1, bottom: 0.1, left: 0.2, right: 0.2 },
    hotspot: { _type: "sanity.imageHotspot", x, y: 0.5, width: 0.2, height: 0.2 },
  }) as ImageWithAlt;

const rect = (u: string | null) => new URL(u!).searchParams.get("rect")!.split(",").map(Number);

describe("imageUrl", () => {
  const url = imageUrl(make(0.5), 800)!;
  it("demande la largeur, le recadrage et le format automatique", () => {
    expect(url).toContain("cdn.sanity.io/images/");
    expect(url).toContain("w=800");
    expect(url).toContain("fit=crop");
    expect(url).toContain("auto=format");
  });
  it("applique le recadrage enregistré", () => {
    expect(url).toContain("rect=");
  });
  it("le point focal décale le cadrage quand la hauteur est donnée", () => {
    const wide = imageUrl(make(0.8), 400, 800);
    const centered = imageUrl(make(0.5), 400, 800);
    expect(wide).toContain("h=800");
    expect(wide).not.toBe(imageUrl(make(0.8), 400));
    expect(rect(wide)[0]).toBeGreaterThan(rect(centered)[0]);
  });
  it("renvoie null sans asset", () => {
    expect(imageUrl(undefined, 800)).toBeNull();
    expect(imageUrl({ _type: "imageWithAlt" } as ImageWithAlt, 800)).toBeNull();
  });
});
