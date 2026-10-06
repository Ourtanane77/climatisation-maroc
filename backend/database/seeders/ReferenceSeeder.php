<?php

namespace Database\Seeders;

use App\Enums\CategoryTemplate;
use App\Models\Brand;
use App\Models\Category;
use App\Models\City;
use App\Models\CityPage;
use App\Support\Catalog\CatalogImporter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Cities, brands and the category tree. Names, intros and tile texts come from the design files;
 * old category ids (for redirects) from data/catalog.json.
 */
class ReferenceSeeder extends Seeder
{
    /** City select list of the design forms, in order. */
    private const CITIES = ['Agadir', 'Béni Mellal', 'Casablanca', 'El Jadida', 'Essaouira', 'Fès', 'Kénitra', 'Marrakech', 'Meknès',
        'Mohammedia', 'Ouarzazate', 'Oujda', 'Rabat', 'Safi', 'Salé', 'Tanger', 'Tétouan'];

    /** Cities of the "Villes" silo (Structure et navigation board); pages stay unpublished until written. */
    private const CITY_PAGES = ['Marrakech', 'Casablanca', 'Rabat', 'Agadir', 'Tanger', 'Fès'];

    public function run(): void
    {
        $this->cities();
        $this->brands();
        $this->categories();
    }

    private function cities(): void
    {
        foreach (self::CITIES as $i => $name) {
            City::query()->updateOrCreate(['slug' => Str::slug($name)], ['name' => $name, 'position' => $i]);
        }
        City::query()->updateOrCreate(['slug' => 'autre-ville'], ['name' => 'Autre ville', 'position' => 99, 'is_other' => true]);

        foreach (self::CITY_PAGES as $name) {
            $city = City::query()->where('slug', Str::slug($name))->firstOrFail();
            CityPage::query()->firstOrCreate(['city_id' => $city->id], ['slug' => $city->slug, 'is_published' => false]);
        }
    }

    private function brands(): void
    {
        // Design order (Accueil marquee, Espace professionnel), then the other catalogue brands.
        $designOrder = ['lg', 'carrier', 'ciat', 'fitco', 'simsek', 'gs', 'lafarga', 'alpha', 'arfro'];
        $aspect = ['lg' => 2.05, 'carrier' => 2.52, 'ciat' => 2.01, 'fitco' => 0.69, 'simsek' => 3.47, 'gs' => 1.23, 'lafarga' => 4.64, 'alpha' => 3.09, 'arfro' => 3.38];
        $caption = ['lg' => 'Climatisation', 'carrier' => 'Climatisation', 'ciat' => 'Climatisation', 'fitco' => 'Climatisation', 'simsek' => 'Chauffe-eau'];

        $catalogBrands = CatalogImporter::make()->load()['brands'];
        $disk = Storage::disk('public');

        foreach ($catalogBrands as $b) {
            $slug = $b['slug'];
            $logo = null;
            $asset = resource_path("seed/brands/{$slug}.png");
            if (is_file($asset)) {
                $logo = "brands/{$slug}.png";
                $disk->put($logo, (string) file_get_contents($asset));
            }
            $position = array_search($slug, $designOrder, true);

            Brand::query()->updateOrCreate(['slug' => $slug], [
                'name' => $b['name'],
                'logo' => $logo,
                'logo_aspect' => $aspect[$slug] ?? null,
                'caption' => $caption[$slug] ?? null,
                'is_official_distributor' => $slug === 'lg',
                'intro' => $slug === 'lg'
                    ? 'Ariha Froid est distributeur officiel LG au Maroc. Muraux, gainables et cassettes Inverter, livrés gratuitement partout au Maroc et posés par nos techniciens sur devis.'
                    : null,
                'position' => $position === false ? 100 + (int) $b['id'] : $position,
                'is_active' => true,
            ]);
        }

        $lg = Brand::query()->where('slug', 'lg')->firstOrFail();
        $lg->seo()->updateOrCreate([], [
            'title' => 'Climatiseurs LG au Maroc · Distributeur officiel',
            'h1' => 'Climatiseurs LG au Maroc',
        ]);
    }

    private function categories(): void
    {
        // Old-site category ids, by new path (for 301 redirects of the old category URLs).
        $legacy = [];
        foreach (CatalogImporter::make()->load()['categories'] as $c) {
            $path = config('catalog.category_map')[$c['slug']] ?? null;
            if ($path && $c['legacy_id'] !== null) {
                $legacy[$path] = $c['legacy_id'];
            }
        }

        $tree = [
            ['climatisation', 'Climatisation', null, CategoryTemplate::Landing, [
                'icon' => 'unit', 'tile_bg' => '#DCE8F5',
                'intro' => 'Climatiseurs muraux, gainables, cassettes et consoles des marques LG, Carrier, CIAT et Fitco. Choisissez le type adapté à votre pièce, puis la puissance selon la surface : environ 600 BTU par m², une taille au-dessus pour une pièce très ensoleillée.',
                'seo' => ['title' => 'Climatisation et climatiseurs au Maroc', 'h1' => 'Climatisation et climatiseurs au Maroc'],
                'faq' => [
                    ['Quelle puissance choisir ?', 'Environ 600 BTU par m² : 9 000 BTU jusqu’à 15 m², 12 000 jusqu’à 20 m², 18 000 jusqu’à 30 m², 24 000 jusqu’à 40 m², 30 000 et plus au-delà. Une taille au-dessus pour une pièce très ensoleillée ou au dernier étage.'],
                    ['La livraison est-elle gratuite ?', 'Oui, partout au Maroc, sous 48 heures.'],
                    ['Proposez-vous la pose ?', 'Oui, par nos propres techniciens, sur devis.'],
                ],
            ], [
                ['mural', 'Climatiseurs muraux', 'Mural', CategoryTemplate::Listing, [
                    'art_key' => 'mural', 'tile_bg' => '#DCE8F5', 'tile_text' => 'Le plus courant, pour une chambre ou un salon.',
                    'intro' => 'Le climatiseur mural se fixe au mur de la pièce et se raccorde à une unité extérieure. C\'est la solution la plus simple pour une chambre, un salon ou un bureau.',
                    'body' => 'Un climatiseur mural Inverter ajuste sa vitesse au besoin réel de la pièce : il consomme moins qu\'un modèle On/Off et garde une température plus stable. Les modèles LG Dual Inverter sont classés tropical T3 pour les fortes chaleurs et se pilotent en Wi-Fi avec LG ThinQ. Livraison gratuite partout au Maroc, paiement à la livraison et pose par nos techniciens sur devis.',
                    'seo' => ['title' => 'Climatiseurs muraux', 'h1' => 'Climatiseurs muraux'],
                ]],
                ['gainable', 'Gainable', 'Gainable', CategoryTemplate::Listing, ['art_key' => 'gainable', 'tile_bg' => '#FCE6D6', 'tile_text' => 'Invisible, intégré au faux plafond.']],
                ['cassette', 'Cassette', 'Cassette', CategoryTemplate::Listing, ['art_key' => 'cassette', 'tile_bg' => '#E8EFF8', 'tile_text' => 'Au plafond, diffusion sur quatre côtés.']],
                ['console-armoire', 'Console et armoire', 'Console et armoire', CategoryTemplate::Listing, ['art_key' => 'console', 'tile_bg' => '#FDF0E6', 'tile_text' => 'Au sol, pour les grands volumes.']],
            ]],
            ['chauffe-eau', 'Chauffe-eau', null, CategoryTemplate::Landing, ['icon' => 'drop', 'tile_bg' => '#FCE6D6', 'art_key' => 'solaire'], [
                ['electrique', 'Chauffe-eau électrique', 'Électrique', CategoryTemplate::Listing, ['art_key' => 'solaire']],
                ['gaz', 'Chauffe-eau à gaz', 'À gaz', CategoryTemplate::Listing, ['art_key' => 'solaire']],
                ['solaire', 'Chauffe-eau solaire', 'Solaire', CategoryTemplate::Listing, ['art_key' => 'solaire']],
                ['chaudiere', 'Chaudière', 'Chaudière', CategoryTemplate::Listing, ['art_key' => 'solaire']],
            ]],
            ['ventilation', 'Ventilation', null, CategoryTemplate::Landing, ['icon' => 'fan', 'tile_bg' => '#E8EFF8', 'art_key' => 'vent', 'tile_text' => 'Ventilateurs de gaine · Multizone'], [
                ['ventilateurs-de-gaine', 'Ventilateurs de gaine', null, CategoryTemplate::Listing, ['art_key' => 'vent']],
                ['multizone', 'Multizone', null, CategoryTemplate::Listing, ['art_key' => 'vent']],
                ['grilles-et-diffuseurs', 'Grilles et diffuseurs', null, CategoryTemplate::Listing, []],
            ]],
            ['gaines', 'Gaines circulaires', 'Gaines', CategoryTemplate::Landing, ['icon' => 'duct', 'tile_bg' => '#FDF0E6', 'art_key' => 'flex', 'tile_text' => 'Gaines circulaires · Flexibles'], [
                ['flexibles-souples', 'Flexibles souples', null, CategoryTemplate::Listing, ['art_key' => 'flex']],
                ['flexibles-isoles', 'Flexibles isolés', null, CategoryTemplate::Listing, ['art_key' => 'flex']],
            ]],
            ['cuivre-et-gaz', 'Cuivre et gaz', null, CategoryTemplate::Dense, [
                'icon' => 'coil', 'tile_bg' => '#FCE6D6', 'art_key' => 'duo', 'tile_text' => 'Cuivre · Kits duo · Gaz',
                'intro' => 'Tubes cuivre, kits duo, isolant et gaz frigorifique pour l\'installation de vos climatiseurs.',
                'seo' => ['title' => 'Cuivre et gaz', 'h1' => 'Cuivre et gaz'],
            ], [
                ['cuivre', 'Cuivre', null, CategoryTemplate::Dense, ['art_key' => 'coilL']],
                ['kits-duo', 'Kits duo', null, CategoryTemplate::Dense, ['art_key' => 'duo']],
                ['isolant', 'Isolant', null, CategoryTemplate::Dense, ['art_key' => 'iso']],
                ['gaz-frigorifique', 'Gaz frigorifique', null, CategoryTemplate::Dense, ['art_key' => 'gaz']],
            ]],
            ['pieces-de-rechange', 'Pièces de rechange', null, CategoryTemplate::Dense, ['icon' => 'gear', 'tile_bg' => '#DCE8F5', 'art_key' => 'remote', 'tile_text' => 'Télécommandes · Supports'], [
                ['telecommandes', 'Télécommandes', null, CategoryTemplate::Dense, ['art_key' => 'remote']],
                ['supports', 'Supports', null, CategoryTemplate::Dense, ['art_key' => 'support']],
                ['adhesifs-et-mastics', 'Adhésifs et mastics', null, CategoryTemplate::Dense, ['art_key' => 'scotch']],
                ['trappes-de-visite', 'Trappes de visite', null, CategoryTemplate::Dense, []],
                ['outillage', 'Outillage', null, CategoryTemplate::Dense, []],
            ]],
            ['froid', 'Froid et chambres froides', 'Froid', CategoryTemplate::Landing, ['icon' => 'snow', 'is_quote_only' => true], []],
        ];

        foreach ($tree as $position => [$slug, $name, $short, $template, $attrs, $children]) {
            $parent = $this->category(null, $slug, $name, $short, $template, $attrs, $position, $legacy);
            foreach ($children as $childPosition => [$cSlug, $cName, $cShort, $cTemplate, $cAttrs]) {
                $this->category($parent, $cSlug, $cName, $cShort, $cTemplate, $cAttrs, $childPosition, $legacy);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $attrs
     * @param  array<string, int>  $legacy
     */
    private function category(?Category $parent, string $slug, string $name, ?string $short, CategoryTemplate $template, array $attrs, int $position, array $legacy): Category
    {
        $seo = $attrs['seo'] ?? null;
        $faq = $attrs['faq'] ?? [];
        unset($attrs['seo'], $attrs['faq']);
        $path = $parent ? "{$parent->path}/{$slug}" : $slug;

        $category = Category::query()->updateOrCreate(['path' => $path], [
            'parent_id' => $parent?->id,
            'slug' => $slug,
            'name' => $name,
            'short_name' => $short,
            'template' => $template,
            'position' => $position,
            'is_active' => true,
            'legacy_id' => $legacy[$path] ?? null,
            ...$attrs,
        ]);

        if ($seo) {
            $category->seo()->updateOrCreate([], $seo);
        }
        foreach ($faq as $i => [$question, $answer]) {
            $category->faqItems()->updateOrCreate(['question' => $question], ['answer' => $answer, 'position' => $i]);
        }

        return $category;
    }
}
