<?php

namespace Database\Seeders;

use App\Enums\PageKind;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Category;
use App\Models\Page;
use App\Models\ProductVariant;
use App\Models\SectorPage;
use App\Models\ServicePage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

/**
 * Editable content, verbatim from the design files (docs/design-inventory/). Pages whose copy
 * does not exist yet are created unpublished: they stay out of menus, the sitemap and link blocks.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->services();
        $this->sectors();
        $this->blog();
        $this->pages();
    }

    private function services(): void
    {
        $supplies = $this->productIds(['CUIV0018', 'CLIM00076', 'CUIV0005', 'CUIV0006']);

        $services = [
            [
                'slug' => 'installation', 'name' => 'Installation',
                'h1' => 'Installation de climatisation par nos techniciens',
                'hero_text' => 'Pose, raccordement et mise en service de votre climatiseur par l’équipe Ariha Froid.',
                'whatsapp_text' => 'Bonjour, je souhaite une installation de climatisation.',
                'included' => [
                    ['title' => 'Pose de l’unité intérieure et extérieure', 'icon' => 'unit'],
                    ['title' => 'Raccordement cuivre et électrique', 'icon' => 'pipe'],
                    ['title' => 'Mise en service et test', 'icon' => 'test'],
                    ['title' => 'Conseils d’utilisation', 'icon' => 'chat'],
                ],
                'steps' => [
                    ['title' => 'Visite technique', 'text' => '300 Dhs. Un technicien mesure et conseille.'],
                    ['title' => 'Devis', 'text' => 'Le prix de la pose selon votre chantier.'],
                    ['title' => 'Installation', 'text' => 'Pose, raccordement et mise en service.'],
                    ['title' => 'Service après-vente', 'text' => 'Nous restons joignables après la pose.'],
                ],
                'prices' => [['label' => 'Pose', 'value' => 'Sur devis'], ['label' => 'Visite technique', 'value' => '300 Dhs']],
                'show_supplies' => true,
                'faq' => [
                    ['Combien coûte la pose ?', 'La pose est sur devis : le prix dépend de l’appareil, de la distance entre les unités et de l’accès. Demandez un devis, nous vous rappelons.'],
                    ['Faut-il une visite technique ?', 'Elle est conseillée pour choisir la bonne puissance et l’emplacement des unités. Elle coûte 300 Dhs.'],
                    ['Le matériel d’installation est-il inclus ?', 'Non. Le kit duo cuivre, le support et les accessoires sont vendus séparément, voir ci-dessus.'],
                ],
            ],
            [
                'slug' => 'visite-technique', 'name' => 'Visite technique',
                'h1' => 'Visite technique avant installation',
                'hero_text' => 'Un technicien se déplace, mesure la pièce et vous conseille la bonne puissance.',
                'whatsapp_text' => 'Bonjour, je souhaite une visite technique (300 Dhs).',
                'included' => [
                    ['title' => 'Mesure de la pièce', 'icon' => 'ruler'],
                    ['title' => 'Choix de la puissance', 'icon' => 'bolt'],
                    ['title' => 'Emplacement des unités', 'icon' => 'pin'],
                    ['title' => 'Liste du matériel', 'icon' => 'list'],
                ],
                'steps' => [
                    ['title' => 'Demande', 'text' => 'Par téléphone, WhatsApp ou formulaire.'],
                    ['title' => 'Visite technique', 'text' => '300 Dhs, chez vous ou sur le chantier.'],
                    ['title' => 'Devis', 'text' => 'Appareil, matériel et pose.'],
                    ['title' => 'Installation', 'text' => 'Par nos techniciens.'],
                ],
                'prices' => [['label' => 'Visite technique', 'value' => '300 Dhs']],
                'show_supplies' => true,
                'faq' => [
                    ['Combien coûte la visite ?', '300 Dhs.'],
                    ['Que se passe-t-il après la visite ?', 'Nous vous envoyons un devis avec l’appareil conseillé, le matériel et la pose.'],
                ],
            ],
            [
                'slug' => 'service-apres-vente', 'name' => 'Service après-vente',
                'h1' => 'Service après-vente',
                'hero_text' => 'Une panne ou une question après l’achat : nos techniciens vous répondent.',
                'whatsapp_text' => 'Bonjour, je souhaite une intervention du service après-vente.',
                'included' => [
                    ['title' => 'Diagnostic', 'icon' => 'wrench'],
                    ['title' => 'Réparation', 'icon' => 'gear'],
                    ['title' => 'Pièces de rechange', 'icon' => 'box'],
                    ['title' => 'Conseil par téléphone', 'icon' => 'phone'],
                ],
                'steps' => [
                    ['title' => 'Contact', 'text' => 'Appelez-nous ou écrivez sur WhatsApp.'],
                    ['title' => 'Diagnostic', 'text' => 'Nous identifions la panne.'],
                    ['title' => 'Devis', 'text' => 'Si une intervention est nécessaire.'],
                    ['title' => 'Intervention', 'text' => 'Par nos techniciens.'],
                ],
                'prices' => [['label' => 'Intervention', 'value' => 'Sur devis']],
                'show_supplies' => false,
                'faq' => [
                    ['Comment joindre le service après-vente ?', 'Au 0666-854184 ou sur WhatsApp, du lundi au samedi de 9h à 19h.'],
                ],
            ],
        ];

        foreach ($services as $position => $s) {
            $page = ServicePage::query()->updateOrCreate(['slug' => $s['slug']], [
                'name' => $s['name'],
                'hero_text' => $s['hero_text'],
                'included' => $s['included'],
                'steps' => $s['steps'],
                'prices' => $s['prices'],
                'show_supplies' => $s['show_supplies'],
                'whatsapp_text' => $s['whatsapp_text'],
                'position' => $position,
                'is_published' => true,
            ]);
            $page->seo()->updateOrCreate([], ['title' => $s['h1'], 'h1' => $s['h1']]);
            $page->products()->sync($s['show_supplies'] ? $this->positions($supplies) : []);
            $this->faq($page, $s['faq']);
        }
    }

    private function sectors(): void
    {
        $sectors = [
            ['hotels-riads', 'Hôtels et riads', 'Confort silencieux dans chaque chambre', '#DCE8F5'],
            ['restaurants', 'Restaurants et cafés', 'Salle fraîche, cuisine ventilée', '#FCE6D6'],
            ['bureaux', 'Bureaux et open spaces', 'Une température stable toute la journée', '#E8EFF8'],
            ['commerces', 'Commerces et boutiques', 'Accueillir vos clients au frais', '#FDF0E6'],
            ['ecoles', 'Écoles et crèches', 'Des salles de classe confortables', '#DCE8F5'],
            ['cliniques', 'Cliniques et cabinets', 'Air maîtrisé pour vos patients', '#FCE6D6'],
            ['villas', 'Villas et résidences', 'Climatisation discrète, pièce par pièce', '#E8EFF8'],
            ['chambres-froides', 'Chambres froides', 'Froid commercial pour la conservation', '#FDF0E6'],
        ];
        $scenes = ['hotels-riads' => 'hotel', 'restaurants' => 'resto', 'bureaux' => 'bureau', 'commerces' => 'shop', 'ecoles' => 'ecole',
            'cliniques' => 'clinique', 'villas' => 'villa', 'chambres-froides' => 'froid'];

        foreach ($sectors as $position => [$slug, $name, $tagline, $bg]) {
            SectorPage::query()->updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'tagline' => $tagline,
                'scene_key' => $scenes[$slug],
                'tile_bg' => $bg,
                'position' => $position,
                // Only the restaurant page has written content in the design.
                'is_published' => $slug === 'restaurants',
            ]);
        }

        $resto = SectorPage::query()->where('slug', 'restaurants')->firstOrFail();
        $resto->update([
            'hero_text' => 'Une salle agréable en plein été, une cuisine bien ventilée, une installation qui se fait oublier.',
            'intro' => 'Dans un restaurant, la climatisation travaille dur : la salle se remplit d\'un coup, la cuisine dégage de la chaleur et les portes s\'ouvrent sans arrêt. Nous choisissons avec vous les appareils, la ventilation et l\'emplacement des unités pour que la salle reste agréable sans gêner le service.',
            'problems' => [
                ['title' => 'Forte affluence', 'text' => 'La salle se remplit d’un coup aux heures de service.', 'icon' => 'crowd'],
                ['title' => 'Chaleur de la cuisine', 'text' => 'Fours et plaques réchauffent l’air en continu.', 'icon' => 'heat'],
                ['title' => 'Portes souvent ouvertes', 'text' => 'L’air frais s’échappe à chaque passage.', 'icon' => 'door'],
                ['title' => 'Bruit et esthétique en salle', 'text' => 'Des unités discrètes, peu visibles et silencieuses.', 'icon' => 'quiet'],
            ],
            'solutions' => [
                ['title' => 'Cassette', 'text' => 'Au plafond, l’air est diffusé sur quatre côtés : adapté aux grandes salles.', 'art' => 'cassette', 'bg' => '#E8EFF8', 'cta' => 'Voir les cassettes', 'category_path' => 'climatisation/cassette'],
                ['title' => 'Gainable', 'text' => 'Invisible, intégré au faux plafond, avec des grilles discrètes.', 'art' => 'gainable', 'bg' => '#FDF0E6', 'cta' => 'Voir les gainables', 'category_path' => 'climatisation/gainable'],
                ['title' => 'Mural Inverter', 'text' => 'Pour une petite salle ou un comptoir, simple à installer.', 'art' => 'mural', 'bg' => '#DCE8F5', 'cta' => 'Voir les climatiseurs muraux', 'category_path' => 'climatisation/mural'],
            ],
            'range_tiles' => [
                ['title' => 'Ventilation', 'text' => 'Ventilateurs de gaine pour l’extraction de la cuisine et le renouvellement d’air.', 'cta' => 'Voir la ventilation', 'category_path' => 'ventilation', 'bg' => '#E8EFF8', 'art' => 'vent'],
                ['title' => 'Gaines', 'text' => 'Gaines circulaires et flexibles pour relier les bouches et l’extraction.', 'cta' => 'Voir les gaines', 'category_path' => 'gaines', 'bg' => '#FDF0E6', 'art' => 'flex'],
            ],
            'image_band' => [
                ['caption' => 'La salle', 'bg' => '#FCE6D6', 'scene' => 'resto'],
                ['caption' => 'L’accueil', 'bg' => '#DCE8F5', 'image' => null, 'alt' => 'Espace d’accueil climatisé'],
                ['caption' => 'Le comptoir', 'bg' => '#E8EFF8', 'scene' => 'shop'],
            ],
            'quote_title' => 'Demander un devis pour votre restaurant',
            'whatsapp_text' => 'Bonjour, je souhaite un devis de climatisation pour un restaurant.',
        ]);
        $resto->seo()->updateOrCreate([], [
            'title' => 'Climatisation pour restaurants et cafés au Maroc',
            'h1' => 'Climatisation pour restaurants et cafés au Maroc',
        ]);
        // "Produits recommandés" (design order). The Carrier Gainable On/Off 60000 of the design is the
        // catalogue family "Carrier Gainable Normal ON/OFF 410A".
        $resto->products()->sync($this->positions($this->productIds(['ATNW18GPLS1', 'ABNW36GM2S1.ENWBME', '42QSS060NS-1', 'D24AKH-N'])));
        $this->faq($resto, [
            ['Quelle climatisation pour une grande salle ?', 'La cassette ou le gainable répartissent l’air dans toute la salle. Le choix dépend du plafond et de la surface : la visite technique permet de trancher.'],
            ['Faut-il traiter la cuisine à part ?', 'Oui. La cuisine a besoin d’extraction et de ventilation en plus de la climatisation de la salle.'],
            ['Combien coûte la visite technique ?', '300 Dhs. Le devis détaillé suit la visite.'],
        ]);
    }

    private function blog(): void
    {
        $categories = [
            ['guides', 'Guides d’achat', 'Puissance, technologie, type d’appareil : les repères pour choisir le bon équipement.'],
            ['conseils', 'Conseils d’utilisation', 'Réglages, entretien et économies d’énergie au quotidien.'],
            ['installation', 'Installation', 'Cuivre, gaz, supports : ce qu’il faut savoir avant la pose.'],
            ['pros', 'Professionnels', 'Restaurants, hôtels, bureaux : les points clés d’un projet.'],
        ];
        $ids = [];
        foreach ($categories as $position => [$slug, $name, $description]) {
            $ids[$slug] = ArticleCategory::query()->updateOrCreate(['slug' => $slug], ['name' => $name, 'description' => $description, 'position' => $position])->id;
        }

        // [slug, title, category, minutes, cover bg, art key]. Only the first one has written content.
        $articles = [
            ['quelle-puissance-de-climatiseur-pour-ma-piece', 'Quelle puissance de climatiseur pour ma pièce ?', 'guides', 6, '#DCE8F5', 'mural'],
            ['climatiseur-inverter-ou-on-off', 'Climatiseur Inverter ou On/Off : lequel choisir ?', 'guides', 5, '#E8EFF8', 'mural'],
            ['mural-gainable-ou-cassette', 'Mural, gainable ou cassette : quel climatiseur choisir ?', 'guides', 7, '#FDF0E6', 'cassette'],
            ['r32-ou-r410a-gaz-frigorigenes', 'R32 ou R410A : comprendre les gaz frigorigènes', 'installation', 5, '#DCE8F5', 'gaz'],
            ['reduire-la-consommation-du-climatiseur', 'Comment réduire la consommation de son climatiseur', 'conseils', 4, '#FCE6D6', 'remote'],
            ['entretien-climatiseur', 'Entretien d’un climatiseur : ce qu’il faut faire chaque année', 'conseils', 5, '#E8EFF8', 'mural'],
            ['chauffe-eau-solaire-quelle-capacite', 'Chauffe-eau solaire : quelle capacité pour ma famille ?', 'guides', 5, '#FDF0E6', 'solaire'],
            ['quel-diametre-de-cuivre', 'Quel diamètre de cuivre pour quel climatiseur ?', 'installation', 4, '#FCE6D6', 'duo'],
            ['climatiser-un-restaurant-erreurs', 'Climatiser un restaurant : les erreurs à éviter', 'pros', 6, '#DCE8F5', null],
        ];
        foreach ($articles as $position => [$slug, $title, $category, $minutes, $bg, $art]) {
            Article::query()->updateOrCreate(['slug' => $slug], [
                'article_category_id' => $ids[$category],
                'title' => $title,
                'reading_time' => $minutes,
                'cover_bg' => $bg,
                'art_key' => $art,
                'position' => $position,
                'is_published' => false,
            ]);
        }

        $puissance = Article::query()->where('slug', 'quelle-puissance-de-climatiseur-pour-ma-piece')->firstOrFail();
        $puissance->update([
            'excerpt' => 'Surface, ensoleillement, étage : la méthode simple pour choisir entre 9 000, 12 000, 18 000 et 24 000 BTU, avec le tableau des puissances.',
            'body' => $this->puissanceBody(),
            'is_published' => true,
            // The design shows a "[DATE]" placeholder: the real publication date is set in the back office.
            'published_at' => null,
        ]);
        $puissance->seo()->updateOrCreate([], ['title' => 'Quelle puissance de climatiseur pour ma pièce ?', 'h1' => 'Quelle puissance de climatiseur pour ma pièce ?']);

        // "Guides associés" (silo links). Unpublished articles are filtered out by the API.
        $links = [
            'climatisation' => ['quelle-puissance-de-climatiseur-pour-ma-piece', 'climatiseur-inverter-ou-on-off', 'mural-gainable-ou-cassette'],
            'climatisation/mural' => ['quelle-puissance-de-climatiseur-pour-ma-piece', 'climatiseur-inverter-ou-on-off', 'r32-ou-r410a-gaz-frigorigenes'],
            'cuivre-et-gaz' => ['quel-diametre-de-cuivre'],
            'chauffe-eau' => ['chauffe-eau-solaire-quelle-capacite'],
        ];
        foreach ($links as $path => $slugs) {
            $category = Category::query()->where('path', $path)->firstOrFail();
            $this->linkArticles($category, $slugs);
        }
        $this->linkArticles(SectorPage::query()->where('slug', 'restaurants')->firstOrFail(), ['climatiser-un-restaurant-erreurs']);
    }

    /** @return list<array<string, mixed>> content blocks of the published article (design text, verbatim) */
    private function puissanceBody(): array
    {
        return $this->blocks([
            ['type' => 'callout', 'title' => 'En bref', 'items' => [
                'Comptez environ 600 BTU par m² de pièce.',
                '12 000 BTU couvrent une pièce jusqu\'à 20 m².',
                'Prenez la puissance au-dessus si la pièce est très ensoleillée ou sous le toit.',
            ]],
            ['type' => 'paragraph', 'text' => 'La puissance d\'un climatiseur se mesure en BTU. Trop faible, l\'appareil tourne sans arrêt sans jamais rafraîchir la pièce. Trop forte, il coûte plus cher à l\'achat et refroidit par à-coups. Bonne nouvelle : pour une pièce d\'habitation, le calcul tient en une ligne.'],
            ['type' => 'h2', 'id' => 'regle', 'text' => 'La règle simple : 600 BTU par m²'],
            ['type' => 'paragraph', 'text' => 'Multipliez la surface de la pièce par 600. Une chambre de 15 m² demande environ 9 000 BTU, un salon de 20 m² environ 12 000 BTU. Cette règle vaut pour une hauteur sous plafond classique, autour de 2,5 m, et une exposition moyenne.'],
            ['type' => 'figure', 'product_sku' => 'D13AJH.N', 'alt' => 'Climatiseur mural LG Dual Inverter', 'caption' => 'Un climatiseur mural LG Dual Inverter. La puissance figure dans le nom du modèle : 9 000, 12 000, 18 000 ou 24 000 BTU.'],
            ['type' => 'calculator'],
            ['type' => 'h2', 'id' => 'tableau', 'text' => 'Tableau des puissances'],
            ['type' => 'paragraph', 'text' => 'Les correspondances ci-dessous valent pour une pièce à exposition moyenne.'],
            ['type' => 'power_table'],
            ['type' => 'h2', 'id' => 'au-dessus', 'text' => 'Quand prendre la puissance au-dessus'],
            ['type' => 'paragraph', 'text' => 'Certaines pièces chauffent plus que d\'autres. Dans ces cas, choisissez la puissance supérieure à celle du tableau.'],
            ['type' => 'h3', 'text' => 'Pièce très ensoleillée'],
            ['type' => 'paragraph', 'text' => 'Grandes baies vitrées, façade plein sud ou ouest : le soleil de l\'après-midi ajoute beaucoup de chaleur.'],
            ['type' => 'h3', 'text' => 'Dernier étage'],
            ['type' => 'paragraph', 'text' => 'Sous un toit ou une terrasse, le plafond accumule la chaleur toute la journée et la restitue le soir.'],
            ['type' => 'h3', 'text' => 'Cuisine ouverte'],
            ['type' => 'paragraph', 'text' => 'Si le salon donne sur la cuisine, la cuisson réchauffe l\'ensemble de l\'espace. Comptez la surface totale.'],
            ['type' => 'h3', 'text' => 'Grande hauteur sous plafond'],
            ['type' => 'paragraph', 'text' => 'Au-delà de 2,5 m, le volume d\'air à refroidir augmente. Un riad ou une villa avec double hauteur demande plus de puissance.'],
            ['type' => 'tip', 'title' => 'Astuce', 'text' => 'Hésitez entre deux puissances ? Avec un modèle Inverter, la puissance supérieure reste économe : l\'appareil ralentit une fois la température atteinte.'],
            ['type' => 'paragraph', 'text' => 'Pour une pièce de 15 à 20 m², ces deux modèles 12 000 BTU sont parmi les plus demandés :'],
            ['type' => 'products', 'skus' => ['D13AJH.N', 'FSW12T24PM/N']],
            ['type' => 'h2', 'id' => 'inverter', 'text' => 'Inverter ou On/Off'],
            ['type' => 'paragraph', 'text' => 'Un climatiseur On/Off fonctionne à pleine puissance puis s\'arrête, et ainsi de suite. Un modèle Inverter fait varier la vitesse de son compresseur : il refroidit vite, puis maintient la température en douceur.'],
            ['type' => 'paragraph', 'text' => 'Résultat : moins de bruit, une température plus stable et une consommation réduite. Pour une pièce occupée tous les jours, l\'Inverter est le meilleur choix. L\'On/Off reste une option économique à l\'achat pour une pièce utilisée de temps en temps.'],
        ]);
    }

    private function pages(): void
    {
        $about = Page::query()->updateOrCreate(['slug' => 'a-propos'], [
            'title' => 'À propos',
            'kind' => PageKind::About,
            'intro' => 'Un fournisseur de climatisation et de froid, deux magasins à Marrakech et une boutique en ligne qui livre partout au Maroc.',
            'body' => $this->blocks([
                ['type' => 'paragraph', 'text' => 'Climatisation Maroc est la boutique en ligne d\'Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008. Nous vendons et installons tous types de systèmes de climatisation, pour les professionnels comme pour les particuliers, à Marrakech et dans les autres villes du Maroc.'],
                ['type' => 'services', 'items' => [
                    ['title' => 'Vente en ligne', 'text' => 'Climatiseurs, chauffe-eau, ventilation, cuivre et pièces, livrés partout au Maroc.', 'icon' => 'cart', 'href' => '/climatisation'],
                    ['title' => 'Installation', 'text' => 'Pose et mise en service par nos techniciens, sur devis.', 'icon' => 'wrench', 'href' => '/services/installation'],
                    ['title' => 'Service après-vente', 'text' => 'Diagnostic, réparation et pièces de rechange.', 'icon' => 'sav', 'href' => '/services/service-apres-vente'],
                    ['title' => 'Projets professionnels', 'text' => 'Hôtels, restaurants, bureaux : étude, fourniture et installation.', 'icon' => 'crane', 'href' => '/solutions'],
                ]],
                ['type' => 'commitments', 'items' => [
                    ['text' => 'Livraison gratuite partout au Maroc', 'icon' => 'truck'],
                    ['text' => 'Paiement à la livraison', 'icon' => 'cash'],
                    ['text' => 'Solutions clés en main sous 48 h ouvrées', 'icon' => 'clock'],
                    ['text' => 'Marques officielles', 'icon' => 'badge'],
                ]],
            ]),
            'is_published' => true,
        ]);
        $about->seo()->updateOrCreate([], ['title' => 'À propos · Ariha Froid', 'h1' => 'Ariha Froid, la climatisation à Marrakech depuis 2008']);

        $delivery = Page::query()->updateOrCreate(['slug' => 'livraison-et-paiement'], [
            'title' => 'Livraison et paiement',
            'kind' => PageKind::Delivery,
            'intro' => 'Vous commandez en ligne ou par WhatsApp, nous livrons gratuitement partout au Maroc et vous payez à la réception.',
            'body' => $this->blocks([
                ['type' => 'promises', 'items' => [
                    ['title' => 'Livraison gratuite partout au Maroc', 'text' => 'Pour toutes les commandes, dans toutes les villes.', 'icon' => 'truck', 'bg' => '#DCE8F5'],
                    ['title' => 'Paiement à la livraison', 'text' => 'Vous réglez à la réception de votre commande. Rien à payer en ligne.', 'icon' => 'cash', 'bg' => '#FCE6D6'],
                    ['title' => 'Installation par nos techniciens (sur devis)', 'text' => 'Pose, raccordement et mise en service. Visite technique : 300 Dhs.', 'icon' => 'wrench', 'bg' => '#E8EFF8'],
                ]],
                ['type' => 'steps', 'title' => 'Comment se passe une commande', 'items' => [
                    ['title' => 'Commande en ligne ou par WhatsApp', 'text' => 'Ajoutez vos produits au panier ou écrivez-nous au 0666-854184.'],
                    ['title' => 'Appel de confirmation', 'text' => 'Nous vous appelons pour confirmer la commande et l’adresse.'],
                    ['title' => 'Livraison', 'text' => 'Gratuite, à l’adresse indiquée.'],
                    ['title' => 'Paiement à la réception', 'text' => 'Vous réglez au livreur à la réception.'],
                ]],
                // The design's "[DÉLAI PAR VILLE]" and "[CONDITIONS DE RETOUR]" placeholders are not seeded:
                // lead times per city and return terms come from the owner (never shown as placeholders).
                ['type' => 'info', 'title' => 'Délais de livraison', 'text' => 'Le délai dépend de votre ville. Il vous est confirmé lors de l\'appel de confirmation.'],
                ['type' => 'info', 'title' => 'Retours et garantie', 'link' => ['label' => 'Contacter le service après-vente →', 'href' => '/services/service-apres-vente']],
            ]),
            'is_published' => true,
        ]);
        $delivery->seo()->updateOrCreate([], ['title' => 'Livraison et paiement', 'h1' => 'Livraison et paiement']);
        $this->faq($delivery, [
            ['La livraison est-elle vraiment gratuite ?', 'Oui, la livraison est gratuite partout au Maroc.'],
            ['Comment payer ?', 'Vous payez à la livraison, à la réception de votre commande.'],
            ['L’installation est-elle comprise ?', 'Non. La pose est réalisée par nos techniciens sur devis. La visite technique coûte 300 Dhs.'],
            ['Comment suivre ma commande ?', 'Avec la référence reçue à la commande et votre numéro de téléphone, sur la page Suivre ma commande.'],
        ]);

        // Holds the FAQ of /espace-professionnel (the page layout itself is in the front office).
        $pro = Page::query()->updateOrCreate(['slug' => 'espace-professionnel'], [
            'title' => 'Espace professionnel',
            'kind' => PageKind::Other,
            'intro' => 'Installateurs, revendeurs et projets : vos prix, votre stock et vos commandes au même endroit.',
            'is_published' => true,
        ]);
        $this->faq($pro, [
            ['Qui peut ouvrir un compte ?', 'Les installateurs, revendeurs, bureaux d’études et promoteurs, sur présentation de leur ICE.'],
            ['Comment mon compte est-il validé ?', 'Après votre demande, notre équipe vous contacte pour vérifier les informations et activer l’accès.'],
            ['Puis-je commander par téléphone ?', 'Oui, au 0666-602599 ou sur WhatsApp, du lundi au samedi de 9h à 19h.'],
        ]);

        // Legal pages: article headings from the design; the legal text itself is not written yet,
        // so the pages stay unpublished (decision of 2026-10-06).
        $legal = [
            ['cgv', 'Conditions générales de vente', ['Objet', 'Produits et disponibilité', 'Commandes', 'Prix', 'Paiement à la livraison', 'Livraison', 'Installation et visite technique', 'Rétractation et retours', 'Garantie', 'Service après-vente', 'Données personnelles', 'Droit applicable et litiges']],
            ['cgu', 'Conditions générales d’utilisation', ['Objet', 'Accès au site', 'Compte professionnel', 'Propriété intellectuelle', 'Responsabilité', 'Liens externes', 'Modification des conditions']],
            ['informations-legales', 'Informations légales', ['Éditeur du site', 'Hébergement', 'Directeur de la publication', 'Contact']],
            ['securite', 'Sécurité', ['Protection des données', 'Paiement', 'Comptes et mots de passe', 'Signaler un problème']],
            ['confidentialite', 'Politique de confidentialité', ['Données collectées', 'Utilisation des données', 'Durée de conservation', 'Partage des données', 'Cookies', 'Vos droits', 'Contact']],
        ];
        foreach ($legal as $position => [$slug, $title, $articles]) {
            $page = Page::query()->firstOrNew(['slug' => $slug]);
            $page->fill([
                'title' => $title,
                'kind' => PageKind::Legal,
                'intro' => 'Les présentes conditions s\'appliquent aux commandes passées sur Climatisation Maroc, boutique en ligne de la société Ariha Froid, Marrakech.',
                'position' => $position,
            ]);
            if (! $page->exists) {
                $page->body = array_map(fn (string $t) => ['type' => 'article', 'data' => ['title' => $t, 'text' => '[TEXTE JURIDIQUE]']], $articles);
                $page->is_published = false;
            }
            $page->save();
            $page->seo()->updateOrCreate([], ['title' => $title, 'h1' => $title]);
        }
    }

    /**
     * Converts flat blocks (['type' => 'h2', 'text' => …]) to the Filament Builder format
     * (['type' => 'h2', 'data' => ['text' => …]]) used by the back office and the API.
     *
     * @param  list<array<string, mixed>>  $blocks
     * @return list<array{type: string, data: array<string, mixed>}>
     */
    private function blocks(array $blocks): array
    {
        return array_map(function (array $block) {
            $type = $block['type'];
            unset($block['type']);

            return ['type' => $type, 'data' => $block];
        }, $blocks);
    }

    /** @param list<array{0: string, 1: string}> $items */
    private function faq(Model $model, array $items): void
    {
        foreach ($items as $i => [$question, $answer]) {
            $model->faqItems()->updateOrCreate(['question' => $question], ['answer' => $answer, 'position' => $i]); // @phpstan-ignore method.notFound
        }
    }

    /** @param list<string> $slugs */
    private function linkArticles(Model $model, array $slugs): void
    {
        $ids = Article::query()->whereIn('slug', $slugs)->pluck('id', 'slug');
        $sync = [];
        foreach ($slugs as $i => $slug) {
            $sync[$ids[$slug]] = ['position' => $i];
        }
        $model->articles()->sync($sync); // @phpstan-ignore method.notFound
    }

    /**
     * Product ids of the families holding these SKUs, in the given order.
     *
     * @param  list<string>  $skus
     * @return list<int>
     */
    private function productIds(array $skus): array
    {
        $map = ProductVariant::query()->whereIn('sku', $skus)->pluck('product_id', 'sku');

        return array_values(array_filter(array_map(fn ($sku) => $map[$sku] ?? null, $skus)));
    }

    /**
     * @param  list<int>  $ids
     * @return array<int, array{position: int}>
     */
    private function positions(array $ids): array
    {
        $sync = [];
        foreach ($ids as $i => $id) {
            $sync[$id] = ['position' => $i];
        }

        return $sync;
    }
}
