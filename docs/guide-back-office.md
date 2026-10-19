# Guide du back-office

Ce guide s'adresse à l'équipe d'Ariha Froid qui gère au quotidien ses deux boutiques en ligne,
**Climatisation Maroc** (climatisationmaroc.com) et **Arfro** (arfro.com) : produits, commandes,
demandes, revendeurs et contenus. Un seul back-office (« Ariha Froid — Back office ») sert les
deux sites : voir [Deux sites](#deux-sites).

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

## Deux sites

Les deux sites partagent le catalogue, les prix, les stocks et les comptes revendeurs. Ce qui
change d'un site à l'autre se règle dans le back-office :

- **Visible sur** : sur chaque produit, catégorie, marque, article, page… cochez
  « Climatisation Maroc », « Arfro » ou les deux. Aucune case cochée = l'élément n'apparaît sur
  aucun site. Les produits, catégories et marques existants sont sur les deux sites ; les articles
  et pages existants sont sur Climatisation Maroc uniquement.
- Dans les listes, la colonne **Sites** montre où chaque élément est visible et le filtre
  **Site** n'affiche que ceux d'un site. Actions groupées : cochez des lignes puis « Afficher sur
  Arfro », « Masquer d’Arfro » (et de même pour Climatisation Maroc).
- **Textes Arfro (anti-duplication)** : Google pénalise un texte identique publié sur deux sites.
  Les produits, catégories, marques et catégories du blog ont un onglet ou une section « Textes
  Arfro » : nom, descriptions et SEO (titre, méta-description, H1) propres à Arfro. Un champ vide
  reprend le texte principal, qui est celui de Climatisation Maroc (mention « texte principal »).
  Le filtre **Texte Arfro manquant** liste ce qui est visible sur Arfro sans texte réécrit ; la
  colonne « Texte Arfro » l'indique d'une icône orange.
- **Articles et pages** : une même adresse (par exemple « a-propos ») peut exister une fois par
  site. Pour créer la version Arfro d'un article ou d'une page, utilisez l'action **Dupliquer
  pour Arfro** de la liste : une copie non publiée, visible sur Arfro seulement, s'ouvre ; réécrivez
  le texte puis publiez-la. (Pages ville : pas encore de copie par site, une ville n'a qu'une page.)
- **Commandes, demandes, revendeurs** arrivent des deux sites dans les mêmes listes. La colonne
  **Site** indique leur provenance (bleu : Climatisation Maroc, orange : Arfro) et le filtre
  « Site » les sépare. Les références de commande commencent par CM- ou AR-.
- **Réglages** et **Page d’accueil** existent pour chaque site : « Réglages — Arfro »,
  « Page d’accueil — Arfro »… Les produits proposés dans la page d'accueil d'Arfro sont ceux
  visibles sur Arfro.
- **Voir sur le site** : la fiche d'un produit ou d'une page propose « Voir sur Climatisation
  Maroc » et/ou « Voir sur Arfro » selon où elle est visible.

### Équipe par site

Un gestionnaire peut être limité à un site (Configuration › Utilisateurs › « Sites gérés »).
Il ne voit alors que les commandes, demandes et revendeurs de ce site, les contenus visibles sur
ce site (ou masqués partout), et la page d'accueil de ce site. Dans « Visible sur », il ne peut
cocher ou décocher que son site : les autres cases restent telles quelles ; les textes de l'autre
site sont en lecture seule. Les administrateurs gèrent toujours les deux sites.

## Produits et variantes

Un **produit** est une famille (par exemple « LG Dual Inverter ») ; ses **variantes** sont les
références vendues (9 000, 12 000, 18 000 et 24 000 BTU), chacune avec sa référence (SKU), son
prix et son stock. Un produit simple a une seule variante.

**Catalogue › Produits** affiche la liste, avec recherche, filtres (catégorie, marque, publié,
promo, « À vérifier ») et import (CSV ou Excel) / export. La fiche d'un produit est organisée en onglets :

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

**Ventes › Commandes** liste les commandes par statut (onglets). Le paiement à la livraison est
toujours proposé ; le paiement en ligne par carte bancaire (CMI) seulement s'il est activé (voir
« Paiement en ligne par carte » ci-dessous).

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

### Commandes payées par carte

La colonne **Paiement** de la liste indique le mode de paiement :

| Affichage | Signification |
|---|---|
| À la livraison | le client paie à la réception |
| Payée en ligne | le CMI a confirmé le paiement : rien à encaisser à la livraison |
| Paiement en attente | le client a choisi la carte mais le paiement n'est pas (encore) confirmé, par exemple s'il a quitté la page du CMI |
| Paiement échoué | le paiement a été refusé ; le client peut réessayer depuis sa page de confirmation |

Les filtres **Paiement** et **Paiement en ligne** retrouvent ces commandes.

- Une commande par carte **non payée** ne compte pas dans le nombre affiché à côté de
  « Commandes » dans le menu, et **aucun e-mail** (ni à la boutique, ni au client) n'est envoyé
  tant que le paiement n'est pas confirmé. Les e-mails partent dès que le CMI confirme.
- Dans la fiche de la commande, « Paiement en ligne » donne la date du paiement et le numéro de
  transaction CMI. La section repliée **« Messages CMI »** liste chaque message reçu du CMI : date,
  code, réponse, montant et signature (« Valide » ou « Invalide »). Une signature invalide signifie
  que le message ne vient pas du CMI, ou que la clé enregistrée ici n'est pas celle du back office
  du CMI : la commande n'est pas marquée payée.
- Le bon de commande imprimé indique « Payée en ligne par carte : rien à encaisser » pour une
  commande payée, sinon le montant à encaisser à la livraison.

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

### Importer une liste de revendeurs

**Importer une liste (CSV / Excel)**, en haut de la page Revendeurs, ajoute ou met à jour des
revendeurs en une fois.

1. Téléchargez un exemple (**Télécharger un exemple Excel** ou **le fichier CSV exemple**) et
   remplissez-le, une ligne par revendeur. Gardez la ligne d'en-tête.
2. Colonnes : **Société**, **ICE** (15 chiffres), **E-mail** et **Téléphone** sont obligatoires ;
   **Contact**, **Ville**, **Activité** (installateur, revendeur, bureau_etudes, promoteur, autre),
   **Statut** (valide, en_attente, refuse) et **Site** (cm ou arfro) sont facultatifs. Sans valeur :
   activité « revendeur », statut « valide », site Climatisation Maroc. Une ville inconnue devient
   « Autre ville ».
3. Choisissez le fichier (.xlsx ou .csv ; un ancien fichier .xls doit d'abord être enregistré en
   .xlsx), vérifiez que chaque colonne est bien reconnue, puis **Importer**.

Chaque ligne est reconnue par son e-mail : un revendeur déjà présent est mis à jour, sinon le
compte est créé. Aucun e-mail n'est envoyé : le revendeur choisit son mot de passe avec « Mot de
passe oublié » sur le site. Une notification indique le nombre de lignes importées ; les lignes en
erreur (ICE incomplet, téléphone déjà utilisé, e-mail d'un membre de l'équipe…) se téléchargent
avec le motif.

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

### Pages légales (CGV, CGU, informations légales, sécurité, confidentialité)

Chaque site a ses propres pages légales, à son nom : ouvrez **Contenu > Pages légales et
statiques** et filtrez par **Site** pour voir celles de Climatisation Maroc ou celles d'Arfro. Les
deux séries ont les mêmes adresses (`/cgv`, `/cgu`…) ; la colonne **Sites** indique à quel site
appartient chaque page. Ne cochez pas les deux sites sur une même page : son texte cite le nom
d'un seul site.

Le texte est rédigé par articles numérotés (bloc « Article numéroté ») : un titre et un texte
brut. Une ligne vide sépare deux paragraphes ; un simple retour à la ligne est conservé, pour les
listes (« – … »). Le sommaire et la numérotation « Article 1, 2… » sont automatiques. Pensez à
mettre à jour la mention **Dernière mise à jour** quand vous modifiez un texte.

Les textes du 19 octobre 2026 sont déjà en place sur les deux sites :

- **publiées** : CGV, CGU, Sécurité ;
- **en attente** : Informations légales et Politique de confidentialité. Elles contiennent des
  champs **« [À compléter : … ] »** que seule la société peut fournir : forme juridique et
  capital, siège social, numéros RC, ICE, IF et patente, hébergeur (nom, adresse, téléphone),
  directeur de la publication, numéro de déclaration CNDP.

Pour publier une page en attente : remplacez chaque « [À compléter : … ] » par la vraie
information (crochets compris), vérifiez qu'il n'en reste aucun, puis cochez **Publiée** et
enregistrez. Faites-le sur la page de chaque site. La page apparaît alors dans le pied de page,
le plan du site et le bloc « Autres pages légales ». Une page légale dépubliée disparaît de ces
emplacements ; à la commande, la mention des CGV n'est un lien que lorsque la page CGV est
publiée.

Les coordonnées (téléphones, e-mail, adresses) ne sont pas recopiées dans les pages légales :
elles renvoient à la page Contact, alimentée par les **Réglages** de chaque site.

## Réglages et page d'accueil

Chaque site a ses réglages et sa page d'accueil (« — Climatisation Maroc », « — Arfro »).

**Configuration › Réglages** (administrateurs) :

- Bandeau promotionnel (texte et lien en haut de page) ;
- Contact : téléphones par service, e-mail, numéros WhatsApp (principal, bouton de la page
  d'accueil, bouton flottant), horaires, carte Google Maps de la page Contact (voir ci-dessous) ;
- Magasins (nom et adresse) ;
- Réseaux sociaux : Facebook, Instagram, TikTok, YouTube, X, Threads, Pinterest. Collez l'adresse
  complète de la page (https://…). Seuls les réseaux remplis apparaissent, dans cet ordre, dans le
  pied de page et sur la page Contact ; laissez un champ vide pour masquer l'icône. Chaque site a
  ses propres comptes ;
- Commande : prix de la visite technique ;
- Pied de page : texte de présentation.

**Carte Google Maps (page Contact).** Pour changer la carte affichée sur la page Contact :

1. Dans Google Maps, ouvrez la fiche du magasin puis cliquez sur **Partager** ;
2. Choisissez l'onglet **Intégrer une carte** ;
3. Dans le code proposé (`<iframe src="…" …>`), copiez **seulement** l'adresse placée entre les
   guillemets après `src=`. Elle commence par `https://www.google.com/maps/embed?pb=` ;
4. Collez-la dans le champ « Carte Google Maps (page Contact) » et enregistrez.

Une autre adresse (lien « Partager » simple, code iframe complet…) est refusée. Si le champ est
vide, la page Contact affiche la carte de Marrakech par défaut.

**Numéros WhatsApp (section Contact).** Tous les numéros s'écrivent au format international, sans
« + » ni espace : `212666854184` pour 0666 85 41 84 (10 à 15 chiffres, sinon l'enregistrement est
refusé).

- **Numéro WhatsApp** : le numéro principal (pied de page, page Contact, devis…).
- **Numéros WhatsApp du bouton de la page d’accueil** : le bouton vert « WhatsApp » du bandeau
  principal. Laissé vide, il ouvre le numéro principal ; avec un seul numéro, il ouvre ce numéro ;
  avec deux numéros ou plus, il ouvre un petit menu avec un lien par numéro (le numéro est affiché
  sous la forme 0666 85 41 84, précédé du libellé s'il est rempli, par exemple « Ventes »). Utilisez
  les flèches pour changer l'ordre. Sur Arfro, la page d'accueil n'a pas ce bouton : le champ y est
  sans effet.
- **Bouton WhatsApp flottant** : le bouton rond vert en bas à droite de toutes les pages du site
  (sauf les pages de commande, pour ne pas distraire pendant le paiement). Laissez le champ vide
  pour le masquer.

**Configuration › Page d’accueil** (gestionnaires du site) : bandeau principal (titre, sous-titre, image), produits mis en
avant, marques affichées, produit vedette du menu déroulant de chaque gamme.

### Paiement en ligne par carte

**Configuration › Paiement en ligne — Climatisation Maroc** et **— Arfro** (administrateurs).
Le paiement en ligne est désactivé par défaut. Le paiement à la livraison reste toujours proposé.

Pour l'activer sur un site :

1. Dans le back office du CMI, menu **Administration → Changer les clés du magasin**, définissez
   la clé du magasin (clé de hachage) et notez-la.
2. Dans « Paiement en ligne », saisissez :
   - **Plate-forme** : « Production (paiements réels) », ou « Test (cartes de test CMI) » pour un
     essai sur la plate-forme de test du CMI ;
   - **Identifiant marchand (ClientId)** donné par le CMI (celui de Climatisation Maroc est déjà
     rempli ; Arfro a besoin de son propre contrat CMI et de son propre identifiant) ;
   - **Clé de hachage (clé du magasin)** : exactement la même clé que dans le back office du CMI.
     Elle est enregistrée chiffrée et n'est plus jamais affichée ; laissez le champ vide pour
     conserver la clé enregistrée.
3. Cochez **« Proposer le paiement en ligne par carte bancaire (CMI) »** et enregistrez. La ligne
   « État » confirme si le paiement par carte est proposé sur le site.

Le client choisit alors à la commande entre « Paiement à la livraison » et « Carte bancaire » ;
l'e-mail devient obligatoire pour payer par carte. Les adresses de retour et de notification sont
envoyées automatiquement au CMI avec chaque paiement.

Après l'activation, vérifiez avec un vrai paiement par carte : la commande doit passer à « Payée
en ligne » et les e-mails partir. Contrôlez ensuite le relevé du CMI après 24 h : le paiement doit
y apparaître avec le même montant. Si la clé change dans le back office du CMI, saisissez la
nouvelle ici aussitôt, sinon les paiements ne sont plus confirmés.

## Redirections

**Configuration › Redirections** (administrateurs) : quand une adresse change ou disparaît,
ajoutez « ancienne adresse → nouvelle adresse » (301). Le nombre de visites de chaque
redirection est compté. Les adresses de l'ancien site sont redirigées automatiquement.

## Utilisateurs

**Configuration › Utilisateurs** (administrateurs) : créez les comptes de l'équipe, choisissez
le profil (Administrateur ou Gestionnaire), les **sites gérés** (aucune case = tous les sites),
changez un mot de passe. Les comptes revendeurs se gèrent dans **Ventes › Revendeurs** ; un
compte revendeur validé vaut sur les deux sites.
