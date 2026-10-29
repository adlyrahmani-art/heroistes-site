# Intégration CMS headless Sanity — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** rendre éditables dans Sanity (Studio sur `/studio`, édition visuelle) les contenus de l'accueil, des réglages, du formulaire de contact, des articles de blog et des cas clients, sans redéploiement à la publication.

**Architecture :** Studio intégré au repo Next.js (route `/studio`, groupe de routes séparé du site). Le site lit Sanity côté serveur via `defineLive` de `next-sanity` (cache Next + rafraîchissement ciblé par tags à la publication) ; le mode brouillon (Draft Mode) active les caractères invisibles (stega) et l'overlay de clic de l'outil Presentation. Un utilitaire unique nettoie les textes qui ne sont pas affichés tels quels.

**Tech Stack :** Next.js 16.4 (App Router), React 19.3, `sanity` ^6.20, `next-sanity` ^13.4, `@sanity/image-url` ^2.1, `@sanity/vision` ^6.20, `styled-components` ^6.1 (pair requis du Studio), `resend` ^6.35, Vitest ^5, `@playwright/test` ^1.64, `@vercel/stega` (dev, fixtures de test).

**Spec :** `docs/superpowers/specs/2026-10-29-sanity-cms-design.md` (sa § 9 liste les corrections apportées au doc d'origine).

## Périmètre de ce plan

- **Inclus :** fondations Sanity et Studio, briques réutilisables, modèle de l'accueil (lames réelles, § 6.1 de la spec), Réglages, Formulaire de contact (option B) et Demandes de contact, collections Article de blog et Cas client avec leurs pages détail, édition visuelle, publication sans redéploiement, import des contenus actuels, tests.
- **Hors périmètre (plan suivant) :** pages uniques Conseil, Secteurs, L'agence, Contact et Expertise × 4. Elles n'ont ni route ni maquette (spec § 6.1) : leurs « groupes de champs par lame » ne peuvent pas être définis. Elles feront l'objet d'un second plan quand leurs maquettes existeront. Index `/blog` et `/cas-clients` et newsletter : hors périmètre (pas de maquette, pas dans la spec).

## Prérequis (à faire par Adly, hors code)

1. Créer le projet Sanity (sanity.io/manage), dataset `production`, et noter l'ID du projet.
2. Origines CORS du projet, **avec** « Allow credentials » : `http://localhost:3000`, `https://heroistes.uxtreampro.com`, `https://*.vercel.app`, `https://heroistes.com`.
3. Jetons API : un « Viewer » (lecture des brouillons) et un « Editor » (écriture : formulaire et import).
4. Inviter le compte du client avec le rôle **Editor**.
5. Resend : compte, domaine d'envoi vérifié, clé API.
6. Vercel : variables d'environnement (liste en Contraintes globales) sur Production et Preview ; activer le secret « Protection Bypass for Automation » pour les tests Playwright sur les previews.

## Global Constraints

- Studio accessible sur `/studio` du même déploiement Vercel ; un seul repo, un seul déploiement.
- Les pages uniques ne se créent ni ne se suppriment dans le Studio ; seuls Article de blog et Cas client sont créés et supprimés par le client.
- Chaque document porte un champ `language`, valeur `"fr"` par défaut, masqué et en lecture seule.
- Titres-signatures : saisis ligne par ligne ; nombre de lignes et caractères par ligne maximum réglés par lame ; le Studio refuse un titre qui dépasse.
- Listes à nombre fixe : le client modifie le contenu, jamais le nombre d'éléments.
- Image : texte alternatif obligatoire, point focal (hotspot) réglable ; images servies par le CDN Sanity, recadrées selon le point focal.
- Caractères invisibles (stega) uniquement en mode brouillon ; les visiteurs reçoivent des textes propres.
- Publication : rafraîchissement en quelques secondes, uniquement des pages concernées ; aucun redéploiement Vercel pour du contenu.
- Le WebGL reste complet dans l'aperçu.
- Formulaire : Nom, Prénom, E-mail et Description du projet toujours affichés et obligatoires ; champs prévus activables et rendables obligatoires : Téléphone et Sujet (affichés et obligatoires par défaut) ; aucun champ créé par le client.
- Formulaire : traitement serveur Next.js, e-mail via Resend vers l'adresse définie dans Sanity, copie « Demande de contact » en lecture seule dans Sanity, champ piège invisible, limite d'envois par IP, validation serveur selon les champs activés.
- Types TypeScript générés depuis le modèle (`sanity typegen`) ; un écart code / modèle bloque la compilation.
- Variables d'environnement : `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` (= `production`), `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `IP_HASH_SALT`, `E2E_TOKEN`.
- `AGENTS.md` du repo : cette version de Next.js a des changements incompatibles ; avant d'écrire une route, un layout, le Draft Mode ou un Route Handler, lire le guide correspondant dans `node_modules/next/dist/docs/`.
- Le rendu visuel actuel (desktop, tablette, mobile) ne change pas : seule la source des contenus change.

## Review Focus

1. **Texte collé avec retours à la ligne ou espaces en trop dans un titre-signature** : chaque ligne est mesurée après `trim()` ; une ligne vide est refusée. → test dans la Tâche 3.
2. **Valeur stega dans un attribut** (`href`, `id`, `alt` d'une image décorative, `mailto:`, URL d'image, balises `<meta>`) : jamais de caractère invisible hors du texte affiché. → test dans la Tâche 4 et règle « où nettoyer » appliquée aux Tâches 8 à 12.
3. **Formulaire envoyé deux fois (double clic) ou depuis une IP qui insiste** : la 6e demande en une heure depuis la même IP reçoit le message d'erreur du client (HTTP 429), sans e-mail ni copie. → test dans la Tâche 13.
4. **Sanity indisponible au moment d'un envoi de formulaire** : l'e-mail part quand même et le visiteur voit le succès. → test dans la Tâche 13.
5. **Champ prévu masqué mais envoyé quand même par un client malveillant** (par exemple Sujet désactivé) : la valeur est ignorée (ni validée, ni stockée, ni envoyée). → test dans la Tâche 13.

---

## Structure des fichiers

```
sanity.config.ts                     config du Studio (basePath /studio, structure, Presentation, Vision)
sanity.cli.ts                        config CLI (projet, dataset, typegen)
src/sanity/env.ts                    lecture et contrôle des variables d'environnement
src/sanity/lib/client.ts             client Sanity (lecture publique)
src/sanity/lib/live.ts               defineLive → sanityFetch, SanityLive
src/sanity/lib/image.ts              imageUrl(image, width)
src/sanity/lib/clean.ts              clean(), editAttr() — nettoyage stega partagé
src/sanity/lib/queries.ts            requêtes GROQ (defineQuery)
src/sanity/schemaTypes/index.ts      liste des types
src/sanity/schemaTypes/fields.ts     languageField, exactCount()
src/sanity/schemaTypes/signatureTitle.ts   brique + validateSignatureLines()
src/sanity/schemaTypes/objects/      imageWithAlt.ts, button.ts, seo.ts
src/sanity/schemaTypes/documents/    siteSettings.ts, homePage.ts, contactForm.ts,
                                     contactRequest.ts, blogPost.ts, caseStudy.ts
src/sanity/structure.ts              pages uniques non supprimables + collections
src/sanity/presentation.ts           resolve des emplacements pour Presentation
sanity.types.ts                      généré (typegen) — commité
src/app/layout.tsx                   racine minimale (html, polices)
src/app/(site)/layout.tsx            site : globals.css, SmoothScroll, Cursor, SanityLive, VisualEditing
src/app/(site)/page.tsx              accueil (ex-src/app/page.tsx)
src/app/(site)/blog/[slug]/page.tsx
src/app/(site)/cas-clients/[slug]/page.tsx
src/app/studio/[[...tool]]/page.tsx
src/app/api/draft-mode/enable/route.ts
src/app/api/draft-mode/disable/route.ts
src/app/api/contact/route.ts
src/lib/contact/validate.ts          validateContact()
src/lib/contact/rateLimit.ts         hashIp(), RATE_LIMIT
src/lib/contact/send.ts              handleContact() — orchestration (testable sans réseau)
scripts/seed-sanity.ts               import des contenus et images actuels
vitest.config.ts, playwright.config.ts
tests/unit/*.test.ts, tests/e2e/*.spec.ts
docs/recette-edition-visuelle.md     recette manuelle
```

---

### Task 1 : Fondations Sanity, Studio sur `/studio`, séparation des layouts

**Files :**
- Create : `sanity.config.ts`, `sanity.cli.ts`, `src/sanity/env.ts`, `src/sanity/lib/client.ts`, `src/sanity/schemaTypes/index.ts` (tableau vide pour l'instant), `src/sanity/structure.ts`, `src/app/studio/[[...tool]]/page.tsx`, `src/app/(site)/layout.tsx`, `.env.example`
- Move : `src/app/page.tsx` → `src/app/(site)/page.tsx`
- Modify : `src/app/layout.tsx` (ne garde que `<html>`, `<body>`, polices ; `globals.css`, `SmoothScroll`, `Cursor` passent dans `(site)/layout.tsx`), `package.json`

**Interfaces :**
- Produces : `projectId`, `dataset`, `apiVersion` (= `"2026-10-01"`), `studioUrl` (= `"/studio"`) exportés par `src/sanity/env.ts` ; `client` (de `next-sanity`, `useCdn: true`, `perspective: "published"`) exporté par `src/sanity/lib/client.ts` ; `structure` exporté par `src/sanity/structure.ts`.

- [ ] **Step 1 :** installer `sanity@^6.20 next-sanity@^13.4 @sanity/vision@^6.20 @sanity/image-url@^2.1 styled-components@^6.1`. Ajouter les scripts `"typegen": "sanity schema extract --path=sanity.schema.json && sanity typegen generate"` et `"prebuild": "npm run typegen"`.
- [ ] **Step 2 :** `src/sanity/env.ts` lève une erreur explicite si `NEXT_PUBLIC_SANITY_PROJECT_ID` ou `NEXT_PUBLIC_SANITY_DATASET` manque (message : `Variable d'environnement manquante : <NOM>`). `.env.example` liste les 8 variables des Contraintes globales, sans valeurs.
- [ ] **Step 3 :** `sanity.config.ts` : `basePath: "/studio"`, `title: "Héroïstes"`, plugins `structureTool({ structure })` et `visionTool()` (Presentation arrive en Tâche 7). Page Studio : `NextStudio` de `next-sanity/studio`, `export const dynamic = "force-static"`, `export { metadata, viewport } from "next-sanity/studio"`.
- [ ] **Step 4 :** vérifier que le Studio ne charge ni Lenis, ni le curseur, ni `globals.css` : `npm run dev`, ouvrir `http://localhost:3000/studio` → l'écran de connexion Sanity s'affiche, curseur système visible, défilement natif.
- [ ] **Step 5 :** vérifier que le site est inchangé : `http://localhost:3000/` identique (hero, défilement horizontal, curseur). `npx eslint src && npx tsc --noEmit` → aucune erreur.
- [ ] **Step 6 :** commit `feat(cms): Studio Sanity sur /studio et layout du site séparé`.

### Task 2 : Outillage de tests unitaires et briques communes (`language`, nombre fixe)

**Files :**
- Create : `vitest.config.ts` (environnement `node`, `include: ["tests/unit/**/*.test.ts"]`), `src/sanity/schemaTypes/fields.ts`, `tests/unit/fields.test.ts`
- Modify : `package.json` (script `"test": "vitest run"`, devDeps `vitest@^5`)

**Interfaces :**
- Produces : `languageField` (définition de champ `language` : `type: "string"`, `initialValue: "fr"`, `hidden: true`, `readOnly: true`) ; `exactCount(n: number): (items: unknown[] | undefined) => true | string`.

- [ ] **Step 1 : test qui échoue**
```ts
test("exactCount accepte exactement n éléments", () => {
  expect(exactCount(4)([1, 2, 3, 4])).toBe(true);
  expect(exactCount(4)([1, 2, 3])).toBe("Cette liste doit contenir exactement 4 éléments.");
  expect(exactCount(4)(undefined)).toBe("Cette liste doit contenir exactement 4 éléments.");
});
test("languageField vaut fr par défaut, masqué et en lecture seule", () => {
  expect(languageField).toMatchObject({ name: "language", initialValue: "fr", hidden: true, readOnly: true });
});
```
- [ ] **Step 2 :** `npm test` → FAIL (`exactCount` non défini).
- [ ] **Step 3 :** implémenter dans `fields.ts` (texte d'erreur exact ci-dessus, `n` interpolé).
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 :** commit `test(cms): Vitest et briques language / nombre fixe`.

### Task 3 : Brique titre-signature et objets image, bouton, SEO

**Files :**
- Create : `src/sanity/schemaTypes/signatureTitle.ts`, `src/sanity/schemaTypes/objects/imageWithAlt.ts`, `src/sanity/schemaTypes/objects/button.ts`, `src/sanity/schemaTypes/objects/seo.ts`, `tests/unit/signatureTitle.test.ts`
- Modify : `src/sanity/schemaTypes/index.ts`

**Interfaces :**
- Produces :
  - `validateSignatureLines(lines: string[] | undefined, limits: { maxLines: number; maxChars: number }): true | string`
  - `signatureTitleField(name: string, title: string, limits: { maxLines: number; maxChars: number })` → champ `array` de `string`, validation = `validateSignatureLines`, description affichée : `"{maxLines} ligne(s) maximum, {maxChars} caractères par ligne"`.
  - Types d'objet : `imageWithAlt` (image `hotspot: true` + champ `alt` string **requis**), `button` (`label` requis, `href` requis), `seo` (`title`, `description`, `image: imageWithAlt`).

- [ ] **Step 1 : tests qui échouent**
```ts
const lim = { maxLines: 2, maxChars: 14 };
test("accepte un titre dans les limites", () => expect(validateSignatureLines(["L’agence", "marketing B2B"], lim)).toBe(true));
test("refuse trop de lignes", () => expect(validateSignatureLines(["a", "b", "c"], lim)).toBe("2 lignes maximum (3 saisies)."));
test("refuse une ligne trop longue", () =>
  expect(validateSignatureLines(["Spécialisation B2B!"], lim)).toBe("Ligne 1 : 19 caractères, 14 maximum."));
test("mesure après trim et refuse une ligne vide", () => {
  expect(validateSignatureLines(["  Accès  ", "direct"], lim)).toBe(true);
  expect(validateSignatureLines(["Accès", "   "], lim)).toBe("Ligne 2 vide.");
});
test("refuse un titre absent", () => expect(validateSignatureLines(undefined, lim)).toBe("Titre obligatoire."));
test("refuse une ligne contenant un retour à la ligne", () =>
  expect(validateSignatureLines(["Accès\ndirect"], lim)).toBe("Ligne 1 : un seul retour à la ligne par ligne saisie, ajoutez une ligne."));
```
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter (ordre des contrôles : absent → retour à la ligne → nombre de lignes → ligne vide → longueur ; longueur comptée en caractères visibles `[...trimmed].length`).
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 :** commit `feat(cms): brique titre-signature et objets image, bouton, SEO`.

### Task 4 : Utilitaire partagé de nettoyage (`clean`, `editAttr`)

**Files :**
- Create : `src/sanity/lib/clean.ts`, `tests/unit/clean.test.ts`
- Modify : `package.json` (devDep `@vercel/stega`)

**Interfaces :**
- Produces :
  - `clean<T>(value: T): T` — retire récursivement les caractères stega (via `stegaClean` de `next-sanity`).
  - `editAttr(doc: { _id: string; _type: string }, path: string): string` — valeur d'attribut `data-sanity` (via `createDataAttribute` de `next-sanity`, `baseUrl: studioUrl`) pour garder le clic vers le bon champ sur un élément dont le texte a été nettoyé.

**Règle « où nettoyer »** (appliquée aux Tâches 8 à 12) : passe par `clean()` toute valeur Sanity qui n'est **pas** rendue comme texte HTML visible : attributs (`href`, `src`, `id`, `alt`, `aria-label`, `mailto:`), clés React, métadonnées (`generateMetadata`), texte dessiné dans un canvas ou un masque SVG (`WaveWord`), texte mesuré, texte dupliqué en `aria-hidden` (nom défilant des cas clients). L'élément qui affiche ce texte nettoyé reçoit `data-sanity={editAttr(doc, chemin)}` (la « zone HTML » qui garde le clic). Le texte HTML visible ordinaire n'est pas nettoyé.

- [ ] **Step 1 : tests qui échouent**
```ts
import { vercelStegaCombine } from "@vercel/stega";
const enc = vercelStegaCombine("Approche", { origin: "sanity.io", href: "/studio" });
test("clean retire les caractères invisibles d'une chaîne", () => expect(clean(enc)).toBe("Approche"));
test("clean nettoie en profondeur", () =>
  expect(clean({ title: [enc], cta: { href: vercelStegaCombine("#contact", { href: "/studio" }) } }))
    .toEqual({ title: ["Approche"], cta: { href: "#contact" } }));
test("clean laisse intacte une chaîne propre", () => expect(clean("Impact")).toBe("Impact"));
test("editAttr encode le document et le chemin", () =>
  expect(editAttr({ _id: "homePage", _type: "homePage" }, "engagements[0].ghost")).toContain("homePage"));
```
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter.
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 :** commit `feat(cms): utilitaire de nettoyage stega partagé`.

### Task 5 : Modèle de contenu, structure du Studio, requêtes et types générés

**Files :**
- Create : `src/sanity/schemaTypes/documents/{siteSettings,homePage,contactForm,contactRequest,blogPost,caseStudy}.ts`, `src/sanity/lib/queries.ts`, `sanity.types.ts` (généré), `tests/unit/schemas.test.ts`
- Modify : `src/sanity/schemaTypes/index.ts`, `src/sanity/structure.ts`, `sanity.config.ts`

**Interfaces :**
- Consumes : `languageField`, `exactCount` (T2), `signatureTitleField`, `imageWithAlt`, `button`, `seo` (T3).
- Produces : requêtes `HOME_QUERY`, `SETTINGS_QUERY`, `CONTACT_FORM_QUERY`, `BLOG_POST_QUERY`, `BLOG_SLUGS_QUERY`, `LATEST_POSTS_QUERY` (4 derniers par `publishedAt desc`), `CASE_STUDY_QUERY`, `CASE_SLUGS_QUERY` ; types générés `HOME_QUERYResult`, etc. ; IDs fixes des pages uniques : `siteSettings`, `homePage`, `contactForm`.

Tous les documents incluent `languageField`. Chaque champ texte affiché est `required()` (spec § 8.2 « contenu incomplet »), sauf mention « optionnel ».

**`homePage`** (un groupe/fieldset par lame, dans l'ordre réel du site — spec § 6.1) :

| Groupe | Champs | Limites |
|---|---|---|
| `hero` | `eyebrow` (titre-signature), `titleLines` (titre-signature), `subtitle` (string), `highlight` (string), `text` (text, `**gras**`), `ctaPrimary`, `ctaSecondary` (button), `image` (imageWithAlt, photo WebGL) | eyebrow 3 l × 12 c ; titleLines 2 l × 14 c ; subtitle ≤ 16 c ; highlight ≤ 10 c |
| `engagementsTitle` | string | ≤ 20 c |
| `engagements` | tableau de `{ title (signature), ghost, text, image, side ("left"\|"right") }` | `exactCount(4)` ; title 2 l × 14 c ; ghost ≤ 8 c |
| `logosBand` | `text`, `clients` (tableau d'`imageWithAlt`, `alt` = nom du client) | 4 à 12 logos |
| `besoins` | `title`, `intro`, `items[]` `{ title, offer, href, text, image }` | `exactCount(6)` ; title ≤ 48 c |
| `expertises` | `title` (signature), `heading`, `intro`, `image`, `cards[]` `{ title (signature), lead, text, link? { before, label, href } }` (optionnel : link) | title 2 l × 24 c ; cards `exactCount(6)` (3 stratégie puis 3 mise en œuvre) ; titre de carte 2 l × 14 c |
| `pourquoi` | `title` (signature), `intro`, `items[]` `{ title (signature), text, image }`, `outro`, `cta` | title 2 l × 28 c ; items `exactCount(3)`, titre 3 l × 14 c |
| `plan` | `title`, `subtitle`, `intro`, `steps[]` `{ title (signature), text, image }`, `outro` (tableau de 2 text), `cta` | title ≤ 24 c, subtitle ≤ 40 c ; steps `exactCount(2)`, titre 2 l × 20 c ; outro `exactCount(2)` |
| `casClients` | `title` (signature), `intro`, `image`, `cases` (références `caseStudy`), `cta` | title 3 l × 17 c ; cases `exactCount(3)` |
| `blog` | `title` (signature), `cta` | title 3 l × 14 c (les 4 derniers articles remontent seuls) |
| `faq` | `title` (signature), `items[]` `{ question, answer }` | title 2 l × 15 c ; `exactCount(5)` |
| `contactLead` | `lead` (signature, titre avant le footer) | 2 l × 24 c |

**`siteSettings`** : `navLabels` (8 strings : accueil, expertises, conseil, casClients, secteurs, agence, blog, contact — l'arborescence reste dans `src/content/navigation.ts`), `headerCta` (button), `footer` { `visual` (imageWithAlt), `baseline`, `newsletterTitle`, `newsletterText`, `copyright`, `email` }, `social` { `linkedin` (url) }, `seo` (seo, SEO par défaut).

**`contactForm`** : `title` (signature 2 l × 13 c), `intro`, `recipient` (email requis), `submitLabel`, `successMessage`, `errorMessage`, `rateLimitMessage`, `privacyText`, `privacyLink` (button) ; champs fixes `lastName` (Nom), `firstName` (Prénom), `email` (E-mail), `description` (Description du projet) : `{ label, placeholder }` ; champs prévus `phone` (Téléphone), `subject` (Sujet) : `{ enabled (bool, défaut true), required (bool, défaut true), label, placeholder }`. Valeurs initiales = libellés et textes d'exemple actuels du footer (`src/content/accueil.ts`, objet `footer`).

**`contactRequest`** : `receivedAt` (datetime), `lastName`, `firstName`, `email`, `description`, `phone?`, `subject?`, `ipHash`, `emailStatus` (`"envoyé" | "échec"`) ; tous les champs `readOnly: true` ; non créable depuis le Studio.

**`blogPost`** : `title`, `slug` (source `title`), `publishedAt` (datetime), `excerpt`, `cover` (imageWithAlt), `body` (portable text avec images `imageWithAlt`), `seo`. Carte d'accueil : partie en gras = texte jusqu'au premier « : » inclus, sinon titre entier (aucun champ supplémentaire).

**`caseStudy`** : champs de la spec — `title`, `slug`, `clientName`, `sector` (liste : `["Industrie", "Tech & SaaS", "Services B2B", "Distribution & logistique", "Bien-être", "Promotion immobilière", "Associatif"]`), `keyFigures[]` `{ result, detail }` (optionnel, 0 à 3), `image` (imageWithAlt, photo de la carte), `body`, `seo` — plus les champs qu'affiche la carte d'accueil : `tag`, `question`, `background` (imageWithAlt, fond flouté), `logo` (imageWithAlt), `logoSize` (number, 60–200), `highlights` (1 à 5 strings).

- [ ] **Step 1 : test qui échoue** (`tests/unit/schemas.test.ts`) : pour chaque document de `schemaTypes`, un champ `language` existe ; `homePage.fields` contient, dans cet ordre, les groupes `hero, engagementsTitle, engagements, logosBand, besoins, expertises, pourquoi, plan, casClients, blog, faq, contactLead`.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** écrire les schémas, puis `structure.ts` : liste « Pages » (Réglages, Accueil, Formulaire de contact, ouverts par `documentId` fixe), listes « Articles de blog », « Cas clients », « Demandes de contact ». Dans `sanity.config.ts` : `document.actions` retire `delete`, `duplicate` et `unpublish` pour les 3 pages uniques et toutes les actions d'écriture pour `contactRequest` ; `document.newDocumentOptions` ne propose que `blogPost` et `caseStudy`.
- [ ] **Step 4 :** écrire les requêtes avec `defineQuery` (filtre `language == "fr"` sur chaque requête), puis `npm run typegen` → `sanity.types.ts` généré sans erreur.
- [ ] **Step 5 :** `npm test` → PASS ; `npx tsc --noEmit` → OK. Dans le Studio local : les 3 pages uniques n'ont ni « Supprimer » ni « Dupliquer » ; « Créer » ne propose qu'Article de blog et Cas client ; saisir 3 lignes dans `hero.titleLines` affiche « 2 lignes maximum (3 saisies). ».
- [ ] **Step 6 :** commit `feat(cms): modèle de contenu, structure du Studio et types générés`.

### Task 6 : Import des contenus actuels dans Sanity

**Files :**
- Create : `scripts/seed-sanity.ts`

**Interfaces :**
- Consumes : schémas (T5) ; données de `src/content/accueil.ts` et `src/content/navigation.ts` ; images de `public/images/`.
- Produces : documents `homePage`, `siteSettings`, `contactForm` publiés, 3 `caseStudy` (Pranéo, Rezo Partage, Isère Habitat) et 4 `blogPost` (contenus des cartes actuelles, `body` = extrait), images téléversées avec leur `alt` actuel.

- [ ] **Step 1 :** écrire le script (exécution : `npx sanity exec scripts/seed-sanity.ts --with-user-token`). Il est idempotent : `createOrReplace` avec des `_id` stables (`homePage`, `siteSettings`, `contactForm`, `caseStudy.praneo`, `blogPost.illusion-esthetique`…) ; téléversement d'une image une seule fois par fichier (cache local `path → assetId`). `contactForm.recipient` = `contact@heroistes.com` ; Téléphone et Sujet affichés et obligatoires (comme aujourd'hui).
- [ ] **Step 2 :** lancer le script deux fois de suite → aucun doublon dans le Studio (même nombre de documents et d'images).
- [ ] **Step 3 :** dans le Studio, chaque page unique est complète (aucun champ requis en erreur).
- [ ] **Step 4 :** commit `feat(cms): import des contenus actuels`.

### Task 7 : Lecture en direct, mode brouillon et outil Presentation

**Files :**
- Create : `src/sanity/lib/live.ts`, `src/sanity/lib/image.ts`, `src/sanity/presentation.ts`, `src/app/api/draft-mode/enable/route.ts`, `src/app/api/draft-mode/disable/route.ts`
- Modify : `src/app/(site)/layout.tsx`, `sanity.config.ts`

**Interfaces :**
- Consumes : `client`, `studioUrl` (T1).
- Produces : `sanityFetch({ query, params? })` et `<SanityLive />` (de `defineLive`, `serverToken` et `browserToken` = `SANITY_API_READ_TOKEN`, client configuré avec `stega: { studioUrl }`) ; `imageUrl(image: ImageWithAlt, width: number): string` (`@sanity/image-url`, `.width(width).fit("crop").auto("format")`, respecte le hotspot) ; `locations` pour Presentation.

- [ ] **Step 1 :** routes Draft Mode : `enable` = `defineEnableDraftMode({ client: client.withConfig({ token: SANITY_API_READ_TOKEN }) })` ; `disable` = `(await draftMode()).disable()` puis redirection vers `/`.
- [ ] **Step 2 :** `(site)/layout.tsx` rend `<SanityLive />` toujours, et `<VisualEditing />` (de `next-sanity/visual-editing`) seulement si `(await draftMode()).isEnabled`.
- [ ] **Step 3 :** `presentationTool({ resolve: { locations }, previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } } })` ; emplacements : `homePage`, `siteSettings`, `contactForm` → `/` ; `blogPost` → `/blog/{slug}` ; `caseStudy` → `/cas-clients/{slug}` et `/`.
- [ ] **Step 4 :** vérification : ouvrir Presentation dans le Studio local → l'accueil s'affiche dans l'écran partagé ; hors Studio, `curl -s http://localhost:3000/ | grep -c $'​'` → `0` (aucun caractère invisible servi aux visiteurs).
- [ ] **Step 5 :** commit `feat(cms): lecture en direct, mode brouillon et Presentation`.

### Task 8 : Accueil depuis Sanity — hero, Nos engagements, bandeau de logos, Vos besoins

**Files :**
- Modify : `src/app/(site)/page.tsx`, `src/components/home/HeroPanel.tsx`, `HeroImage.tsx` (reçoit l'URL), `SectionTitlePanel.tsx`, `EngagementPanel.tsx`, `WaveWord.tsx`, `LogosBand.tsx`, `Besoins.tsx`

**Interfaces :**
- Consumes : `sanityFetch`, `HOME_QUERY` / `HOME_QUERYResult`, `imageUrl`, `clean`, `editAttr`.
- Produces : chaque composant reçoit sa lame en prop typée `NonNullable<HOME_QUERYResult>["hero"]` (etc.) au lieu d'importer `@/content/accueil`.

- [ ] **Step 1 :** `page.tsx` (composant serveur) appelle `sanityFetch({ query: HOME_QUERY })` et passe chaque groupe à sa lame. Si le document est absent → `notFound()`.
- [ ] **Step 2 :** appliquer la règle « où nettoyer » (T4) : `WaveWord` reçoit `clean(ghost)` et son conteneur `data-sanity={editAttr(home, "engagements[i].ghost")}` ; `href`, `src`, `alt`, `id` passent par `clean()`.
- [ ] **Step 3 :** vérification visuelle sur `localhost:3000` (bureau 1440 px, mobile 390 px) : ces lames sont identiques à avant ; `npx tsc --noEmit` OK.
- [ ] **Step 4 :** vérification d'édition : dans Presentation, cliquer sur « Approche globale », sur le mot fantôme « GLOBALE » et sur un logo → le bon champ s'ouvre.
- [ ] **Step 5 :** commit `feat(cms): accueil (hero à besoins) alimenté par Sanity`.

### Task 9 : Accueil depuis Sanity — Expertises, Pourquoi choisir, Du plan aux résultats

**Files :**
- Modify : `src/components/home/Expertises.tsx`, `B2BSections.tsx`, `src/app/(site)/page.tsx`

**Interfaces :** comme la Tâche 8 (groupes `expertises`, `pourquoi`, `plan`). Les cartes 1 à 3 forment la ligne « stratégie », 4 à 6 la ligne « mise en œuvre ».

- [ ] **Step 1 :** brancher les props ; la phrase-lien des cartes (`link.before`, `link.label`, `link.href`) garde son rendu actuel ; `href` nettoyé.
- [ ] **Step 2 :** vérification visuelle bureau et mobile identique à avant ; clic Presentation sur une carte, une raison et une étape → bon champ.
- [ ] **Step 3 :** commit `feat(cms): expertises, pourquoi et plan alimentés par Sanity`.

### Task 10 : Accueil depuis Sanity — Cas clients, Blog, FAQ, titre avant le footer

**Files :**
- Modify : `src/components/home/CasClients.tsx`, `Blog.tsx`, `Faq.tsx`, `src/components/Footer.tsx` (titre « Votre prochaine étape » seulement), `src/app/(site)/page.tsx`

**Interfaces :**
- Consumes : groupes `casClients` (avec les 3 `caseStudy` résolus), `blog`, `faq`, `contactLead` ; `LATEST_POSTS_QUERY` (4 articles) ; `splitCardTitle(title: string): { lead: string; rest: string }` (nouveau, dans `src/components/home/Blog.tsx` ou un petit module voisin).

- [ ] **Step 1 : test qui échoue** (`tests/unit/splitCardTitle.test.ts`)
```ts
expect(splitCardTitle("Friction intentionnelle : quand briser les règles")).toEqual({ lead: "Friction intentionnelle :", rest: "quand briser les règles" });
expect(splitCardTitle("Comment une simple refonte a fait chuter le rebond")).toEqual({ lead: "Comment une simple refonte a fait chuter le rebond", rest: "" });
```
- [ ] **Step 2 :** `npm test` → FAIL ; implémenter ; `npm test` → PASS.
- [ ] **Step 3 :** brancher les props. Le nom défilant (dupliqué, `aria-hidden`) reçoit `clean(clientName)` et son conteneur `editAttr(caseStudy, "clientName")`. Les liens des cartes de blog pointent vers `/blog/{slug}`.
- [ ] **Step 4 :** vérification visuelle bureau / mobile identique (animation des cas clients comprise) ; publier un nouvel article dans le Studio → il apparaît en tête du Blog de l'accueil en moins de 10 s sans redéploiement.
- [ ] **Step 5 :** commit `feat(cms): cas clients, blog et FAQ de l'accueil alimentés par Sanity`.

### Task 11 : Header et footer depuis les Réglages

**Files :**
- Modify : `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/content/navigation.ts` (les libellés de 1er niveau viennent de `siteSettings.navLabels`), `src/app/(site)/layout.tsx` (récupère `SETTINGS_QUERY` et le passe au header et au footer), métadonnées par défaut (`generateMetadata` du layout depuis `siteSettings.seo`, valeurs nettoyées)

- [ ] **Step 1 :** brancher ; `mailto:` et LinkedIn nettoyés.
- [ ] **Step 2 :** vérification : modifier « Cas clients » dans les Réglages → le libellé change dans le menu bureau et mobile après publication ; `<title>` et `<meta name="description">` de l'accueil sans caractère invisible (`curl … | grep -c $'​'` → `0`).
- [ ] **Step 3 :** commit `feat(cms): header et footer alimentés par les Réglages`.

### Task 12 : Pages détail Article de blog et Cas client

**Files :**
- Create : `src/app/(site)/blog/[slug]/page.tsx`, `src/app/(site)/cas-clients/[slug]/page.tsx`, `src/components/PortableBody.tsx`, styles associés (`*.module.css`)

**Interfaces :**
- Consumes : `BLOG_POST_QUERY`, `BLOG_SLUGS_QUERY`, `CASE_STUDY_QUERY`, `CASE_SLUGS_QUERY`, `imageUrl`, `clean`.

Gabarit provisoire, sans maquette : fond clair, titre en police display, date (blog) ou nom du client et chiffres clés (cas), image, corps en `PortableText`, styles existants (`--u`, `--section-y`, `.btn`). À remplacer quand les maquettes existeront.

- [ ] **Step 1 :** `generateStaticParams` depuis les slugs ; slug inconnu → `notFound()` ; `generateMetadata` depuis `seo` (repli sur titre et extrait), valeurs nettoyées.
- [ ] **Step 2 :** vérification : `/blog/illusion-esthetique-refonte-ui` et `/cas-clients/praneo` s'affichent ; `/blog/inexistant` → 404 ; Presentation ouvre l'article et le clic sur le titre ouvre le bon champ.
- [ ] **Step 3 :** commit `feat(cms): pages détail article de blog et cas client`.

### Task 13 : Formulaire de contact (option B) — validation, anti-spam, envoi, copie

**Files :**
- Create : `src/lib/contact/validate.ts`, `src/lib/contact/rateLimit.ts`, `src/lib/contact/send.ts`, `src/app/api/contact/route.ts`, `tests/unit/contact.test.ts`
- Modify : `src/components/Footer.tsx` (les six champs actuels gardent leur mise en page ; libellés, textes d'exemple et affichage de Téléphone / Sujet viennent de `CONTACT_FORM_QUERY` ; envoi `fetch("/api/contact")`, états envoi / succès / erreur), `package.json` (`resend@^6.35`)

**Interfaces :**
- Produces :
  - `ContactFormConfig = NonNullable<CONTACT_FORM_QUERYResult>` (type généré, Tâche 5).
  - `validateContact(input: Record<string, unknown>, form: ContactFormConfig): { ok: true; data: ContactData } | { ok: false; errors: Partial<Record<keyof ContactData, string>> }` — ne garde que `lastName`, `firstName`, `email`, `description` et les champs prévus **activés** ; `ContactData = { lastName; firstName; email; description; phone?; subject? }`.
  - `hashIp(ip: string, salt: string): string` (SHA-256 hex) ; `RATE_LIMIT = { max: 5, windowMinutes: 60 }`.
  - `handleContact(input, deps): Promise<{ status: 200 | 400 | 429 | 502; message: string }>` avec `deps = { form, ipHash, countRecent(ipHash): Promise<number>, saveCopy(data): Promise<string | null>, markEmail(id, status): Promise<void>, sendEmail(data, to): Promise<void> }`.
- Champ piège : nom `website`, masqué en CSS et `tabIndex={-1}`, `autoComplete="off"`.

Ordre de `handleContact` : piège rempli → 200 (message de succès), rien d'autre ; validation échouée → 400 (`errors`) ; `countRecent ≥ 5` → 429 (`rateLimitMessage`) ; `saveCopy` (erreur avalée → `null`) ; `sendEmail` → succès : `markEmail(id, "envoyé")`, 200 `successMessage` ; échec : `markEmail(id, "échec")`, 502 `errorMessage`. Le Route Handler fournit les dépendances réelles (client Sanity avec `SANITY_API_WRITE_TOKEN`, Resend avec `CONTACT_FROM_EMAIL` vers `form.recipient`, IP depuis `x-forwarded-for`). En-tête `x-e2e-token` égal à `E2E_TOKEN` → `sendEmail` et `saveCopy` remplacés par des no-op (tests sur les previews) ; avec en plus `x-e2e-fail: 1` → `sendEmail` lève une erreur.

- [ ] **Step 1 : tests qui échouent**
```ts
const form = formWith({ phone: { enabled: true, required: true }, subject: { enabled: false } });
test("nom, prénom, e-mail et description toujours obligatoires", () =>
  expect(validateContact({}, form)).toMatchObject({ ok: false, errors: { lastName: expect.any(String), firstName: expect.any(String), email: expect.any(String), description: expect.any(String) } }));
test("champ prévu activé et obligatoire exigé", () =>
  expect(validateContact(valid({ phone: "" }), form)).toMatchObject({ ok: false, errors: { phone: expect.any(String) } }));
test("champ prévu masqué ignoré même s'il est envoyé", () =>
  expect(validateContact(valid({ phone: "06 12 34 56 78", subject: "Créer mon site web" }), form)).toEqual({ ok: true, data: expect.not.objectContaining({ subject: expect.anything() }) }));
test("champ prévu activé mais facultatif accepté vide", () =>
  expect(validateContact(valid({ phone: "" }), formWith({ phone: { enabled: true, required: false }, subject: { enabled: true, required: true } }))).toMatchObject({ ok: true }));
test("e-mail invalide refusé", () =>
  expect(validateContact(valid({ email: "pas-un-email" }), form)).toMatchObject({ ok: false, errors: { email: expect.any(String) } }));
test("champ piège rempli : succès sans copie ni e-mail", async () => {
  const deps = fakeDeps();
  expect(await handleContact({ ...valid(), website: "x" }, deps)).toMatchObject({ status: 200 });
  expect(deps.saveCopy).not.toHaveBeenCalled(); expect(deps.sendEmail).not.toHaveBeenCalled();
});
test("6e envoi dans l'heure : 429 sans e-mail", async () => {
  const deps = fakeDeps({ recent: 5 });
  expect(await handleContact(valid(), deps)).toEqual({ status: 429, message: form.rateLimitMessage });
  expect(deps.sendEmail).not.toHaveBeenCalled();
});
test("Sanity indisponible : l'e-mail part, succès", async () => {
  const deps = fakeDeps({ saveFails: true });
  expect(await handleContact(valid(), deps)).toMatchObject({ status: 200 });
  expect(deps.sendEmail).toHaveBeenCalledOnce();
});
test("échec d'envoi : message d'erreur du client, copie marquée échec", async () => {
  const deps = fakeDeps({ sendFails: true });
  expect(await handleContact(valid(), deps)).toEqual({ status: 502, message: form.errorMessage });
  expect(deps.markEmail).toHaveBeenCalledWith("req-1", "échec");
});
```
(`formWith`, `valid`, `fakeDeps` : petits utilitaires de test dans le même fichier ; `valid(overrides)` renvoie les six champs remplis ; `fakeDeps` renvoie l'id `"req-1"` pour `saveCopy`.)
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter `validate.ts`, `rateLimit.ts`, `send.ts` ; `countRecent` réel = `count(*[_type == "contactRequest" && ipHash == $h && receivedAt > $since])`.
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 :** brancher le Route Handler et le formulaire du footer (seuls les champs activés s'affichent ; double clic : bouton désactivé pendant l'envoi). Vérification locale : un envoi réel arrive à l'adresse de réception et apparaît dans « Demandes de contact », en lecture seule.
- [ ] **Step 6 :** commit `feat(cms): formulaire de contact (option B), anti-spam et copie dans Sanity`.

### Task 14 : Tests de bout en bout sur les previews Vercel

**Files :**
- Create : `playwright.config.ts`, `tests/e2e/site.spec.ts`
- Modify : `package.json` (script `"test:e2e": "playwright test"`, devDep `@playwright/test@^1.64`)

**Interfaces :**
- `baseURL` = `process.env.PLAYWRIGHT_BASE_URL` (URL de la preview Vercel) ; en-têtes envoyés : `x-vercel-protection-bypass: process.env.VERCEL_AUTOMATION_BYPASS_SECRET`, `x-e2e-token: process.env.E2E_TOKEN` ; projets Chromium bureau (1440 × 900) et mobile (390 × 844).

- [ ] **Step 1 :** écrire les tests :
  - `accueil` : le hero affiche « L’agence » et la section `#cas-clients` contient 3 cas ;
  - `article de blog` : `/blog/illusion-esthetique-refonte-ui` affiche son `h1` ; `/blog/inexistant` répond 404 ;
  - `cas client` : `/cas-clients/praneo` affiche « Pranéo » ;
  - `formulaire succès` : remplir Nom, Prénom, E-mail, Téléphone, Sujet et Description du projet, puis envoyer → le message de succès de Sanity s'affiche ;
  - `formulaire erreur` : même envoi avec l'en-tête `x-e2e-fail: 1` → le message d'erreur de Sanity s'affiche ;
  - `Studio` : `/studio` répond 200 et affiche l'écran de connexion Sanity.
- [ ] **Step 2 :** pousser la branche, attendre la preview Vercel, lancer `PLAYWRIGHT_BASE_URL=<url preview> npm run test:e2e` → tous les tests passent sur les deux projets.
- [ ] **Step 3 :** commit `test(cms): tests de bout en bout sur les previews Vercel`.

### Task 15 : Recette manuelle de l'édition visuelle et nettoyage

**Files :**
- Create : `docs/recette-edition-visuelle.md`
- Modify : `src/content/accueil.ts` → déplacé en `scripts/seed-data/accueil.ts` (plus importé par le site) ; imports mis à jour dans `scripts/seed-sanity.ts`

- [ ] **Step 1 :** `grep -rn "content/accueil" src` → aucun résultat (le site ne lit plus que Sanity).
- [ ] **Step 2 :** rédiger la recette : pour chaque lame de l'accueil, le header, le footer, une page article et une page cas client, une ligne « cliquer sur … → le champ … s'ouvre », en incluant les mots fantômes, le nom défilant des cas clients, la photo WebGL du hero, et les 3 contrôles « Studio refuse » (titre trop long, liste à nombre fixe, image sans alternative).
- [ ] **Step 3 :** exécuter la recette dans Presentation sur la preview et cocher chaque ligne ; consigner tout écart.
- [ ] **Step 4 :** `npm test && npx tsc --noEmit && npx eslint src` → OK.
- [ ] **Step 5 :** commit `docs(cms): recette de l'édition visuelle ; le site ne lit plus que Sanity`.

---

## Questions ouvertes (à trancher avant ou pendant l'exécution)

1. **Liste des secteurs des cas clients** : valeurs proposées dans la Tâche 5 (secteurs du menu + secteurs des cas actuels), à valider.

Tranché le 29/10 : le formulaire garde les six champs actuels (spec § 6.6) ; l'accueil est modélisé sur ses lames réelles (spec § 6.1 et § 9).
