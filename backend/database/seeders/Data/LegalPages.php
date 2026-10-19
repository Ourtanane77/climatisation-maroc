<?php

namespace Database\Seeders\Data;

use App\Enums\PageKind;
use App\Models\Page;
use App\Support\Sites\Sites;

/**
 * Legal pages (CGV, CGU, Informations légales, Sécurité, Politique de confidentialité), one set per
 * storefront, written from what the shop really does (docs/architecture.md, checkout, forms).
 * Used by ContentSeeder (fresh installs) and the 2026_10_19 data migration (existing installs).
 *
 * - Facts the repository does not know (RC, ICE, host, CNDP number…) are « [À compléter : …] »
 *   markers: a page holding one stays unpublished until the owner fills it in and ticks « Publiée ».
 * - A page is written only when it is missing or still holds the design placeholder
 *   « [TEXTE JURIDIQUE] » (or no article at all): text edited in the back office is never replaced.
 * - Each site gets its own pages (sites = [site]) naming that site only.
 * - Article texts are plain text: paragraphs separated by a blank line, list items on their own line.
 */
final class LegalPages
{
    /** Design placeholder of the legal pages never written. */
    public const DESIGN_PLACEHOLDER = '[TEXTE JURIDIQUE]';

    /** Marker of a fact to be supplied by the owner. */
    public const TODO = '[À compléter';

    public const UPDATED_LABEL = '19 octobre 2026';

    /** Footer order of the design. */
    public const SLUGS = ['cgv', 'cgu', 'informations-legales', 'securite', 'confidentialite'];

    /**
     * Writes the site's legal pages. Returns slug => created|updated|kept.
     *
     * @return array<string, string>
     */
    public static function write(string $site): array
    {
        $result = [];
        foreach (self::pages($site) as $position => $def) {
            $page = Page::query()->visibleOn($site)->where('slug', $def['slug'])->first();
            if ($page && ! self::isUntouched($page)) {
                $result[$def['slug']] = 'kept';

                continue;
            }

            $created = $page === null;
            $page ??= new Page(['slug' => $def['slug'], 'title' => $def['title'], 'position' => $position]);
            $page->fill([
                'kind' => PageKind::Legal,
                'intro' => $def['intro'],
                'body' => array_map(fn (array $a) => ['type' => 'article', 'data' => ['title' => $a[0], 'text' => $a[1]]], $def['articles']),
                'updated_label' => self::UPDATED_LABEL,
                'is_published' => ! self::hasTodo($def),
                // The text names this site: never shown on another one.
                'sites' => [$site],
            ]);
            $page->save();
            $page->seo()->updateOrCreate([], ['title' => $def['seo_title'], 'description' => $def['seo_description'], 'h1' => $page->title]);
            $result[$def['slug']] = $created ? 'created' : 'updated';
        }

        return $result;
    }

    /** No article written yet: the design placeholder, or an empty body. */
    public static function isUntouched(Page $page): bool
    {
        $articles = array_filter($page->body ?? [], fn (array $b) => $b['type'] === 'article');
        if ($articles === []) {
            return true;
        }

        return str_contains((string) json_encode($page->body, JSON_UNESCAPED_UNICODE), self::DESIGN_PLACEHOLDER);
    }

    /** @param array{intro: string, articles: list<array{0: string, 1: string}>} $def */
    public static function hasTodo(array $def): bool
    {
        return str_contains($def['intro'].json_encode($def['articles'], JSON_UNESCAPED_UNICODE), self::TODO);
    }

    /**
     * @return list<array{slug: string, title: string, intro: string, seo_title: string, seo_description: string, articles: list<array{0: string, 1: string}>}>
     */
    public static function pages(string $site): array
    {
        $name = Sites::get($site)->name;
        $t = fn (string $text) => strtr($text, [':site' => $name]);
        $intro = self::intros($site);

        $pages = [
            [
                'slug' => 'cgv',
                'title' => 'Conditions générales de vente',
                'intro' => $intro['cgv'],
                'seo_title' => 'Conditions générales de vente · :site',
                'seo_description' => 'Conditions générales de vente de :site (Ariha Froid) : commande, prix, paiement à la livraison ou par carte, livraison gratuite, rétractation, garantie.',
                'articles' => self::cgv(),
            ],
            [
                'slug' => 'cgu',
                'title' => 'Conditions générales d’utilisation',
                'intro' => $intro['cgu'],
                'seo_title' => 'Conditions générales d’utilisation · :site',
                'seo_description' => 'Conditions d’utilisation du site :site : accès, compte professionnel, propriété intellectuelle, responsabilité et liens externes.',
                'articles' => self::cgu(),
            ],
            [
                'slug' => 'informations-legales',
                'title' => 'Informations légales',
                'intro' => $intro['informations-legales'],
                'seo_title' => 'Informations légales · :site',
                'seo_description' => 'Mentions légales de :site : éditeur (Ariha Froid, Marrakech), hébergement, directeur de la publication et contact.',
                'articles' => self::legalNotice(),
            ],
            [
                'slug' => 'securite',
                'title' => 'Sécurité',
                'intro' => $intro['securite'],
                'seo_title' => 'Sécurité · :site',
                'seo_description' => 'Comment :site protège vos données, vos paiements par carte (CMI, 3-D Secure) et votre compte professionnel.',
                'articles' => self::security(),
            ],
            [
                'slug' => 'confidentialite',
                'title' => 'Politique de confidentialité',
                'intro' => $intro['confidentialite'],
                'seo_title' => 'Politique de confidentialité · :site',
                'seo_description' => 'Données collectées par :site, utilisation, conservation, partage, cookies et vos droits selon la loi 09-08.',
                'articles' => self::privacy(),
            ],
        ];

        return array_map(fn (array $p) => [
            ...$p,
            'intro' => $t($p['intro']),
            'seo_title' => $t($p['seo_title']),
            'seo_description' => $t($p['seo_description']),
            'articles' => array_map(fn (array $a) => [$a[0], $t($a[1])], $p['articles']),
        ], $pages);
    }

    /** @return array<string, string> slug => intro, worded per site. */
    private static function intros(string $site): array
    {
        return match ($site) {
            'arfro' => [
                'cgv' => 'Arfro est la boutique en ligne de la société Ariha Froid, spécialiste de la climatisation et du froid à Marrakech depuis 2008. Toute commande passée sur Arfro est soumise aux conditions ci-dessous.',
                'cgu' => 'Ces conditions fixent les règles d’utilisation d’Arfro, boutique en ligne de la société Ariha Froid. Elles valent pour tout visiteur du site, qu’il commande ou non.',
                'informations-legales' => 'Qui édite Arfro, où le site est hébergé et comment joindre la société Ariha Froid, dont Arfro est la boutique en ligne.',
                'securite' => 'Paiement, données personnelles, compte professionnel : les mesures prises par Arfro, boutique en ligne de la société Ariha Froid, et les bons réflexes de votre côté.',
                'confidentialite' => 'Arfro, boutique en ligne de la société Ariha Froid, ne collecte que les données utiles à vos commandes et à vos demandes. Voici lesquelles, pourquoi, et comment exercer vos droits.',
            ],
            default => [
                'cgv' => 'Les présentes conditions s’appliquent aux commandes passées sur :site, boutique en ligne de la société Ariha Froid, Marrakech.',
                'cgu' => 'Les présentes conditions encadrent l’utilisation du site :site, boutique en ligne de la société Ariha Froid, Marrakech.',
                'informations-legales' => 'Informations sur l’éditeur et l’hébergement du site :site, boutique en ligne de la société Ariha Froid, Marrakech.',
                'securite' => 'Les mesures prises par :site, boutique en ligne de la société Ariha Froid, pour protéger vos paiements, vos données et votre compte.',
                'confidentialite' => 'Cette politique explique quelles données :site, boutique en ligne de la société Ariha Froid, collecte, pourquoi, et comment exercer vos droits.',
            ],
        };
    }

    /** @return list<array{0: string, 1: string}> */
    private static function cgv(): array
    {
        return [
            ['Objet', <<<'TXT'
Les présentes conditions générales de vente (CGV) régissent les ventes de produits conclues à distance sur le site :site, boutique en ligne de la société Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008, pour les particuliers comme pour les professionnels. Les coordonnées de la société figurent sur la page Contact.

Elles s’appliquent dans le cadre de la loi n° 31-08 édictant des mesures de protection du consommateur et de la loi n° 53-05 relative à l’échange électronique de données juridiques.

En validant sa commande, le client déclare avoir pris connaissance des présentes CGV et les accepter. Les CGV applicables sont celles en vigueur à la date de la commande.
TXT],
            ['Produits et disponibilité', <<<'TXT'
Les produits proposés (climatiseurs, chauffe-eau, gaines, pièces et matériel d’installation…) sont présentés sur leur fiche avec leurs caractéristiques essentielles, leur référence et leur prix. Les photos sont fournies à titre indicatif : en cas de différence, la description et la référence font foi.

Un même produit peut exister en plusieurs versions (puissance, couleur). La version commandée est celle choisie sur la fiche produit et rappelée dans le panier.

La disponibilité est indiquée sur chaque fiche. Si un produit commandé n’est finalement plus disponible, nous en informons le client lors de l’appel de confirmation et lui proposons un produit équivalent ou l’annulation de la commande ; une somme déjà payée par carte lui est alors remboursée.

Les produits affichés « Prix sur demande » ne peuvent pas être commandés en ligne : le client peut demander un devis.
TXT],
            ['Commandes', <<<'TXT'
Pour commander, le client ajoute les produits au panier puis indique son nom, son numéro de téléphone, sa ville et son adresse de livraison. L’adresse e-mail est facultative, sauf pour le paiement par carte. Il peut ajouter une visite technique ou demander un devis d’installation, choisit son mode de paiement et accepte les présentes CGV avant de valider la commande.

Une référence de commande est affichée à la fin de la commande et envoyée par e-mail lorsque le client a indiqué son adresse. Notre équipe appelle ensuite le client pour confirmer la commande et l’adresse de livraison.

Conformément à la loi n° 53-05, la validation de la commande en ligne exprime le consentement du client. Les données enregistrées par le site valent preuve de la commande et de sa date.

Nous pouvons annuler une commande lorsque le client reste injoignable ou que les informations fournies sont erronées ; toute somme déjà payée lui est alors remboursée.

Le client suit sa commande sur la page « Suivre ma commande », avec sa référence et son numéro de téléphone.
TXT],
            ['Prix', <<<'TXT'
Les prix sont indiqués en dirhams marocains (Dhs). Le prix à payer est celui affiché dans le panier et rappelé au moment de valider la commande ; il est calculé par le site lors de la commande.

Lorsqu’un prix promotionnel est affiché, le prix barré correspond au prix habituel du produit.

La livraison est gratuite : aucun frais de livraison ne s’ajoute au prix des produits. La visite technique, lorsqu’elle est choisie, s’ajoute au total ; son prix est affiché lors de la commande. L’installation fait l’objet d’un devis séparé.

Les professionnels titulaires d’un compte validé voient, une fois connectés, les prix professionnels qui leur sont réservés.

Nous pouvons modifier nos prix à tout moment. Les produits sont facturés au prix en vigueur lors de la validation de la commande.
TXT],
            ['Paiement', <<<'TXT'
Le paiement à la livraison est toujours proposé : le client règle sa commande au livreur, à la réception.

Lorsque le paiement en ligne est proposé sur la page de commande, le client peut aussi payer par carte bancaire. Le paiement est alors traité par le Centre Monétique Interbancaire (CMI) sur sa page de paiement sécurisée, avec l’authentification 3-D Secure lorsque la banque du client l’exige. Les données de la carte sont saisies uniquement sur la page du CMI : :site ne les reçoit pas et ne les conserve pas.

La commande est considérée comme payée lorsque le CMI confirme le paiement. Si le paiement n’aboutit pas, la commande n’est pas payée : le client peut refaire le paiement depuis la page de confirmation de sa commande ou nous contacter.
TXT],
            ['Livraison', <<<'TXT'
La livraison est gratuite partout au Maroc, à l’adresse indiquée lors de la commande, dans les villes proposées sur la page de commande.

Le délai de livraison dépend de la ville et de la disponibilité des produits. Il est communiqué au client lors de l’appel de confirmation.

À la réception, le client vérifie l’état des colis et la conformité des produits en présence du livreur. Toute anomalie (colis endommagé, produit manquant ou non conforme) est signalée au livreur et à notre service client au plus vite, avec la référence de la commande.
TXT],
            ['Installation et visite technique', <<<'TXT'
Les produits sont vendus sans installation. L’installation (pose, raccordement et mise en service) peut être réalisée par les techniciens d’Ariha Froid ; elle fait l’objet d’un devis établi selon l’appareil et le chantier, que le client est libre d’accepter. Le matériel d’installation (liaisons cuivre, supports, accessoires) est vendu séparément.

Le client peut ajouter à sa commande une visite technique : un technicien mesure et le conseille sur la puissance adaptée et l’emplacement des unités. Son prix est indiqué lors de la commande et s’ajoute au total.

Le client peut aussi demander un devis d’installation lors de la commande ou depuis la page « Demander un devis » ; nous le rappelons pour l’établir.
TXT],
            ['Rétractation et retours', <<<'TXT'
Conformément aux articles 36 et suivants de la loi n° 31-08, le client consommateur dispose d’un délai de sept (7) jours pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités, à l’exception des frais de retour. Ce délai court à compter de la réception du produit, ou de l’acceptation de l’offre pour une prestation de services.

Pour exercer ce droit, le client nous contacte (voir la page Contact) en indiquant la référence de sa commande. Le produit est retourné complet, dans son état d’origine, avec son emballage, ses accessoires et sa notice.

Nous remboursons les sommes versées, hors frais de retour, au plus tard dans les quinze (15) jours suivant l’exercice du droit de rétractation, par le même moyen de paiement lorsque cela est possible.

Le droit de rétractation ne s’applique pas, notamment, à une prestation de services dont l’exécution a commencé avec l’accord du client avant la fin du délai de sept jours (visite technique ou installation réalisée), ni à un bien confectionné selon les spécifications du client.

Ces dispositions protègent les consommateurs. Elles ne concernent pas les achats effectués par un professionnel pour les besoins de son activité.
TXT],
            ['Garantie', <<<'TXT'
Les produits vendus bénéficient de la garantie légale des défauts de la chose vendue prévue par le Dahir formant Code des obligations et des contrats et rappelée par la loi n° 31-08, ainsi que, le cas échéant, de la garantie du fabricant.

La durée et les conditions de la garantie du fabricant dépendent de la marque et du produit. Elles sont précisées au client sur simple demande. Cette garantie s’applique dans les conditions fixées par le fabricant, qui excluent en général les dommages dus à une installation non conforme, à une utilisation contraire à la notice ou à un défaut d’entretien.
TXT],
            ['Service après-vente', <<<'TXT'
Pour une panne, une question ou une réclamation après l’achat, le client contacte notre service après-vente aux coordonnées indiquées sur la page Contact, en précisant la référence de sa commande et le produit concerné. Nos techniciens assurent le diagnostic, la réparation et la fourniture de pièces de rechange. Une intervention hors garantie fait l’objet d’un devis préalable.
TXT],
            ['Données personnelles', <<<'TXT'
Les données communiquées lors de la commande sont nécessaires à son traitement, à la livraison et au service après-vente. Elles sont traitées par Ariha Froid conformément à la loi n° 09-08 relative à la protection des personnes physiques à l’égard du traitement des données à caractère personnel.

Le client dispose d’un droit d’accès, de rectification et d’opposition, détaillé dans la Politique de confidentialité, qu’il exerce depuis la page Contact.
TXT],
            ['Droit applicable et litiges', <<<'TXT'
Les présentes CGV sont soumises au droit marocain. En cas de difficulté, le client est invité à contacter d’abord notre service client afin de rechercher une solution amiable. À défaut, le litige est porté devant les juridictions marocaines compétentes, le consommateur conservant le bénéfice des règles protectrices de la loi n° 31-08.

Nous pouvons modifier les présentes CGV à tout moment. La version applicable est celle en vigueur à la date de la commande ; la date de dernière mise à jour figure en haut de cette page.
TXT],
        ];
    }

    /** @return list<array{0: string, 1: string}> */
    private static function cgu(): array
    {
        return [
            ['Objet', <<<'TXT'
Les présentes conditions générales d’utilisation (CGU) encadrent l’accès au site :site et son utilisation. :site est la boutique en ligne de la société Ariha Froid, Marrakech.

En naviguant sur le site, l’utilisateur accepte les présentes CGU. Les achats sont en outre régis par les Conditions générales de vente.
TXT],
            ['Accès au site', <<<'TXT'
Le site est accessible gratuitement à toute personne disposant d’un accès à Internet ; les frais de connexion restent à la charge de l’utilisateur.

Nous nous efforçons de maintenir le site accessible en permanence, sans pouvoir le garantir : l’accès peut être interrompu pour maintenance, mise à jour ou en cas de panne.

L’utilisateur s’engage à utiliser le site de façon loyale. Il s’interdit notamment de perturber son fonctionnement, d’en extraire le contenu de façon automatisée, d’y introduire du code malveillant ou d’envoyer des formulaires contenant de fausses informations ou au nom d’un tiers.
TXT],
            ['Compte professionnel', <<<'TXT'
Les installateurs, revendeurs, bureaux d’études et promoteurs peuvent demander l’ouverture d’un compte professionnel depuis la page « Devenir revendeur », en indiquant notamment leur société, leur ICE, leur activité et leurs coordonnées.

Le compte est activé après vérification par notre équipe, qui peut refuser une demande. Une fois connecté, le professionnel accède aux prix professionnels et à la commande rapide par références.

Les identifiants sont personnels et confidentiels : le titulaire du compte est responsable de leur usage et nous signale sans délai toute utilisation non autorisée. Nous pouvons suspendre ou fermer un compte utilisé contrairement aux présentes CGU ou ouvert avec des informations inexactes.
TXT],
            ['Propriété intellectuelle', <<<'TXT'
La structure du site, ses textes, photos, logos, graphismes et logiciels appartiennent à Ariha Froid ou à leurs titulaires, notamment les marques et fabricants des produits présentés. Ils sont protégés par la loi n° 2-00 relative aux droits d’auteur et droits voisins et par la loi n° 17-97 relative à la protection de la propriété industrielle.

Toute reproduction ou réutilisation, totale ou partielle, sans autorisation écrite préalable est interdite. Les marques citées appartiennent à leurs propriétaires respectifs.
TXT],
            ['Responsabilité', <<<'TXT'
Nous veillons à l’exactitude des informations publiées : descriptions, caractéristiques, disponibilité, guides et calculateur de puissance. Elles sont données à titre indicatif et peuvent ne pas convenir à une installation particulière ; le calculateur fournit une estimation qui ne remplace pas l’avis d’un technicien.

Ariha Froid ne saurait être tenue responsable des dommages indirects liés à l’utilisation du site, d’une interruption de service, d’un virus provenant d’Internet, ni d’une utilisation du site contraire aux présentes CGU.
TXT],
            ['Liens externes', <<<'TXT'
Le site peut contenir des liens vers d’autres sites : fabricants, réseaux sociaux, WhatsApp… Ces sites ne sont pas sous notre contrôle et nous ne sommes pas responsables de leur contenu ni de leur traitement des données personnelles.

Un lien vers :site doit être loyal et ne pas porter atteinte à son image.
TXT],
            ['Modification des conditions', <<<'TXT'
Nous pouvons modifier les présentes CGU à tout moment, notamment pour suivre l’évolution du site ou de la réglementation. La version applicable est celle publiée sur cette page ; la date de dernière mise à jour figure en haut.

Les présentes CGU sont soumises au droit marocain. Pour toute question, utilisez la page Contact.
TXT],
        ];
    }

    /** @return list<array{0: string, 1: string}> */
    private static function legalNotice(): array
    {
        return [
            ['Éditeur du site', <<<'TXT'
Le site :site est édité par la société Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008.

Forme juridique et capital social : [À compléter : forme juridique et capital social]
Siège social : [À compléter : adresse du siège social]
Registre du commerce : [À compléter : numéro RC et ville du tribunal]
Identifiant commun de l’entreprise (ICE) : [À compléter : numéro ICE]
Identifiant fiscal (IF) : [À compléter : numéro IF]
Taxe professionnelle (patente) : [À compléter : numéro de patente]
TXT],
            ['Hébergement', <<<'TXT'
Le site est hébergé sur un serveur privé virtuel (VPS) loué auprès de : [À compléter : nom, adresse et téléphone de l’hébergeur].

Les paiements par carte sont traités par le Centre Monétique Interbancaire (CMI), sur ses propres serveurs.
TXT],
            ['Directeur de la publication', <<<'TXT'
[À compléter : nom et fonction du directeur de la publication], pour la société Ariha Froid.
TXT],
            ['Contact', <<<'TXT'
Pour toute question sur le site, une commande ou vos données personnelles, contactez-nous aux coordonnées indiquées sur la page Contact : téléphones, e-mail, WhatsApp et adresses de nos magasins.

Vous pouvez aussi nous signaler par ce moyen une erreur ou un contenu qui vous semble illicite.
TXT],
        ];
    }

    /** @return list<array{0: string, 1: string}> */
    private static function security(): array
    {
        return [
            ['Protection des données', <<<'TXT'
Les échanges entre votre navigateur et :site sont chiffrés (connexion sécurisée HTTPS).

Les données que vous nous confiez sont conservées sur un serveur dont l’accès est réservé aux personnes habilitées. Dans notre outil de gestion, chaque membre de l’équipe dispose de son propre compte, avec des droits limités à son rôle.

Les formulaires sont protégés contre les envois automatisés et le nombre de tentatives est limité.
TXT],
            ['Paiement', <<<'TXT'
Le paiement à la livraison reste toujours possible.

Lorsque vous payez par carte, vous êtes dirigé vers la page de paiement sécurisée du Centre Monétique Interbancaire (CMI). Vos données de carte sont saisies uniquement sur cette page, avec l’authentification 3-D Secure de votre banque lorsqu’elle l’exige : elles ne transitent pas par :site et ne sont jamais enregistrées par le site. Nous recevons seulement le résultat du paiement, ses références et un numéro de carte masqué.

Nous ne vous demanderons jamais votre numéro de carte, sa date d’expiration ou son code de sécurité par téléphone, par e-mail ou par WhatsApp.
TXT],
            ['Comptes et mots de passe', <<<'TXT'
Les mots de passe des comptes professionnels sont enregistrés sous une forme chiffrée irréversible : personne, pas même notre équipe, ne peut les lire.

Choisissez un mot de passe d’au moins 8 caractères, que vous n’utilisez pas ailleurs, et ne le communiquez à personne. En cas d’oubli, utilisez le lien « Mot de passe oublié ? » de la page de connexion : un lien de réinitialisation est envoyé à l’adresse e-mail du compte.

Sur un ordinateur partagé, déconnectez-vous après usage.
TXT],
            ['Signaler un problème', <<<'TXT'
Si vous constatez une faille de sécurité ou une activité suspecte sur votre compte, ou si vous recevez au nom de :site ou d’Ariha Froid un message qui vous paraît frauduleux (demande de paiement inhabituelle, lien douteux), contactez-nous sans attendre via la page Contact.

Merci de ne pas exploiter ni divulguer une faille avant que nous ayons pu la corriger.
TXT],
        ];
    }

    /** @return list<array{0: string, 1: string}> */
    private static function privacy(): array
    {
        return [
            ['Données collectées', <<<'TXT'
Le responsable du traitement est la société Ariha Froid, Marrakech, qui édite :site. Déclaration auprès de la CNDP : [À compléter : numéro de récépissé de déclaration ou d’autorisation CNDP].

Nous collectons les données que vous nous transmettez par les formulaires du site :
– commande : nom, téléphone, ville, adresse de livraison, e-mail (facultatif, sauf pour le paiement par carte), remarque, produits commandés et options choisies ;
– suivi de commande : référence et numéro de téléphone ;
– demande de devis et demande pour un projet professionnel : nom, société, téléphone, e-mail, ville, type de projet, surface, message et pièce jointe éventuelle (photo ou PDF) ;
– contact : nom, téléphone, e-mail, objet et message ;
– alerte de disponibilité : numéro de téléphone et produit concerné ;
– demande de compte professionnel : société, ICE, activité, ville, nom du contact, téléphone, e-mail, mot de passe et message.

Pour un paiement par carte, le CMI nous transmet le résultat du paiement, ses références et un numéro de carte masqué, jamais les données complètes de votre carte.

Lors de votre navigation, des données techniques (adresse IP, type d’appareil et de navigateur, pages vues, clics et défilements) sont aussi enregistrées par notre serveur et par les outils de mesure d’audience décrits à l’article « Cookies ».
TXT],
            ['Utilisation des données', <<<'TXT'
Vos données servent à :
– traiter votre commande : appel de confirmation, livraison, paiement, facturation et suivi ;
– vous rappeler et établir les devis demandés, organiser la visite technique ou l’installation ;
– répondre à vos messages et assurer le service après-vente ;
– vous prévenir lorsqu’un produit revient en stock ;
– étudier une demande de compte professionnel, puis gérer ce compte et vous afficher vos prix ;
– vous envoyer les e-mails liés à ces demandes : confirmation de commande, accusé de réception, activation du compte, mot de passe oublié ;
– mesurer l’audience du site et améliorer son fonctionnement ;
– respecter nos obligations légales, comptables et fiscales.

Nous ne vendons pas vos données et ne les utilisons pas pour de la prospection commerciale par e-mail ou par SMS sans votre accord.
TXT],
            ['Durée de conservation', <<<'TXT'
Les données sont conservées le temps nécessaire au traitement de votre demande et à notre relation commerciale, puis archivées pendant les durées imposées par la loi, notamment par la législation comptable et fiscale pour les commandes.

Les données d’un compte professionnel sont conservées tant que le compte est ouvert. Les demandes de devis, les messages et les alertes de disponibilité ne sont pas conservés au-delà de ce qui est utile à leur suivi.
TXT],
            ['Partage des données', <<<'TXT'
Vos données sont destinées à l’équipe d’Ariha Froid. Elles ne sont communiquées qu’aux prestataires qui en ont besoin pour leur mission :
– le livreur ou le transporteur, pour la livraison de votre commande ;
– le Centre Monétique Interbancaire (CMI), pour un paiement par carte ;
– l’hébergeur du site et le service d’envoi d’e-mails ;
– Google (Google Tag Manager) et Microsoft (Clarity), pour la mesure d’audience.

Certains de ces prestataires, notamment Google et Microsoft, peuvent traiter des données hors du Maroc. Vos données peuvent enfin être communiquées aux autorités lorsque la loi l’exige.
TXT],
            ['Cookies', <<<'TXT'
Le site utilise :
– des cookies nécessaires à son fonctionnement : le contenu de votre panier et, pour les professionnels, la session de connexion (cookie sécurisé valable 30 jours au plus). Le comparateur de produits garde votre sélection dans votre navigateur ;
– des outils de mesure d’audience : Google Tag Manager, qui gère le chargement des outils de mesure de Google, et Microsoft Clarity, qui enregistre les clics, défilements et déplacements sur les pages pour nous aider à améliorer le site. Ces outils déposent leurs propres cookies.

Vous pouvez à tout moment bloquer ou supprimer les cookies dans les réglages de votre navigateur ; bloquer les cookies nécessaires peut empêcher le panier ou la connexion de fonctionner. Les politiques de confidentialité de Google et de Microsoft décrivent leurs propres traitements.
TXT],
            ['Vos droits', <<<'TXT'
Conformément à la loi n° 09-08 relative à la protection des personnes physiques à l’égard du traitement des données à caractère personnel, vous disposez d’un droit d’accès à vos données, d’un droit de rectification et d’un droit d’opposition, pour des motifs légitimes, à leur traitement. Vous pouvez aussi vous opposer, sans frais, à leur utilisation à des fins de prospection.

Pour exercer ces droits, contactez-nous via la page Contact en précisant votre demande ; une preuve d’identité peut vous être demandée. Vous pouvez également saisir la Commission nationale de contrôle de la protection des données à caractère personnel (CNDP).
TXT],
            ['Contact', <<<'TXT'
Pour toute question sur cette politique ou sur vos données, contactez Ariha Froid aux coordonnées indiquées sur la page Contact.

Cette politique peut évoluer ; la date de dernière mise à jour figure en haut de cette page.
TXT],
        ];
    }
}
