import type { HOME_QUERY_RESULT } from "../../../sanity.types";

type Home = NonNullable<HOME_QUERY_RESULT>;

export type HomeDoc = Pick<Home, "_id" | "_type">;
export type HeroData = NonNullable<Home["hero"]>;
export type EngagementData = NonNullable<Home["engagements"]>[number];
export type LogosData = NonNullable<Home["logosBand"]>;
export type BesoinsData = NonNullable<Home["besoins"]>;

/** Dimensions natives d'un asset image (pour les attributs width/height), si connues. */
export function nativeSize(asset: { metadata?: { dimensions?: { width?: number; height?: number } } } | null | undefined) {
  const d = asset?.metadata?.dimensions;
  return d?.width && d?.height ? { w: d.width, h: d.height } : null;
}
