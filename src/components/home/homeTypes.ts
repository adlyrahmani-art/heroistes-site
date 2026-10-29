import type { HOME_QUERY_RESULT, LATEST_POSTS_QUERY_RESULT } from "../../../sanity.types";

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
export type ExpertisesData = NonNullable<Home["expertises"]>;
export type ExpertiseCardData = NonNullable<ExpertisesData["cards"]>[number];
export type PourquoiData = NonNullable<Home["pourquoi"]>;
export type PlanData = NonNullable<Home["plan"]>;
export type CasClientsData = NonNullable<Home["casClients"]>;
export type CaseData = NonNullable<CasClientsData["cases"]>[number];
export type BlogData = NonNullable<Home["blog"]>;
export type FaqData = NonNullable<Home["faq"]>;
export type LatestPost = LATEST_POSTS_QUERY_RESULT[number];
