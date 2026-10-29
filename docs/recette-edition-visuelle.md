# Recette de l'édition visuelle (Studio Sanity, Presentation)

## Avant de commencer

1. Ouvrir `/studio` sur la preview Vercel (ou en local), puis l'onglet **Presentation**.
2. Choisir le document à tester : **Accueil**, **Réglages**, **Formulaire de contact**, un **Article de blog** ou un **Cas client**.
3. Dans l'aperçu, survoler un texte ou une image : un cadre apparaît. Cliquer dessus ouvre le champ correspondant dans le panneau de droite.
4. Pour chaque ligne du tableau : cliquer, vérifier que le bon champ s'ouvre, modifier la valeur, constater le changement dans l'aperçu, puis noter l'écart éventuel dans « Résultat ». Ne pas publier les modifications de test (ou rétablir les valeurs d'origine).

Cocher la case une fois la ligne vérifiée. Le WebGL reste complet dans l'aperçu.

## 1. Page d'accueil (document « Accueil »)

| OK | Où cliquer | Champ attendu | Résultat |
|---|---|---|---|
| ☐ | Hero : petit texte au-dessus du titre | Hero → « Sur-titre » (3 lignes, 12 caractères) s'ouvre | |
| ☐ | Hero : grand titre | Hero → « Titre » (2 lignes, 14 caractères) s'ouvre | |
| ☐ | Hero : ligne sous le titre | Hero → « Sous-titre » s'ouvre | |
| ☐ | Hero : mot mis en avant | Hero → « Mot mis en avant » s'ouvre | |
| ☐ | Hero : paragraphe | Hero → « Texte » s'ouvre | |
| ☐ | Hero : bouton principal | Hero → « Bouton principal » (Libellé, Lien) s'ouvre | |
| ☐ | Hero : bouton secondaire | Hero → « Bouton secondaire » s'ouvre | |
| ☐ | Hero : photo WebGL (cliquer sur l'image animée) | Hero → « Image (photo WebGL) » s'ouvre ; après remplacement, la nouvelle photo apparaît dans l'effet WebGL, qui reste animé | |
| ☐ | Nos engagements : titre de la lame | « Titre des engagements » s'ouvre | |
| ☐ | Engagement : titre d'une carte | Engagements → (élément) → « Titre » s'ouvre | |
| ☐ | Engagement : mot géant en filigrane derrière le titre (mot fantôme) | Engagements → (élément) → « Mot en filigrane » s'ouvre (8 caractères) | |
| ☐ | Engagement : paragraphe | Engagements → (élément) → « Texte » s'ouvre | |
| ☐ | Engagement : image | Engagements → (élément) → « Image » s'ouvre | |
| ☐ | Engagement : alternance gauche / droite | Engagements → (élément) → « Côté du titre » s'ouvre | |
| ☐ | Bandeau de logos : phrase d'introduction | « Bandeau de logos » → « Texte » s'ouvre | |
| ☐ | Bandeau de logos : un logo | Bandeau de logos → « Logos clients » → logo cliqué s'ouvre (texte alternatif = nom du client) | |
| ☐ | Vos besoins : titre | « Vos besoins, nos solutions » → « Titre » s'ouvre | |
| ☐ | Vos besoins : introduction | « Introduction » s'ouvre | |
| ☐ | Vos besoins : titre d'une carte | Besoins → (élément) → « Titre » s'ouvre | |
| ☐ | Vos besoins : mention de l'offre | Besoins → (élément) → « Offre » s'ouvre | |
| ☐ | Vos besoins : lien d'une carte | Besoins → (élément) → « Lien » s'ouvre | |
| ☐ | Vos besoins : texte et image d'une carte | « Texte » puis « Image » de l'élément s'ouvrent | |
| ☐ | Expertises : grand titre | Expertises → « Titre » s'ouvre | |
| ☐ | Expertises : intitulé | Expertises → « Intitulé » s'ouvre | |
| ☐ | Expertises : introduction | Expertises → « Introduction » s'ouvre | |
| ☐ | Expertises : image centrale | Expertises → « Image » s'ouvre | |
| ☐ | Expertises : titre d'une carte | Cartes → (élément) → « Titre » s'ouvre | |
| ☐ | Expertises : phrase en gras d'une carte | Cartes → (élément) → « Première phrase (en gras) » s'ouvre | |
| ☐ | Expertises : texte et lien d'une carte | « Texte » puis « Lien (optionnel) » (Phrase avant le lien, Texte du lien, Adresse) s'ouvrent | |
| ☐ | Pourquoi choisir : titre | « Pourquoi une agence spécialisée » → « Titre » s'ouvre | |
| ☐ | Pourquoi choisir : introduction et conclusion | « Introduction » puis « Conclusion » s'ouvrent | |
| ☐ | Pourquoi choisir : titre, texte, image d'une réalité | Réalités → (élément) → « Titre », « Texte », « Image » s'ouvrent | |
| ☐ | Pourquoi choisir : bouton | « Bouton » s'ouvre | |
| ☐ | Du plan aux résultats : titre et sous-titre | « Titre » puis « Sous-titre » s'ouvrent | |
| ☐ | Du plan aux résultats : introduction | « Introduction » s'ouvre | |
| ☐ | Du plan aux résultats : titre, texte, image d'une étape | Étapes → (élément) → « Titre », « Texte », « Image » s'ouvrent | |
| ☐ | Du plan aux résultats : paragraphes de conclusion | « Conclusion » (2 paragraphes) s'ouvre | |
| ☐ | Du plan aux résultats : bouton | « Bouton » s'ouvre | |
| ☐ | Cas clients : titre de la lame | « Cas clients » → « Titre » s'ouvre | |
| ☐ | Cas clients : introduction et image | « Introduction » puis « Image » s'ouvrent | |
| ☐ | Cas clients : choix des trois cas à la une | « Cas clients à la une » s'ouvre (exactement 3 références) | |
| ☐ | Cas clients : nom du client qui défile (nom dupliqué en bandeau) | Cas client lié → « Nom du client » s'ouvre ; le nom change sur toutes les occurrences du texte défilant, sans saccade | |
| ☐ | Cas clients : photo, étiquette, question d'une carte | Cas client lié → « Photo de la carte », « Étiquette », « Question » s'ouvrent | |
| ☐ | Cas clients : bouton | « Bouton » s'ouvre | |
| ☐ | Blog : titre de la lame | « Blog » → « Titre » s'ouvre | |
| ☐ | Blog : bouton | « Bouton » s'ouvre | |
| ☐ | Blog : titre, résumé, couverture d'un article | Article de blog lié → « Titre », « Résumé », « Image de couverture » s'ouvrent | |
| ☐ | FAQ : titre | « FAQ » → « Titre » s'ouvre | |
| ☐ | FAQ : une question et sa réponse | Questions → (élément) → « Question » puis « Réponse » s'ouvrent | |
| ☐ | « Votre prochaine étape » : accroche | « Accroche avant le pied de page » → « Accroche » (2 lignes, 24 caractères) s'ouvre | |

## 2. En-tête et pied de page (document « Réglages »)

| OK | Où cliquer | Champ attendu | Résultat |
|---|---|---|---|
| ☐ | Header : un lien du menu (ex. « Cas clients ») | « Libellés du menu » → le libellé correspondant s'ouvre ; le menu se met à jour (bureau et mobile) | |
| ☐ | Header : bouton « Lancer un projet » | « Bouton de l’en-tête » (Libellé, Lien) s'ouvre | |
| ☐ | Footer : visuel | Pied de page → « Visuel » s'ouvre (texte alternatif et point focal réglables) | |
| ☐ | Footer : signature sous « Héroïstes » | Pied de page → « Signature » s'ouvre | |
| ☐ | Footer : titre de la newsletter | Pied de page → « Titre newsletter » s'ouvre | |
| ☐ | Footer : texte de la newsletter | Pied de page → « Texte newsletter » s'ouvre | |
| ☐ | Footer : ligne de copyright | Pied de page → « Copyright » s'ouvre | |
| ☐ | Footer : adresse e-mail | Pied de page → « E-mail » s'ouvre ; le lien `mailto:` suit | |
| ☐ | Footer : lien LinkedIn | « Réseaux sociaux » → « LinkedIn » s'ouvre | |

## 3. Formulaire de contact (document « Formulaire de contact »)

| OK | Où cliquer | Champ attendu | Résultat |
|---|---|---|---|
| ☐ | Titre « Démarrez votre projet » | « Titre » (2 lignes, 13 caractères) s'ouvre | |
| ☐ | Texte d'introduction | « Introduction » s'ouvre | |
| ☐ | Libellé ou exemple du champ Nom | « Champ Nom » → « Libellé » / « Texte d’exemple » s'ouvre | |
| ☐ | Libellé ou exemple du champ Prénom | « Champ Prénom » s'ouvre | |
| ☐ | Libellé ou exemple du champ E-mail | « Champ E-mail » s'ouvre | |
| ☐ | Libellé ou exemple du champ Téléphone | « Champ Téléphone » s'ouvre ; décocher « Afficher ce champ » le fait disparaître, « Champ obligatoire » retire l'astérisque | |
| ☐ | Libellé ou exemple du champ Sujet | « Champ Sujet » s'ouvre (mêmes options que Téléphone) | |
| ☐ | Libellé ou exemple du champ Description du projet | « Champ Description du projet » s'ouvre | |
| ☐ | Bouton d'envoi | « Libellé du bouton d’envoi » s'ouvre | |
| ☐ | Mention de confidentialité et son lien | « Mention de confidentialité » puis « Lien de confidentialité » s'ouvrent | |

## 4. Page d'un article de blog (document « Article de blog »)

| OK | Où cliquer | Champ attendu | Résultat |
|---|---|---|---|
| ☐ | Titre de l'article | « Titre » s'ouvre | |
| ☐ | Date | « Date de publication » s'ouvre | |
| ☐ | Image de couverture | « Image de couverture » s'ouvre | |
| ☐ | Résumé | « Résumé » s'ouvre | |
| ☐ | Corps du texte (paragraphe, titre intermédiaire, image) | « Contenu » s'ouvre sur le bloc cliqué | |

## 5. Page d'un cas client (document « Cas client »)

| OK | Où cliquer | Champ attendu | Résultat |
|---|---|---|---|
| ☐ | Titre | « Titre » s'ouvre | |
| ☐ | Nom du client | « Nom du client » s'ouvre | |
| ☐ | Secteur | « Secteur » s'ouvre (menu déroulant) | |
| ☐ | Chiffres clés | « Chiffres clés » → « Résultat » / « Détail » s'ouvrent (3 maximum) | |
| ☐ | Logo | « Logo » s'ouvre ; « Taille du logo » (60 à 200) modifie la taille | |
| ☐ | Fond flouté | « Fond flouté » s'ouvre | |
| ☐ | Points forts | « Points forts » s'ouvre (1 à 5 lignes) | |
| ☐ | Corps du texte | « Contenu » s'ouvre | |

## 6. Contrôles « Studio refuse »

Le Studio doit bloquer la publication et afficher le message exact. Rétablir la valeur d'origine après chaque test.

| OK | Manipulation | Message attendu | Résultat |
|---|---|---|---|
| ☐ | Accueil → Hero → « Titre » : saisir plus de 14 caractères sur une ligne (ex. « Une ligne vraiment trop longue ») | « Ligne 1 : 30 caractères, 14 maximum. » (le nombre varie selon la saisie) ; en ajoutant une 3e ligne : « 2 lignes maximum (3 saisies). » | |
| ☐ | Accueil → Engagements : supprimer un élément (ou en ajouter un) | « Cette liste doit contenir exactement 4 éléments. » (6 pour Besoins et Cartes, 3 pour Réalités, 2 pour Étapes, 5 pour Questions, 3 pour « Cas clients à la une ») | |
| ☐ | Accueil → Engagements → « Image » : choisir une image sans remplir « Texte alternatif » | « Texte alternatif obligatoire. » | |
