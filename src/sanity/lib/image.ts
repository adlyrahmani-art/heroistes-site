import { createImageUrlBuilder } from "@sanity/image-url";
import type { ImageWithAlt } from "../../../sanity.types";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function imageUrl(image: ImageWithAlt, width: number): string {
  return builder.image(image).width(width).fit("crop").auto("format").url();
}
