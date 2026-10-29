# Héroïstes — Intégration CMS headless Sanity

- **Date** : 2026-10-29 (corrigée le même jour, voir § 9)
- **Statut** : design validé
- **Source** : doc « Héroïstes — Intégration CMS headless Sanity » (https://claude.ai/artifact/QmdNgBWtN4k7qAaNv9FmfK), rédigé hors du repo. Cette spec en reprend les décisions et corrige, à la demande d'Adly, les points qui ne correspondaient pas au site réel (liste en § 9).

## 1. Objectif

Le client doit modifier ses contenus en autonomie dans Sanity, sans pouvoir casser les animations, et le site doit rester rapide.

## 2. Contexte technique

- Site Next.js 16 (App Router), versionné sur Git et hébergé sur Vercel ; préproduction sur `heroistes.uxtreampro.com`, domaine cible `heroistes.com`.
- Animations : GSAP / ScrollTrigger, Lenis, et deux scènes three.js écrites directement (photo du hero, symbole en particules). `@react-three/fiber` est installé mais n'est pas utilisé.
- Les contenus de l'accueil sont aujourd'hui dans `src/content/accueil.ts`, l'arborescence du menu dans `src/content/navigation.ts`. Seule la page d'accueil existe.

## 3. Exigences

- **CMS** : Sanity.
- **Périmètre** : le client modifie les textes et images de toutes les lames, et il peut créer ou supprimer des articles de blog et des cas clients.
- **Langues** : français au lancement, avec une structure prête pour l'anglais plus tard.
- **Édition** : édition visuelle. Le client voit le vrai site avec ses brouillons, clique sur un texte pour l'éditer, puis publie.
- **Titres-signatures** : modifiables, avec des limites de caractères et un contrôle des retours à la ligne.

Hypothèses retenues :

- La structure des pages et l'ordre des lames restent dans le code.
- Le client n'a pas besoin de rôles différents ni de circuit de validation.
- Le formulaire de contact est géré dans Sanity (§ 6.6).

## 4. Le piège spécifique au site

L'édition visuelle de Sanity cache des caractères invisibles dans les textes (stega). C'est ce qui permet au clic sur le site d'ouvrir le bon champ du Studio. Ces caractères posent problème partout où un texte n'est pas simplement affiché en HTML :

- **Texte dessiné ou mesuré** : les mots géants animés (« GLOBALE », « B2B »… ; composant `WaveWord`, masque SVG), le texte mesuré par le curseur, et tout texte rendu à l'avenir dans un canvas WebGL. Aucun texte n'est aujourd'hui dessiné dans un canvas.
- **Texte dupliqué ou masqué** : le nom du client qui défile dans les cas clients, répété et masqué aux lecteurs d'écran.
- **Valeurs techniques** : liens, adresses e-mail, identifiants, textes alternatifs, URL d'images, métadonnées.

**Parade** : nettoyer ces valeurs avant de les dessiner, de les mesurer ou de les placer dans un attribut. Quand un texte nettoyé est affiché, l'élément HTML qui le porte reçoit l'attribut d'édition de Sanity, ce qui garde le clic vers le bon champ. Un seul utilitaire partagé fait ce travail pour toutes les lames.

## 5. Architecture retenue

**Studio intégré au repo Next.js, sur `/studio`** (par exemple `heroistes.com/studio`).

- Un seul repo et un seul déploiement Vercel.
- Le Studio et l'aperçu partagent le domaine, ce qui simplifie l'édition visuelle.
- Les contenus publiés arrivent quasi instantanément, sans rebuild.
- Le Studio n'est chargé que sur `/studio`, sans le défilement Lenis ni le curseur du site.
- L'approche reste réversible : le Studio pourra être séparé plus tard si le besoin apparaît.

Approches écartées :

| Approche | Principe | Raison de l'écarter |
|---|---|---|
| Studio séparé, hébergé par Sanity | Deux projets distincts : le site et le Studio | Édition visuelle plus lourde à configurer entre deux domaines ; deux déploiements à suivre |
| Monorepo, deux applications | Un seul repo, deux applications (site et Studio) | Surdimensionnée pour un site vitrine avec un seul client éditeur |

## 6. Modèle de contenu (validé le 29/10)

Le Studio contient des pages uniques non supprimables, deux collections (blog et cas clients) et des briques réutilisables avec garde-fous.

### 6.1 Pages uniques

Équivalent des pages d'options ACF : modifiables, ni créées ni supprimées.

| Document | Contenu |
|---|---|
| Réglages du site | Libellés du menu, bouton du header, footer (visuel, signature, newsletter, copyright, e-mail), coordonnées Grenoble et Paris, réseaux sociaux, SEO par défaut |
| Accueil | Un groupe de champs par lame, dans l'ordre du site : hero ; Nos engagements (titre + 4 engagements) ; bandeau de logos ; Vos besoins (6 situations) ; Expertises (titre, présentation, 6 cartes) ; Pourquoi choisir (3 raisons) ; Du plan aux résultats (2 étapes) ; Nos cas clients (intro + 3 cas mis en avant) ; Blog (titre, bouton) ; FAQ (5 questions) ; titre « Votre prochaine étape » avant le footer |
| Formulaire de contact | Titre et texte d'introduction, libellés et textes d'exemple des champs, bouton, messages, mention RGPD, adresse de réception (§ 6.6) |
| Conseil, Secteurs, L'agence, Contact, Expertise × 4 | Un groupe de champs par lame. **À modéliser quand leurs maquettes existeront** : ces pages n'ont encore ni route ni maquette |

### 6.2 Collections

Équivalent des CPT : seuls contenus que le client crée et supprime.

- **Article de blog** : titre, slug, date, extrait, image de couverture, texte riche, SEO. Les 4 derniers articles remontent automatiquement sur l'accueil.
- **Cas client** : titre, slug, nom du client, secteur (liste), chiffres clés, image, texte riche, SEO, et les éléments qu'affiche la carte de l'accueil (étiquette d'expertise, question, fond flouté, logo, puces).

### 6.3 Briques réutilisables

- **Titre-signature** : saisi ligne par ligne, avec un nombre de lignes et un nombre de caractères par ligne maximum, réglés par lame et calés sur les titres actuels (exemple : titre du hero limité à 2 lignes de 14 caractères). Le Studio refuse un titre qui dépasse.
- **Image** : texte alternatif obligatoire et point focal réglable.
- **Bouton** : libellé et lien.
- **SEO** : titre, description, image de partage.

### 6.4 Listes à nombre fixe

Les listes dont la mise en page dépend du nombre d'éléments ont un nombre imposé dans le code : engagements (4), situations de Vos besoins (6), cartes Expertises (6), raisons de Pourquoi choisir (3), étapes de Du plan aux résultats (2), cas clients mis en avant (3), questions de la FAQ (5). Le client modifie leur contenu, pas leur nombre.

### 6.5 Anglais plus tard

Chaque document porte une langue (`fr` par défaut, masquée). La version EN viendra comme un document lié à chaque document FR, sans restructurer les données.

### 6.6 Formulaire de contact (option B, sur les champs actuels du site)

Le formulaire garde les six champs du site actuel (brief de contenu et maquette « Footer ») :

| Champ | Règle |
|---|---|
| Nom | Toujours affiché et obligatoire |
| Prénom | Toujours affiché et obligatoire |
| E-mail | Toujours affiché et obligatoire |
| Description du projet | Toujours affiché et obligatoire |
| Téléphone | Champ prévu : le client l'affiche ou le masque, et le rend obligatoire ou non (affiché et obligatoire par défaut, comme aujourd'hui) |
| Sujet | Champ prévu : même règle (affiché et obligatoire par défaut) |

- Le client modifie les libellés, les textes d'exemple, le bouton, les messages de confirmation et d'erreur, la mention RGPD et l'adresse qui reçoit les demandes.
- Il ne peut pas créer de nouveau champ.
- La newsletter du footer n'est pas couverte par cette spec.

## 7. Édition visuelle et publication (validé le 29/10)

Le client édite sur le vrai site dans un écran partagé, et une publication met le site à jour en quelques secondes sans redéploiement.

- **Accès** : Studio sur `/studio`, compte Sanity du client invité avec le rôle Éditeur.
- **Aperçu** : le Studio affiche le site en mode brouillon (Draft Mode de Next.js, outil Presentation de Sanity), réservé aux personnes connectées. Le client clique sur un texte et le bon champ s'ouvre.
- **Caractères invisibles** : ajoutés uniquement en mode brouillon ; les visiteurs reçoivent des textes propres.
- **Textes dessinés, mesurés ou en attribut** : nettoyés par l'utilitaire partagé ; l'élément affiché garde le clic vers le bon champ (§ 4).
- **Publication** : le site public se rafraîchit en quelques secondes, uniquement sur les pages concernées. Les déploiements Vercel restent réservés au code.
- **Images** : servies par le CDN de Sanity, redimensionnées et recadrées selon le point focal.
- **Aperçu et performances** : les scènes WebGL restent complètes dans l'aperçu. Un mode allégé ne sera ajouté qu'en cas de lenteur constatée.

## 8. Formulaire, erreurs et tests (validé le 29/10)

Chaque demande de contact part par e-mail et reste enregistrée dans Sanity ; le site continue de tourner même si Sanity est indisponible.

### 8.1 Envoi du formulaire

- Traitement côté serveur par Next.js sur Vercel, sans service tiers de formulaires.
- E-mail via un service d'envoi transactionnel (par exemple Resend), vers l'adresse définie dans Sanity.
- Copie de chaque demande enregistrée dans Sanity comme document « Demande de contact », en lecture seule pour le client.
- Anti-spam : champ piège invisible et limite d'envois par adresse IP. Captcha (Cloudflare Turnstile) seulement si le spam devient un problème.
- Validation côté serveur selon les champs affichés et obligatoires.

### 8.2 Gestion des erreurs

- **Contenu incomplet** : champs indispensables obligatoires dans le Studio, donc pas de publication d'une lame à moitié vide.
- **Sanity indisponible** : le site sert la dernière version en cache ; un envoi de formulaire part quand même par e-mail.
- **Synchronisation** : types TypeScript générés depuis le modèle Sanity ; un écart entre code et modèle bloque la compilation.
- **Échec d'envoi** : le visiteur voit le message d'erreur défini par le client, et la demande reste enregistrée dans Sanity.

### 8.3 Tests

- **Unitaires** : validation des titres-signatures, utilitaire de nettoyage, validation du formulaire selon les champs affichés.
- **Bout en bout** (Playwright, sur les déploiements de prévisualisation Vercel) : accueil, article de blog, cas client, formulaire (succès et erreur), chargement du Studio.
- **Recette manuelle** : le clic sur chaque lame ouvre le bon champ, y compris pour les mots géants animés et le nom défilant des cas clients.

## 9. Corrections apportées au doc d'origine

| Doc d'origine | Correction | Raison |
|---|---|---|
| Site « Next.js + React Three Fiber » | three.js écrit directement ; R3F installé mais inutilisé | État du code |
| Textes rendus en WebGL (« intro, morphing ») | Aucun texte dans un canvas ; le piège concerne les textes dessinés en SVG, mesurés, dupliqués ou en attribut | Ces lames n'existent pas sur le site |
| Accueil : « hero, intro, aperçu des expertises, chiffres clés, avis, appel à l'action » | Les 11 lames réelles de l'accueil (§ 6.1) | Lames du site construit |
| Listes à nombre fixe : « chiffres clés, avis, FAQ » | Engagements, Vos besoins, cartes Expertises, raisons, étapes, cas mis en avant, FAQ (§ 6.4) | Pas de chiffres clés ni d'avis sur l'accueil ; le chiffre clé d'Isère Habitat est porté par le cas client |
| Formulaire : Nom, e-mail, message + Téléphone, Entreprise, Budget, Expertise concernée | Les six champs actuels : Nom, Prénom, E-mail, Description du projet + Téléphone et Sujet activables (§ 6.6) | Demande d'Adly : garder l'existant |
| Conseil, Secteurs, L'agence, Contact, Expertise × 4 modélisés d'emblée | À modéliser quand leurs maquettes existeront | Ni route ni maquette à ce jour |
| Exemple de titre « hero limité à 3 lignes de 12 caractères » | Limites calées sur les titres actuels (hero : 2 lignes de 14 caractères) | Le titre actuel du hero compte 13 caractères sur sa 2e ligne |
| Domaine `heroistes.fr` seul | Préproduction `heroistes.uxtreampro.com`, domaine cible `heroistes.com` | Déploiement actuel |
