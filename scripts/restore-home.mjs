/**
 * Remet la page « Accueil » de Sanity dans l'état d'une sauvegarde (dossier backups/sanity).
 *
 *   node --env-file=.env.local scripts/restore-home.mjs backups/sanity/homePage-avant-11-novembre.json
 *
 * Remplace la version publiée par celle du fichier et supprime le brouillon en cours, pour que le
 * Studio affiche la version restaurée. Les images référencées sont toujours dans Sanity (elles ne
 * sont jamais supprimées automatiquement). Sans argument --yes, affiche seulement ce qui changerait.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

const file = process.argv[2];
const apply = process.argv.includes("--yes");
if (!file) {
  console.error("Indiquez le fichier de sauvegarde, par exemple backups/sanity/homePage-avant-11-novembre.json");
  process.exit(1);
}
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error("Variable d'environnement manquante : SANITY_API_WRITE_TOKEN (lancer avec --env-file=.env.local)");
  process.exit(1);
}

const backup = JSON.parse(readFileSync(file, "utf8"));
if (backup._id !== "homePage" || backup._type !== "homePage") {
  console.error("Ce fichier n'est pas une sauvegarde de la page Accueil.");
  process.exit(1);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { _rev, _updatedAt, _createdAt, ...doc } = backup;

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-10-01",
  token,
  useCdn: false,
  perspective: "raw",
});

const current = await client.getDocument("homePage");
console.log(`Sauvegarde : modifiée le ${_updatedAt}, hero « ${(doc.hero?.titleLines ?? []).join(" ")} », ${doc.engagements?.length ?? 0} engagements.`);
console.log(`Actuelle   : modifiée le ${current?._updatedAt}, hero « ${(current?.hero?.titleLines ?? []).join(" ")} », ${current?.engagements?.length ?? 0} engagements.`);
if (!apply) {
  console.log("Aperçu seulement. Relancer avec --yes pour restaurer.");
} else {
  await client.transaction().createOrReplace(doc).delete("drafts.homePage").commit();
  console.log("Page Accueil restaurée. Le site se met à jour en quelques secondes.");
}
