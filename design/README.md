# Design reference

Imported on 2026-10-06 from the Claude Design project
`f6d854ce-f153-478b-8536-49a9a7a3de88` ("Homepage concepts under review").

These files are the **visual source of truth** for the front office. They are a
reference, not code to ship: `support.js` is the design tool's runtime and
`art.js` draws placeholder product illustrations. Neither is used by the app.

`Toutes les pages.dc.html` is the index. It lists the pages below and their
extra states. The index itself is not a page of the site.

## Pages and states

| Group | Page file | States (query string) |
|---|---|---|
| Accueil | `Accueil.dc.html` | `?menu=clim`, `?drawer=1` (open mega menu / drawer) |
| Structure | `Structure et navigation.dc.html` | design board: silo plan, mega menus, mobile menu, breadcrumb + footer |
| Structure | `Plan du site.dc.html` | design board: site map |
| Climatisation | `Climatisation.dc.html` | |
| Climatisation | `Categorie Climatiseurs muraux.dc.html` | `?comparer=1` |
| Climatisation | `Produit LG Dual Inverter.dc.html` | |
| Achat | `Panier.dc.html` | `?vide=1` |
| Achat | `Commande.dc.html` | |
| Achat | `Confirmation.dc.html` | |
| Achat | `Suivi commande.dc.html` | |
| Achat | `Recherche.dc.html` | `?q=cuivre`, `?q=climatiseur%20portable` (no result) |
| Achat | `Promotions.dc.html` | |
| Devis, contact, services | `Demander un devis.dc.html` | `?envoye=1` |
| Devis, contact, services | `Contact.dc.html` | |
| Devis, contact, services | `Service.dc.html` | default = Installation, `?s=visite`, `?s=sav` |
| Professionnels | `Espace professionnel.dc.html` | |
| Professionnels | `Devenir revendeur.dc.html` | `?envoye=1` |
| Professionnels | `Connexion.dc.html` | `?oubli=1` |
| Professionnels | `Commande rapide.dc.html` | |
| Solutions | `Solutions professionnelles.dc.html` | |
| Solutions | `Restaurants.dc.html` | |
| Blog | `Blog.dc.html` | |
| Blog | `Blog categorie.dc.html` | `?c=guides` |
| Blog | `Article puissance climatiseur.dc.html` | |
| Marques et outils | `Marque LG.dc.html` | |
| Marques et outils | `Cuivre et gaz.dc.html` | |
| Marques et outils | `Comparer.dc.html` | |
| Marques et outils | `Calculateur puissance.dc.html` | |
| Entreprise | `A propos.dc.html` | |
| Entreprise | `Livraison et paiement.dc.html` | |
| Entreprise | `CGV.dc.html` | |
| Entreprise | `Page introuvable.dc.html` | |

32 unique files: 30 site pages and 2 design boards (`Structure et navigation`,
`Plan du site`). Pages link to many `.dc.html` names that were never drawn
(`Chauffe-eau`, `Marque Carrier`, `CGU`, …). Those are the templates the site
must still provide, built from the same components.

## Images

Present in `uploads/`: `New_DZ2.png` and the nine brand logos `logo-*-t.png`.

**Missing.** The design tool can only export files up to 256 KiB, so these
could not be imported. They must be supplied separately and placed in
`uploads/` under the same names:

- `pasted-1791221833312-0.png`: Ariha Froid logo (header, footer, drawer)
- `cover-ariha.png`: home hero background
- `pasted-1791236697258-0.png`: hotel-hall photo (home "Solutions professionnelles" tile)
- `clima-cut2.png`, `chauffe-eau-b0352fa9.png`, `ventilateur-cut.png`,
  `gaines-cut.png`, `cuivre-cut2.png`, `telecommande-cut2.png`: range cut-outs
- `cuivre-56818f19.png`: "Tout pour l'installation" tile photo

Some product images point to the live site, `https://climatisationmaroc.com/prodimg/…`.
