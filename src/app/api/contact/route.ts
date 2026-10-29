import { timingSafeEqual } from "node:crypto";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { CONTACT_FORM_QUERY } from "@/sanity/lib/queries";
import { buildDeps } from "@/lib/contact/deps";
import { getIpSalt, hashIp } from "@/lib/contact/rateLimit";
import { handleContact } from "@/lib/contact/send";
import type { CONTACT_FORM_QUERY_RESULT } from "../../../../sanity.types";

const json = (status: number, body: Record<string, unknown>) =>
  Response.json({ ok: status === 200, ...body }, { status, headers: { "Cache-Control": "no-store" } });

function sameToken(a: string | null, b: string | undefined): boolean {
  if (!a || !b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 20000) return json(413, { message: "Requête trop volumineuse." });

  let input: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("corps invalide");
    input = body as Record<string, unknown>;
  } catch {
    return json(400, { message: "Requête invalide.", errors: {} });
  }

  try {
    // Client publié, sans stega : les messages renvoyés au visiteur restent propres.
    const writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "published",
      token: process.env.SANITY_API_WRITE_TOKEN,
    });
    const form = await writeClient.fetch<CONTACT_FORM_QUERY_RESULT>(CONTACT_FORM_QUERY);
    if (!form) return json(500, { message: "Formulaire indisponible." });

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "inconnue";
    // E2E_TOKEN est défini sur Preview uniquement ; jamais de contournement en production.
    const e2e = process.env.VERCEL_ENV !== "production" && sameToken(request.headers.get("x-e2e-token"), process.env.E2E_TOKEN)
      ? { fail: request.headers.get("x-e2e-fail") === "1" }
      : undefined;

    const deps = buildDeps({ form, ipHash: hashIp(ip, getIpSalt()), env: process.env, writeClient, e2e });
    const { status, message, errors } = await handleContact(input, deps);
    return json(status, errors ? { message, errors } : { message });
  } catch (e) {
    console.error("[contact] erreur serveur", e);
    return json(500, { message: "Une erreur est survenue. Réessayez dans un instant." });
  }
}
