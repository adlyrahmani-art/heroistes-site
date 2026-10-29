import { RATE_LIMIT } from "./rateLimit";
import { validateContact, type ContactData, type ContactErrors, type ContactFormConfig } from "./validate";

export type ContactDeps = {
  form: ContactFormConfig;
  ipHash: string;
  countRecent(ipHash: string): Promise<number>;
  saveCopy(data: ContactData): Promise<string | null>;
  markEmail(id: string, status: "envoyé" | "échec"): Promise<void>;
  sendEmail(data: ContactData, to: string): Promise<void>;
};

export type ContactResult = { status: 200 | 400 | 429 | 502; message: string; errors?: ContactErrors };

const FALLBACK = {
  success: "Merci, votre demande est bien envoyée.",
  invalid: "Certains champs sont incomplets ou invalides.",
  rate: "Trop de demandes. Réessayez plus tard.",
  error: "L’envoi n’a pas abouti. Réessayez dans un instant.",
};

export async function handleContact(input: Record<string, unknown>, deps: ContactDeps): Promise<ContactResult> {
  const { form } = deps;
  const success = form.successMessage || FALLBACK.success;

  // Champ piège : un robot le remplit ; on feint le succès sans rien enregistrer ni envoyer.
  if (typeof input.website === "string" && input.website.trim() !== "") return { status: 200, message: success };

  const v = validateContact(input, form);
  if (!v.ok) return { status: 400, message: FALLBACK.invalid, errors: v.errors };

  // Sanity indisponible : on ne bloque pas l'envoi, la limite est simplement ignorée (spec §8.2).
  const recent = await deps.countRecent(deps.ipHash).catch((e) => {
    console.error("[contact] décompte des envois impossible", e);
    return 0;
  });
  if (recent >= RATE_LIMIT.max) return { status: 429, message: form.rateLimitMessage || FALLBACK.rate };

  let id: string | null = null;
  try {
    id = await deps.saveCopy(v.data);
  } catch (e) {
    console.error("[contact] copie Sanity impossible", e);
  }

  try {
    await deps.sendEmail(v.data, form.recipient ?? "");
    if (id) await deps.markEmail(id, "envoyé").catch((e) => console.error("[contact] statut non enregistré", e));
    return { status: 200, message: success };
  } catch (e) {
    console.error("[contact] envoi e-mail impossible", e);
    if (id) await deps.markEmail(id, "échec").catch((err) => console.error("[contact] statut non enregistré", err));
    return { status: 502, message: form.errorMessage || FALLBACK.error };
  }
}
