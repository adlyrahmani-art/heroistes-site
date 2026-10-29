import { cookies, draftMode } from "next/headers";
import {
  defineLive,
  resolvePerspectiveFromCookies,
  resolveVariantFromCookies,
  type LivePerspective,
  type StrictDefinedFetchType,
} from "next-sanity/live";
import { readToken, studioUrl } from "../env";
import { client } from "./client";

const token = readToken();

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({ stega: { studioUrl } }),
  serverToken: token,
  browserToken: token,
  strict: true,
});

/**
 * Unique frontière 'use cache' de l'app : sanityFetch pose cacheTag/cacheLife,
 * mais c'est ce wrapper qui crée la frontière. Les appelants ne mettent pas la leur.
 */
export const cachedFetch: StrictDefinedFetchType = async (options) => {
  "use cache";
  return sanityFetch(options);
};

export interface DynamicFetchOptions {
  perspective: LivePerspective;
  variant?: string;
  stega: boolean;
}

/** À appeler hors frontière 'use cache'. Brouillon : drafts + stega ; visiteurs : published, sans stega. */
export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return { perspective: "published", stega: false };

  const jar = await cookies();
  const perspective = await resolvePerspectiveFromCookies({ cookies: jar });
  const variant = await resolveVariantFromCookies({ cookies: jar });
  return { perspective: perspective ?? "drafts", variant, stega: true };
}
