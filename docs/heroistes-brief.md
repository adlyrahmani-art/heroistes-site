# Héroïstes — Brief projet & décisions (26/10/2026)

## Objectif
Concevoir et développer le site de l'agence marketing B2B **Héroïstes** (Grenoble · Paris), baseline « Héros du R.O.I ».
Le site doit offrir une **expérience immersive** inspirée des sites de référence : animations WebGL, transitions entre lames (sections), effets VHS / glitch.

## Sources
- Figma : https://www.figma.com/design/qQMP8pQvWzmPRcn6lVqcKg/Heroistes
  - Page 1 : moodboard, logo, typos, arborescence, maquette hero « Section1 - Option2 » (node 1:84)
  - Page « style guideline » (node 7:2) : logo, couleurs, typo, grille, composants, textures, motion, références
- Prototype WebGL du hero : https://claude.ai/artifact/DC14Ukd3AAqJNT9tyFgaMs
- Récapitulatif Excel : Heroistes_Style_Guideline.xlsx (9 onglets)

## Décisions validées
- Vocabulaire : une **lame** = une section pleine largeur du site.
- Interactions : **Drag to Spin** et **Click to Burst** (référence intframe.com).
- Technologie d'animation : **WebGL / Three.js** (particules, morphing en shaders GLSL).
- Morphing inspiré d'intframe.com : sphère de particules → constellation de la maquette Section1 - Option2 → symbole H (deux éclairs / lames du logo).
- Mouvements immersifs pour chaque lame et pour les transitions entre lames, inspirés des 7 références.
- Points du guideline validés : Gloock pour les titres display, DM Serif Display pour wordmark / éditorial, Onest pour l'UI et le texte, Space Mono pour les labels techniques.

## Stack recommandée
Next.js · Three.js / React Three Fiber · shaders GLSL · GSAP ScrollTrigger · Lenis (smooth scroll).
Fallback mobile allégé + respect de prefers-reduced-motion.

## Design tokens
- Couleurs : Turquoise #11E3C7 · Turquoise profond #10C5AD · Encre #1F1F1F · Noir #0E0E0E · Anthracite #222222 · Graphite #343434 · Acier #5E5D5D · Gris clair #CFCFCF · Blanc #FFFFFF
- Proportions : 70 % noir / 20 % blanc-gris / 10 % turquoise. Jamais de texte blanc sur turquoise.
- Typo : H1 Gloock 128/113 maj. · H2 Gloock 90/96 · H3 Gloock 56/60 · H4 DM Serif 36/44 · Body Onest 18/30 · Bouton Onest Black 12 maj. +5 % · Nav Onest Bold 12 maj. + n° 10 px turquoise
- Grille : 12 col (marges 40, gouttière 24) · 8 col tablette · 4 col mobile · espacements base 8 · rayons 0 (sauf icône d'app 20 px)
- Motion : 150 / 300 / 600 / 900 ms · révélations cubic-bezier(0.16,1,0.3,1) · overlays cubic-bezier(0.76,0,0.24,1) · stagger 60 ms

## Arborescence
01 Accueil · 02 Expertises (Développement commercial, Branding & contenu, Digital experience, Acquisition & performance) · 03 Conseil · 04 Cas clients · 05 Secteurs · 06 L'agence · 07 Blog · 08 Contact

## Références retenues (section → site)
- Intro / loader → intframe.com (particules, mot en contour qui se remplit, bascule plein écran)
- Accueil, scrolljacking → m-n.fr (intro avec flèche, écran partagé révélé au survol)
- Menu, footer, à propos → vintage.agency (menu plein écran, « MENU » géant en glitch, entrées numérotées)
- Expertises & avis → grenark.framer.website (cartes empilées sticky, carrousel d'avis)
- Header / hero → kaelorian.framer.website (titre géant coupé, portrait plein cadre)
- Cas clients & chiffres → mattis.framer.website (titres massifs, chiffres clés, FAQ accordéon)
- Menu overlay → citadellegin.com (vérification d'âge, voir capture du moodboard)

## Contraintes connues
- Accès Figma via MCP : le siège « View » est limité à 20 appels/mois (quota atteint le 26/10). Un siège Dev ou Full dans la Nis-Héroistes Team (plan Professional) donne 200 appels/jour.

## Prochaines étapes
1. Créer la page « Design » dans Figma et y placer le storyboard de l'accueil (une vignette par lame + annotations motion), puis les maquettes HD desktop et mobile.
2. Initialiser le projet Next.js et porter le prototype WebGL en React Three Fiber.
3. Remplacer les éclairs approximés par les tracés exacts du logo (vectors 1:32 et 1:33).
4. Développer les lames une par une, en commençant par l'accueil.
