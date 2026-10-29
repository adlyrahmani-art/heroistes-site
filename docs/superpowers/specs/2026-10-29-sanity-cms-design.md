# Héroïstes — Intégration CMS headless Sanity

- **Date** : 2026-10-29
- **Statut** : design validé
- **Source** : doc « Héroïstes — Intégration CMS headless Sanity » (https://claude.ai/artifact/QmdNgBWtN4k7qAaNv9FmfK). Cette spec reprend ses décisions sans les modifier ; la section « Écarts constatés avec le code actuel », en fin de document, est un ajout factuel pour préparer le plan d'implémentation.

## 1. Objectif

Le client doit modifier ses contenus en autonomie dans Sanity, sans pouvoir casser les animations, et le site doit rester rapide.

## 2. Exigences exprimées

- **CMS** : Sanity. Le site Next.js est versionné sur Git et hébergé sur Vercel.
- **Périmètre** : le client modifie les textes et images de toutes les lames, et il peut créer ou supprimer des articles de blog et des cas clients.
- **Langues** : français au lancement, avec une structure prête pour l'anglais plus tard.
- **Édition** : édition visuelle. Le client voit le vrai site avec ses brouillons, clique sur un texte pour l'éditer, puis publie.
- **Titres-signatures** : modifiables, avec des limites de caractères et un contrôle des retours à la ligne.

## 3. Hypothèses retenues

- La structure des pages et l'ordre des lames restent dans le code.
- Le client n'a pas besoin de rôles différents ni de circuit de validation.
- Le formulaire de contact est géré dans Sanity (décision du 29/10, voir § 6.6).

## 4. Le piège spécifique au site

Les textes rendus en WebGL et les titres géants devront être nettoyés avant affichage, puis rendus cliquables autrement. C'est à prévoir dès la spec.

L'édition visuelle de Sanity cache des caractères invisibles dans les textes (stega). C'est ce qui permet au clic sur le site d'ouvrir le bon champ du Studio. Ces caractères posent problème à deux endroits :

- **Textes rendus en WebGL** : le canvas n'est pas du HTML cliquable, et les caractères cachés peuvent fausser le rendu des lettres.
- **Calculs de découpe des titres géants** : la longueur mesurée du texte devient fausse.

**Parade** : nettoyer ces textes avant de les passer au canvas ou au calcul de découpe. Une zone HTML invisible posée au-dessus du canvas garde le clic vers le bon champ.

## 5. Architecture retenue

**Approche 1 — Studio intégré au repo Next.js, sur `/studio`** (par exemple `heroistes.fr/studio`).

- Un seul repo et un seul déploiement Vercel.
- Le Studio et l'aperçu partagent le domaine, ce qui simplifie l'édition visuelle.
- Les contenus publiés arrivent quasi instantanément, sans rebuild.
- C'est l'approche la plus documentée pour Next.js.
- Inconvénient : le projet s'alourdit un peu, mais le Studio n'est chargé que sur `/studio`.
- L'approche reste réversible : le Studio pourra être séparé plus tard si le besoin apparaît.

Approches écartées :

| Approche | Principe | Raison de l'écarter |
|---|---|---|
| 2. Studio séparé, hébergé par Sanity | Deux projets distincts : le site et le Studio | Édition visuelle plus lourde à configurer entre deux domaines ; deux déploiements à suivre |
| 3. Monorepo, deux applications | Un seul repo, deux applications (site et Studio) | Surdimensionnée pour un site vitrine avec un seul client éditeur |

## 6. Modèle de contenu (validé le 29/10)

Le Studio contient des pages uniques non supprimables, deux collections (blog et cas clients) et des briques réutilisables avec garde-fous.

### 6.1 Pages uniques

Équivalent des pages d'options ACF : modifiables, ni créées ni supprimées.

| Document | Contenu |
|---|---|
| Réglages du site | Menu (libellés), footer, coordonnées Grenoble et Paris, réseaux sociaux, SEO par défaut |
| Accueil | Un groupe de champs par lame : hero, intro, aperçu des expertises, chiffres clés, avis, appel à l'action |
| Conseil, Secteurs, L'agence, Contact | Un groupe de champs par lame |
| Expertise × 4 | Développement commercial, Branding & contenu, Digital experience, Acquisition & performance (4 documents fixes) |
| Formulaire de contact | Textes, adresse de réception et choix parmi des champs prévus |

### 6.2 Collections

Équivalent des CPT : seuls contenus que le client crée et supprime.

- **Article de blog** : titre, slug, date, extrait, image de couverture, texte riche, SEO.
- **Cas client** : titre, slug, nom du client, secteur (liste), chiffres clés, image, texte riche, SEO.

### 6.3 Briques réutilisables

- **Titre-signature** : saisi ligne par ligne, avec un nombre de lignes et un nombre de caractères par ligne maximum, réglés par lame (exemple : hero limité à 3 lignes de 12 caractères). Le Studio refuse un titre qui dépasse.
- **Image** : texte alternatif obligatoire et point focal réglable.
- **Bouton** : libellé et lien.
- **SEO** : titre, description, image de partage.

### 6.4 Listes à nombre fixe

Les chiffres clés, les avis et la FAQ ont un nombre d'éléments imposé dans le code. Le client modifie leur contenu, pas leur nombre.

### 6.5 Anglais plus tard

Chaque document porte une langue (`fr` par défaut, masquée). La version EN viendra comme un document lié à chaque document FR, sans restructurer les données.

### 6.6 Formulaire de contact (option B)

- Le client modifie les libellés, les textes d'aide, le bouton, les messages de confirmation et d'erreur, et l'adresse qui reçoit les demandes.
- Il affiche ou masque des champs prévus (Téléphone, Entreprise, Budget, Expertise concernée) et les rend obligatoires ou non.
- Nom, e-mail et message restent toujours affichés et obligatoires. Il ne peut pas créer de nouveau champ.

## 7. Édition visuelle et publication (validé le 29/10)

Le client édite sur le vrai site dans un écran partagé, et une publication met le site à jour en quelques secondes sans redéploiement.

- **Accès** : Studio sur `heroistes.fr/studio`, compte Sanity du client invité avec le rôle Éditeur.
- **Aperçu** : le Studio affiche le site en mode brouillon (Draft Mode de Next.js, outil Presentation de Sanity), réservé aux personnes connectées. Le client clique sur un texte et le bon champ s'ouvre.
- **Caractères invisibles** : ajoutés uniquement en mode brouillon ; les visiteurs reçoivent des textes propres.
- **WebGL et titres-signatures** : les textes sont nettoyés avant le canvas et les calculs de découpe. Une zone HTML invisible posée dessus garde le clic. Le tout passe par un seul utilitaire partagé par toutes les lames.
- **Publication** : le site public se rafraîchit en quelques secondes, uniquement sur les pages concernées. Les déploiements Vercel restent réservés au code.
- **Images** : servies par le CDN de Sanity, redimensionnées et recadrées selon le point focal.
- **Aperçu et performances** : le WebGL reste complet dans l'aperçu. Un mode allégé ne sera ajouté qu'en cas de lenteur constatée.

## 8. Formulaire, erreurs et tests (validé le 29/10)

Chaque demande de contact part par e-mail et reste enregistrée dans Sanity ; le site continue de tourner même si Sanity est indisponible.

### 8.1 Envoi du formulaire

- Traitement côté serveur par Next.js sur Vercel, sans service tiers de formulaires.
- E-mail via un service d'envoi transactionnel (par exemple Resend), vers l'adresse définie dans Sanity.
- Copie de chaque demande enregistrée dans Sanity comme document « Demande de contact », en lecture seule pour le client.
- Anti-spam : champ piège invisible et limite d'envois par adresse IP. Captcha (Cloudflare Turnstile) seulement si le spam devient un problème.
- Validation côté serveur selon les champs activés et obligatoires.

### 8.2 Gestion des erreurs

- **Contenu incomplet** : champs indispensables obligatoires dans le Studio, donc pas de publication d'une lame à moitié vide.
- **Sanity indisponible** : le site sert la dernière version en cache.
- **Synchronisation** : types TypeScript générés depuis le modèle Sanity ; un écart entre code et modèle bloque la compilation.
- **Échec d'envoi** : le visiteur voit le message d'erreur défini par le client, et la demande reste enregistrée dans Sanity.

### 8.3 Tests

- **Unitaires** : validation des titres-signatures, utilitaire de nettoyage des textes WebGL, validation du formulaire selon les champs activés.
- **Bout en bout** (Playwright, sur les déploiements de prévisualisation Vercel) : accueil, article de blog, cas client, formulaire (succès et erreur), chargement du Studio.
- **Recette manuelle** : le clic sur chaque lame ouvre le bon champ, y compris pour les textes WebGL.

## 9. Écarts constatés avec le code actuel (ajout, sans changement de décision)

Relevés dans le repo `heroistes-site` au 29/10/2026, pour que le plan les traite explicitement. Les décisions ci-dessus s'appliquent ; seule leur traduction dans le code reste à préciser.

1. **Rendu 3D** : `@react-three/fiber` figure dans les dépendances, mais les scènes sont écrites directement en three.js (`src/components/home/HeroImage.tsx`, `src/components/LogoSmoke3D.tsx`).
2. **Textes en WebGL** : aucune lame ne rend aujourd'hui de texte dans un canvas (pas de lame « intro » ni de « morphing »). Les canvas affichent la photo du hero et le symbole en particules. Les textes sensibles aux caractères invisibles sont les titres découpés ligne par ligne en HTML (masques `.ln`), les mots animés (`WaveWord`, masque SVG), le texte défilant des cas clients et les caractères mesurés par le curseur. L'utilitaire de nettoyage partagé (§ 7) s'applique à ces cas, et à tout texte WebGL futur.
3. **Lames de l'accueil** : le code comporte, dans l'ordre : hero, Nos engagements (×4), bandeau de logos, Vos besoins (accordéon ×6), Expertises (titre, présentation, 6 cartes), Pourquoi choisir (3 raisons), Du plan aux résultats (2 étapes), Nos cas clients (intro + 3 cas), Blog (4 articles), FAQ (×5), titre et footer « Démarrez votre projet ». La liste du § 6.1 (« hero, intro, aperçu des expertises, chiffres clés, avis, appel à l'action ») est à faire correspondre à ces lames.
4. **Pages** : seule la page d'accueil existe. Conseil, Secteurs, L'agence, Contact, les 4 pages Expertise, le blog et les cas clients n'ont pas encore de route ni de maquette.
5. **Contenus** : les textes de l'accueil sont aujourd'hui dans `src/content/accueil.ts` et l'arborescence du menu dans `src/content/navigation.ts`. Ils serviront de contenu initial à importer dans Sanity.
6. **Formulaire** : le footer contient déjà un formulaire de contact et un formulaire newsletter, non branchés. La newsletter n'est pas couverte par le doc.
7. **Domaine** : le site est déployé sur `heroistes.uxtreampro.com` (préproduction) ; `heroistes.fr` est le domaine cible.
8. **Tests** : aucun outil de test n'est installé (ni test unitaire, ni Playwright).
