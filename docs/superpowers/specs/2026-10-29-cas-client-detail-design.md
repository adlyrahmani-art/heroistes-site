# Page détail « Cas client » — conception

Maquette : `ressources/Page-Cas 1 _ Pranéo détails.png` (1920 × 5462, bureau seulement).
Images : `ressources/Page-Cas 1 _ Pranéo détails-header bg.png` (1920 × 883), `…-image1.png` (1325 × 476), `…-image2.png` (630 × 476), `…-image3.png` (663 × 476).

Décisions (29/10, avec l'utilisateur) :
- Le contenu vient de Sanity : un seul gabarit pour les 3 cas (Pranéo, Isère Habitat, Rezo Partage), seul le contenu change.
- Pas de maquette mobile : adaptation en une colonne, même logique que l'accueil.
- Remplace le gabarit provisoire de la Tâche 12 pour `/cas-clients/[slug]` (les articles de blog gardent le leur).

## Structure de la page (de haut en bas)

1. **En-tête sombre**, plein écran en largeur, hauteur 883/1920 de la largeur au bureau. Image de fond (`detailHero.background`) en niveaux de gris, assombrie. Trait vertical fin au centre (comme l'accueil). Colonne de droite, à partir du centre + ~30 px :
   - logo du client dans un disque gris (~120 px) ;
   - nom du client en police display, capitales (~100 px) ;
   - sous-titre en police display (2 lignes, ~40 px) ;
   - introduction (texte courant ~17 px / 24 px, blanc, **gras** autorisé) ;
   - points forts en turquoise gras, préfixés « · » (réutilise `highlights`).
   Texte blanc sur fond sombre ; jamais de blanc sur turquoise.
2. **Introduction** (fond clair `--fond-clair`) : colonne de gauche à x≈291/1920, titre sans-serif gras (~34 px, 2 lignes), texte ; puis grande image centrée (1325 × 476 à 1920).
3. **Notre défi**, aligné à droite sur la colonne de droite : titre display en capitales (~60 px), accroche en gras (petit), texte aligné à droite (**gras** autorisé).
4. **Chapitres** (liste, 1 à 5) — chacun :
   - éclair turquoise (composant `Bolt` existant), puis très grand titre display en capitales sur 2–3 lignes (~150 px à 1920) qui traverse le trait central ;
   - blocs texte (titre sans-serif gras + texte avec **gras**) ; un bloc sans titre est permis ;
   - image optionnelle avec côté `gauche` ou `droite` : image à droite → blocs à gauche ; image à gauche → blocs à droite, texte aligné à droite ; pas d'image → blocs à gauche.
5. Footer du site (SiteFooter, ton clair) comme sur les autres pages détail.

Trait vertical central fin visible sur les sections claires (comme la maquette).

## Modèle Sanity (`caseStudy`, nouveau groupe « Page détail »)

- `detailHero` { `background` (imageWithAlt), `subtitle` (titre-signature, 2 lignes max), `intro` (texte, **gras**) } — le logo, le nom et les points forts existants sont réutilisés.
- `detailIntro` { `title` (titre-signature 2 lignes), `text` (texte, **gras**), `image` (imageWithAlt) }.
- `challenge` { `title` (texte court, défaut « Notre défi »), `lead` (texte court), `text` (texte, **gras**) }.
- `chapters` : tableau 1–5 de { `title` (titre-signature, 3 lignes max), `blocks` (1–3 × { `title` optionnel, `text` }), `image` (imageWithAlt optionnel), `imageSide` (`left` | `right`, défaut `right`) }.
- Tous optionnels au niveau du document (les deux autres cas n'ont pas encore leur contenu) ; si `chapters` est vide, la page affiche ce qui existe sans casser.

## Règles conservées
- `clean()` sur toute valeur non affichée ; texte affiché brut ; `data-sanity` via `editAttr` sur les images.
- `imageUrl(image, w, h)` avec les deux dimensions pour les ratios fixes (point focal).
- Page pré-rendue (`generateStaticParams`), mise à jour en direct par SanityLive.
- Contenu Pranéo importé dans Sanity à partir de la maquette (transcription fidèle du texte, images téléversées) par un script idempotent qui ne touche qu'aux nouveaux champs du document `caseStudy-praneo` (patch `set`, pas `createOrReplace`).

## Mobile (< 768 px)
Une colonne, gouttière `--gut` ; titres display réduits (nom ~56 px, chapitres ~44 px) ; trait central masqué ; blocs et images empilés dans l'ordre de lecture (titre → blocs → image) ; aucun défilement horizontal.
