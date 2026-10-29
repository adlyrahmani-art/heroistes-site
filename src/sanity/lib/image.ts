import { createImageUrlBuilder } from "@sanity/image-url";
import type { ImageWithAlt } from "../../../sanity.types";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

// Le point focal n'est appliqué par le CDN que si largeur ET hauteur sont fournies.
export function imageUrl(
  image: ImageWithAlt | undefined | null,
  width: number,
  height?: number,
): string | null {
  if (!image?.asset) return null;
  let b = builder.image(image).width(width);
  if (height) b = b.height(height);
  return b.fit("crop").auto("format").url();
}
