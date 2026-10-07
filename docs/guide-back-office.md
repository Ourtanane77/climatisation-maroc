# Guide du back-office

Ce guide s'adresse à l'équipe d'Ariha Froid qui gère la boutique Climatisation Maroc au
quotidien : produits, commandes, demandes, revendeurs et contenus.

## Connexion

- Adresse : `https://climatisationmaroc.com/admin` (en développement : `http://localhost:8080/admin`).
- Saisissez votre e-mail et votre mot de passe, puis « Connexion ».
- Deux profils existent :
  - **Administrateur** : accès complet, y compris Réglages, Redirections et Utilisateurs ;
  - **Gestionnaire** : catalogue, ventes et contenus, sans ces trois écrans.
- Le menu de gauche est rangé en quatre groupes : **Catalogue**, **Ventes**, **Contenu**,
  **Configuration**. Un chiffre à côté d'un menu signale des éléments à traiter (produits à
  vérifier, nouvelles demandes…).

Les modifications enregistrées apparaissent sur le site en quelques secondes.

## Produits et variantes

Un **produit** est une famille (par exemple « LG Dual Inverter ») ; ses **variantes** sont les
références vendues (9 000, 12 000, 18 000 et 24 000 BTU), chacune avec sa référence (SKU), son
prix et son stock. Un produit simple a une seule variante.

**Catalogue › Produits** affiche la liste, avec recherche, filtres (catégorie, marque, publié,
promo, « À vérifier ») et import/export CSV. La fiche d'un produit est organisée en onglets :

| Onglet | Contenu |
|---|---|
| Général | famille, catégorie, marque, description courte et description, technologie, fluide, connectivité, « Nouveauté », « Mis en avant », « Publié », mots-clés de recherche, fiche technique (PDF) |
| Variantes | une ligne par référence : référence (SKU), libellé, puissance (BTU), couleur, prix normal, prix promotion, prix revendeur, stock, ordre |
| Images | photos (avec texte alternatif), éventuellement liées à une variante |
| Caractéristiques | lignes « libellé / valeur » du tableau technique ; une ligne de variante remplace celle de la famille |
| Points forts | les avantages affichés sous le titre (texte et icône) |
| Pour l'installation | accessoires proposés avec le produit (kit cuivre, support…) |
| FAQ | questions et réponses de la fiche |
| SEO | titre et description pour Google |

Le bouton « Voir sur le site » ouvre la fiche publique.

### Prix

- **Prix normal** : le prix public de référence.
- **Prix promotion** : s'il est renseigné et inférieur au prix normal, c'est le prix de vente ;
  le site affiche alors le prix barré et le badge de remise (« −13 % »).
- **Prix revendeur** : visible uniquement par les revendeurs validés et connectés, jamais par le
  public. Il n'est jamais appliqué s'il dépasse le prix de vente public.
- Les prix se saisissent en dirhams (par exemple `5700` ou `3,50`).
- Action groupée « Appliquer une remise (%) » : cochez des produits dans la liste, choisissez
  l'action et le pourcentage ; le prix promotion de toutes leurs variantes est calculé à partir
  du prix normal. Saisissez 0 pour retirer la promotion.

### Stock

« En stock », « Rupture » ou « Sur commande ». En rupture, la fiche affiche un formulaire
« Prévenez-moi » : les demandes arrivent dans **Ventes › Demandes** (type Alerte stock).

### Filtre « À vérifier »

Certains produits viennent du design et non de l'ancien catalogue, ou présentent une référence
ou un prix douteux. Ils sont marqués **À vérifier**, avec une note expliquant quoi contrôler.

1. Dans la liste des produits, activez le filtre « À vérifier ».
2. Ouvrez chaque produit, contrôlez référence, prix et stock, corrigez si besoin.
3. Dans la liste, cochez les produits contrôlés puis « Marquer comme vérifié ».

### Publier ou dépublier

Un produit non publié n'apparaît nulle part sur le site (listes, recherche, menus, plan du
site). Utilisez la case « Publié » de la fiche, ou les actions groupées « Publier » /
« Dépublier ». Les autres actions groupées : « Changer de catégorie », « Supprimer ».

### Images

Ajoutez les photos dans l'onglet Images (JPEG, PNG ou WebP, fond blanc de préférence). Le site
génère automatiquement des versions optimisées. Sans photo, une illustration est affichée
(« Illustration (sans photo) » dans l'onglet Général).

## Catégories et marques

- **Catalogue › Catégories** : les gammes (Climatisation, Chauffe-eau…) et leurs types (Mural,
  Gainable…). Les onglets rangent les catégories par gamme ; glissez-déposez pour changer
  l'ordre. Chaque catégorie a un nom, un nom court (menus), une introduction, un gabarit de page
  (vitrine de gamme, liste avec filtres, liste rapide), l'option « Sur devis uniquement », une FAQ
  et un SEO. Une catégorie dont la case « Active » est décochée disparaît du site.
- **Catalogue › Marques** : nom, logo, présentation, « distributeur officiel » et, pour la page
  de marque, les technologies mises en avant.

## Commandes

**Ventes › Commandes** liste les commandes par statut (onglets). Le paiement se fait à la
livraison.

| Statut | Signification |
|---|---|
| Nouvelle | passée sur le site, à confirmer par téléphone |
| Confirmée | le client a confirmé |
| Expédiée | remise au livreur |
| Livrée | livrée et payée |
| Annulée | annulée |

Ouvrez une commande pour voir le client, l'adresse, les articles, les options (visite technique,
devis de pose) et l'historique. Les boutons en haut de page font avancer la commande :
« Confirmer », « Marquer expédiée », « Marquer livrée », « Annuler » (avec une note facultative,
enregistrée dans l'historique). Le client voit ces étapes sur la page « Suivi de commande ».

- « Note interne » : commentaire visible uniquement par l'équipe.
- « Imprimer le bon de commande » : bon A4 pour la préparation et la livraison.

Une commande ne se crée pas depuis le back-office : elle vient toujours du site.

## Demandes

**Ventes › Demandes** regroupe tout ce que les visiteurs envoient : demandes de devis, messages
de contact, candidatures revendeur, demandes depuis les pages secteur, alertes de retour en stock.
Les onglets les classent par type ; « Archivées » garde l'historique.

- Ouvrez une demande pour voir les coordonnées, le message, la page d'origine et la pièce jointe
  éventuelle (« Pièce jointe »).
- « Marquer traitée » quand la demande est prise en charge, « Archiver » quand elle est close.
  Les deux existent aussi en action groupée.

## Revendeurs

**Ventes › Revendeurs** liste les comptes professionnels créés depuis « Devenir revendeur », par
statut : en attente, validé, refusé.

- **Valider** : le revendeur peut se connecter, voit les prix revendeur et la commande rapide. Il
  est prévenu par e-mail.
- **Refuser** : indiquez un motif, il est communiqué au demandeur par e-mail.

Vérifiez l'ICE (15 chiffres) et l'activité avant de valider.

## Contenus

Tous les contenus ont une case **Publié**. Un contenu non publié n'apparaît ni sur le site, ni
dans les menus, ni dans le plan du site, ni dans les blocs de liens. Ne publiez une page que
lorsque son texte définitif est prêt.

| Menu | Contenu |
|---|---|
| Blog : articles | guides et conseils ; le corps de l'article est construit par blocs (paragraphe, intertitre, encadré « En bref », astuce, image, calculateur, tableau des puissances, produits) ; les articles liés à une catégorie apparaissent dans « Guides associés » |
| Blog : catégories | catégories du blog |
| Pages secteur | solutions professionnelles (restaurants, hôtels…) : accroche, contraintes, solutions, produits conseillés, formulaire de devis |
| Pages service | installation, visite technique, service après-vente : inclus, étapes, tarifs |
| Pages ville | pages « Climatisation à <ville> » |
| Pages légales et statiques | à propos, livraison et paiement, CGV, CGU, mentions légales, sécurité, confidentialité |
| FAQ | questions-réponses rattachées à une catégorie, un produit, une page… |

Chaque contenu a un onglet ou une section SEO (titre, description, titre H1).

## Réglages et page d'accueil

**Configuration › Réglages** (administrateurs) :

- Bandeau promotionnel (texte et lien en haut de page) ;
- Contact : téléphones par service, e-mail, numéro WhatsApp, horaires ;
- Magasins (nom et adresse) ;
- Réseaux sociaux (Facebook, Instagram, TikTok) ;
- Commande : prix de la visite technique ;
- Pied de page : texte de présentation.

**Configuration › Page d’accueil** : bandeau principal (titre, sous-titre, image), produits mis en
avant, marques affichées, produit vedette du menu déroulant de chaque gamme.

## Redirections

**Configuration › Redirections** (administrateurs) : quand une adresse change ou disparaît,
ajoutez « ancienne adresse → nouvelle adresse » (301). Le nombre de visites de chaque
redirection est compté. Les adresses de l'ancien site sont redirigées automatiquement.

## Utilisateurs

**Configuration › Utilisateurs** (administrateurs) : créez les comptes de l'équipe, choisissez
le profil (Administrateur ou Gestionnaire), changez un mot de passe. Les comptes revendeurs se
gèrent dans **Ventes › Revendeurs**.
