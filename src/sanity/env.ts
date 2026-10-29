function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

// Accès statiques (NEXT_PUBLIC_*) : Next les remplace à la compilation.
export const projectId = required("NEXT_PUBLIC_SANITY_PROJECT_ID", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
export const dataset = required("NEXT_PUBLIC_SANITY_DATASET", process.env.NEXT_PUBLIC_SANITY_DATASET);
export const apiVersion = "2026-10-01";
export const studioUrl = "/studio";
