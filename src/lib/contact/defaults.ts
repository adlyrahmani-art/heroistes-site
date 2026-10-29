import type { ContactFormConfig } from "./validate";

/** Messages par défaut du formulaire : valeurs initiales du Studio et repli si Sanity est indisponible. */
export const CONTACT_DEFAULT_MESSAGES = {
  successMessage: "Merci, votre demande est bien envoyée. Nous revenons vers vous rapidement.",
  errorMessage: "L’envoi n’a pas abouti. Réessayez dans un instant ou écrivez-nous à contact@heroistes.com.",
  rateLimitMessage:
    "Vous avez envoyé plusieurs demandes en peu de temps. Réessayez dans une heure ou écrivez-nous à contact@heroistes.com.",
} as const;

export const CONTACT_DEFAULT_RECIPIENT = "contact@heroistes.com";

/** Configuration de repli (spec §8.2) : téléphone et sujet affichés et obligatoires, textes par défaut. */
export function fallbackContactForm(env: Record<string, string | undefined>): ContactFormConfig {
  return {
    ...CONTACT_DEFAULT_MESSAGES,
    recipient: env.CONTACT_TO_EMAIL || CONTACT_DEFAULT_RECIPIENT,
    phone: { enabled: true, required: true },
    subject: { enabled: true, required: true },
  } as unknown as ContactFormConfig;
}
