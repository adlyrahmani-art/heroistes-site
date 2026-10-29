import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageHotspot, SanityImageCrop } from "../../../sanity.types";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Image Sanity avec asset (référence ou document résolu par `asset->`), point focal et recadrage. */
export type ImageInput = {
  asset?: unknown;
  hotspot?: SanityImageHotspot | null;
  crop?: SanityImageCrop | null;
};

// Le point focal n'est appliqué par le CDN que si largeur ET hauteur sont fournies.
export function imageUrl(
  image: ImageInput | undefined | null,
  width: number,
  height?: number,
): string | null {
  if (!image?.asset) return null;
  let b = builder.image(image as Parameters<typeof builder.image>[0]).width(width);
  if (height) b = b.height(height);
  return b.fit("crop").auto("format").url();
}
