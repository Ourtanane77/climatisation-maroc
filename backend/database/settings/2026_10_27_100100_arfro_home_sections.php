<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Editorial home of arfro.com (owner's brief of 2026-10-27, docs/arfro-creative-brief.md): one
 * setting per section in group home_arfro, edited in « Page d’accueil — Arfro ». The French copy is
 * the owner's. Images: the site's own photos (`design_image`, frontend/public/design) where the
 * brief's decisions name one, the other slots stay empty (the section then uses its typographic
 * layout). Technology: only what the catalogue states (products.technology, refrigerant, wifi and
 * the LG Dual Inverter highlights). ARFRO Care: only the services offered today (installation on
 * quote, technical visit, advice), no maintenance or repair. Real projects and testimonials start
 * empty: those sections stay hidden until a published entry exists. Links to /services and
 * /solutions show only once arfro.com has published service or sector pages (ArfroHomeContent).
 * Climatisation Maroc (group home) is untouched. Each setting is added only when missing, so a
 * re-run or an environment already holding values keeps what the team edited.
 */
return new class extends SettingsMigration
{
    public function up(): void
    {
        foreach ($this->values() as $name => $value) {
            if (! $this->migrator->exists("home_arfro.{$name}")) {
                $this->migrator->add("home_arfro.{$name}", $value);
            }
        }
    }

    /** @return array<string, array<string, mixed>> */
    private function values(): array
    {
        return [
            'section_hero' => [
                'enabled' => true,
                'eyebrow' => 'ARFRO — Expert du confort climatique',
                'title' => 'Le confort qui change tout.',
                'text' => 'Des solutions pensées pour rafraîchir, chauffer et améliorer votre quotidien.',
                'cta_label' => 'Découvrir nos solutions',
                'cta_url' => '/climatisation',
                'secondary_label' => 'Trouver ma climatisation',
                'secondary_url' => '/calculateur-puissance',
                'image' => null,
                'design_image' => 'cover-ariha.png',
            ],
            'section_manifesto' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'Le confort ne se résume pas à une température.',
                'text' => 'C’est la sensation d’être parfaitement bien chez soi. C’est un environnement où l’on travaille mieux, où l’on se repose pleinement et où chaque instant devient plus agréable.',
                // « À propos » is published on Climatisation Maroc only: the button shows once the page is published on arfro.com.
                'cta_label' => 'Découvrir ARFRO',
                'cta_url' => '/a-propos',
                'image' => null,
                'design_image' => 'cover-ariha.png',
            ],
            'section_environments' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'À chaque espace, son confort.',
                'text' => null,
                'items' => [
                    ['key' => 'maison', 'title' => 'Maison', 'text' => 'Un confort sur mesure pour votre quotidien.', 'cta_label' => 'Explorer les solutions maison', 'cta_url' => '/climatisation/mural', 'image' => null, 'design_image' => 'cover-ariha.png'],
                    ['key' => 'bureaux', 'title' => 'Bureaux', 'text' => 'Des environnements pensés pour la performance.', 'cta_label' => 'Demander un devis', 'cta_url' => '/demander-un-devis', 'image' => null, 'design_image' => null],
                    ['key' => 'hotellerie', 'title' => 'Hôtellerie', 'text' => 'Une expérience de confort à la hauteur de vos invités.', 'cta_label' => 'Demander un devis', 'cta_url' => '/demander-un-devis', 'image' => null, 'design_image' => 'solutions-category.png'],
                    ['key' => 'restauration', 'title' => 'Restauration', 'text' => 'Le bien-être de vos clients commence par l’ambiance.', 'cta_label' => 'Demander un devis', 'cta_url' => '/demander-un-devis', 'image' => null, 'design_image' => null],
                ],
            ],
            'section_technology' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'La technologie au service de votre bien-être.',
                'text' => null,
                'image' => null,
                'design_image' => null,
                // Catalogue facts only, checked on 2026-10-27: products.technology = Inverter (LG,
                // Carrier, Fitco, CIAT muraux, gainables, cassettes), products.refrigerant = R32
                // (Carrier mural Inverter R32, Carrier Miroir, LG Jetcool, LG gainable R32),
                // products.wifi = « Wi-Fi LG ThinQ » and the highlights « Tropical T3 » and
                // « Silencieux » of the LG Dual Inverter (its own description says the same).
                'items' => [
                    ['icon' => 'inverter', 'title' => 'Technologie Inverter', 'text' => 'Le compresseur ajuste sa vitesse au besoin réel de la pièce : il consomme moins qu’un modèle On/Off et garde une température plus stable.', 'url' => '/climatisation/mural'],
                    ['icon' => 'refrigerant', 'title' => 'Fluide R32', 'text' => 'Des climatiseurs Carrier et LG fonctionnant au fluide frigorigène R32.', 'url' => '/produit/carrier-mural-inverter-r32'],
                    ['icon' => 'connected', 'title' => 'Wi-Fi LG ThinQ', 'text' => 'Le LG Dual Inverter se pilote depuis le téléphone avec l’application LG ThinQ.', 'url' => '/produit/lg-dual-inverter'],
                    ['icon' => 'climate', 'title' => 'Tropical T3', 'text' => 'Le LG Dual Inverter est classé tropical T3, pour les fortes chaleurs.', 'url' => '/produit/lg-dual-inverter'],
                    ['icon' => 'quiet', 'title' => 'Fonctionnement silencieux', 'text' => 'Le LG Dual Inverter refroidit vite, puis reste silencieux.', 'url' => '/produit/lg-dual-inverter'],
                ],
            ],
            'section_products' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'Des équipements sélectionnés pour votre confort.',
                'text' => null,
                'cta_label' => 'Voir toute la climatisation',
                'cta_url' => '/climatisation',
                // Category paths (one or several); a collection without a product stays hidden.
                'collections' => [
                    ['label' => 'Climatisation', 'category' => ['climatisation'], 'product_ids' => []],
                    ['label' => 'Chauffe-eau', 'category' => ['chauffe-eau'], 'product_ids' => []],
                    ['label' => 'Ventilation', 'category' => ['ventilation'], 'product_ids' => []],
                    // No « solutions » range in the catalogue: the ranges sold for offices, shops,
                    // hotels and restaurants (cassettes, gainables, consoles et armoires).
                    ['label' => 'Solutions professionnelles', 'category' => ['climatisation/cassette', 'climatisation/gainable', 'climatisation/console-armoire'], 'product_ids' => []],
                ],
            ],
            'section_care' => [
                'enabled' => true,
                'eyebrow' => 'ARFRO Care',
                'title' => 'Votre confort mérite un accompagnement durable.',
                'text' => null,
                'cta_label' => 'Découvrir nos services',
                'cta_url' => '/services',
                'image' => null,
                'design_image' => null,
                'items' => [
                    ['icon' => 'installation', 'title' => 'Installation', 'text' => 'Pose, raccordement et mise en service par nos techniciens, sur devis.', 'cta_label' => 'Demander un devis', 'cta_url' => '/demander-un-devis'],
                    ['icon' => 'visit', 'title' => 'Visite technique', 'text' => 'Un technicien se déplace, mesure la pièce et vous conseille la bonne puissance : {visite}.', 'cta_label' => 'Demander une visite', 'cta_url' => '{whatsapp}'],
                    ['icon' => 'advice', 'title' => 'Conseil', 'text' => 'Un conseiller vous répond au {telephone}, par téléphone ou WhatsApp. {horaires}.', 'cta_label' => 'Appeler un conseiller', 'cta_url' => '{telephone}'],
                ],
            ],
            'section_advisor' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'Le bon climatiseur. Pour le bon espace.',
                'text' => null,
            ],
            'section_projects' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'Le confort prend vie.',
                'text' => null,
                'items' => [],
            ],
            'section_business' => [
                'enabled' => true,
                'eyebrow' => 'ARFRO Business',
                'title' => 'La performance climatique au service de vos projets.',
                'text' => null,
                'cta_label' => 'Parler à un expert',
                'cta_url' => '/contact',
                'secondary_label' => 'Demander un devis',
                'secondary_url' => '/demander-un-devis',
                'image' => null,
                'design_image' => 'solutions-category.png',
                'items' => [
                    ['title' => 'Consultation', 'text' => null],
                    ['title' => 'Sélection des équipements', 'text' => null],
                    ['title' => 'Accompagnement technique', 'text' => null],
                    ['title' => 'Devis professionnels', 'text' => null],
                    ['title' => 'Grandes installations', 'text' => null],
                ],
            ],
            'section_brands' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'Des marques reconnues. Une expertise de confiance.',
                'text' => null,
            ],
            'section_trust' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'Votre confiance fait notre différence.',
                'text' => null,
                'items' => [
                    ['icon' => 'delivery', 'title' => 'Livraison gratuite partout au Maroc', 'text' => 'Le délai dépend de votre ville : il vous est confirmé lors de l’appel de confirmation.'],
                    ['icon' => 'payment', 'title' => 'Paiement à la livraison', 'text' => 'Vous réglez à la réception de votre commande{carte}.'],
                    ['icon' => 'installation', 'title' => 'Installation sur devis', 'text' => 'Pose par nos techniciens, sur devis.'],
                    ['icon' => 'support', 'title' => 'Un conseiller à votre écoute', 'text' => 'Par téléphone ou WhatsApp. {horaires}.'],
                ],
            ],
            'section_testimonials' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => null,
                'items' => [],
            ],
            'section_journal' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'Mieux comprendre le confort.',
                'text' => null,
                'cta_label' => 'Explorer nos conseils',
                'cta_url' => '/blog',
            ],
            'section_final' => [
                'enabled' => true,
                'eyebrow' => null,
                'title' => 'Le confort commence ici.',
                'text' => 'Avec ARFRO, chaque espace devient un lieu où il fait bon vivre.',
                'cta_label' => 'Découvrir nos solutions',
                'cta_url' => '/climatisation',
                'secondary_label' => 'Contacter ARFRO',
                'secondary_url' => '/contact',
                'image' => null,
                'design_image' => null,
            ],
        ];
    }
};
