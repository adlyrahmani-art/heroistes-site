import { defineLive } from "next-sanity/live";
import { readToken, studioUrl } from "../env";
import { client } from "./client";

const token = readToken();

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({ stega: { studioUrl } }),
  serverToken: token,
  browserToken: token,
});
