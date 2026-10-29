import { describe, expect, it } from "vitest";
import { imageUrl } from "@/sanity/lib/image";
import type { ImageWithAlt } from "../../sanity.types";

const image = {
  _type: "imageWithAlt",
  alt: "test",
  asset: { _type: "reference", _ref: "image-abc123def456-2000x1000-jpg" },
  crop: { _type: "sanity.imageCrop", top: 0.1, bottom: 0.1, left: 0.2, right: 0.2 },
  hotspot: { _type: "sanity.imageHotspot", x: 0.5, y: 0.5, width: 0.4, height: 0.4 },
} as ImageWithAlt;

describe("imageUrl", () => {
  const url = imageUrl(image, 800);
  it("demande la largeur, le recadrage et le format automatique", () => {
    expect(url).toContain("cdn.sanity.io/images/");
    expect(url).toContain("w=800");
    expect(url).toContain("fit=crop");
    expect(url).toContain("auto=format");
  });
  it("applique le recadrage enregistré", () => {
    expect(url).toContain("rect=");
  });
});
