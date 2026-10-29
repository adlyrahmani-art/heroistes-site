# Task 6 report

Built `scripts/seed-sanity.ts` (run: `npx sanity exec scripts/seed-sanity.ts`). Token from `.env.local` via `process.loadEnvFile`; French error and exit 1 if missing. Token never printed.

- Documents (10, all `language: "fr"`, published ids): homePage, siteSettings, contactForm, caseStudy.{praneo,rezo-partage,isere-habitat}, blogPost.{4 slugs from hrefs}.
- One transaction: createOrReplace for each + delete of `drafts.<id>`.
- Images uploaded with `client.assets.upload` (content-hash dedupe) + in-memory Map; 39 images.
- Required fields: filled every field per schema; line/length limits checked against signatureTitle rules; optional expertise `text` omitted when empty; Isere Habitat gets keyFigures; sectors: Praneo=Bien-etre, Rezo Partage=Associatif, Isere Habitat=Promotion immobiliere. Invented values (not in source): hero image = hero-bg.jpg with generic alt, engagementsTitle "Nos engagements", headerCta "Lancer un projet" -> #contact (from Header.tsx), alts for besoin images (= title) and expertises image, case study/blog body = single block with title/question, case title "<name> : <question>", blog publishedAt 2026-10-27.
- Two runs: after run 1 and run 2, `count(*[!(_id in path("_.**"))])` = 49, imageAsset = 39, drafts = 0. Equal.
- Validation: `sanity documents validate` needs login (failed: "You must login first"). Instead ran a temporary script using `@sanity/validation` validateDocument with `createSchema` from the project schema (including custom rules) on all 10 docs: 0 errors, 0 warnings, all "passed". Temp script deleted.
- Deviations: as per rulings (token, no cache file, validation substitute).

## Fix round 1
- Ids now hyphenated (`caseStudy-<slug>`, `blogPost-<slug>`); homePage `_ref`s updated. The same transaction deletes the old dotted ids and their drafts.
- French header comment: initial import only. Guard: if `homePage` exists the script stops (exit code 1) unless `-- --force` (args reach the script via process.argv under sanity exec). Used exitCode+return instead of process.exit to avoid a Windows libuv assertion crash.
- Background alt is now `Fond de la page <name>`.
- Ran without --force: stopped cleanly with the French message. Ran with --force: 10 documents, 39 images.
- After: dotted ids = 0, non-system docs = 49, images = 39, drafts = 0, ids are the 7 hyphenated ones. @sanity/validation on 10 docs: 0 errors.
