import { createHash } from "node:crypto";

export const RATE_LIMIT = { max: 5, windowMinutes: 60 } as const;

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

const DEV_SALT = "heroistes-dev-salt";

/** Sel de hachage des IP : obligatoire en production ; sel fixe de développement sinon. */
export function getIpSalt(env: Record<string, string | undefined> = process.env): string {
  const salt = env.IP_HASH_SALT;
  if (salt) return salt;
  if (env.NODE_ENV === "production") throw new Error("Variable d'environnement manquante : IP_HASH_SALT");
  console.warn("[contact] IP_HASH_SALT absent : sel de développement utilisé (à définir avant la mise en ligne).");
  return DEV_SALT;
}
