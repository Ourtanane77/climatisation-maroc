<?php

namespace App\Filament\Pages;

use App\Models\Category;
use App\Models\Product;
use App\Settings\ArfroHomeSettings;
use App\Support\Home\ArfroHomeContent;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

/**
 * Home page of arfro.com: the shared form (hero, rails, brands, mega menu; own values in group
 * home_arfro, pickers limited to Arfro) plus one tab per section of the editorial home of the
 * owner's brief (docs/arfro-creative-brief.md). API: App\Support\Home\ArfroHomeContent.
 */
class ManageArfroHomeSettings extends ManageHomeSettings
{
    protected static string $settings = ArfroHomeSettings::class;

    protected static ?int $navigationSort = 1;

    /** Photo advice for full-width images. */
    private const WIDE = 'Format paysage, 2000 px de large au moins (2400 px idéal), WebP ou JPEG, moins de 1 Mo si possible.';

    /** Photo advice for half-width images. */
    private const HALF = 'Format paysage ou portrait, 1200 px de large au moins, WebP ou JPEG.';

    public static function siteKey(): string
    {
        return 'arfro';
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make()->columnSpanFull()->persistTabInQueryString()->tabs([
                Tab::make('Bandeau')->schema($this->section('section_hero', 'Bandeau principal (plein écran)', [
                    ...$this->cta('cta', 'Bouton principal', 'section_hero'),
                    ...$this->cta('secondary', 'Bouton secondaire', 'section_hero'),
                    ...$this->image('Photo plein écran : un intérieur marocain, la chaleur dehors, le confort dedans. '.self::WIDE, 'section_hero'),
                ])),
                Tab::make('Manifeste')->schema($this->section('section_manifesto', 'Manifeste', [
                    ...$this->cta('cta', 'Bouton', 'section_manifesto'),
                    ...$this->image('Photo d’architecture ou d’intérieur. '.self::HALF, 'section_manifesto'),
                ], longText: true)),
                Tab::make('Espaces')->schema($this->section('section_environments', 'À chaque espace, son confort', [
                    Repeater::make('section_environments.items')->label('Espaces')->columnSpanFull()->columns(2)->reorderable()->defaultItems(0)
                        ->addActionLabel('Ajouter un espace')->itemLabel(fn (array $state) => $state['title'] ?? null)->collapsible()
                        ->schema([
                            Select::make('key')->label('Type d’espace')->options(ArfroHomeContent::ENVIRONMENTS)->required(),
                            TextInput::make('title')->label('Titre')->required(),
                            Textarea::make('text')->label('Texte')->rows(2)->columnSpanFull(),
                            ...$this->cta('cta', 'Lien', inRepeater: true),
                            ...$this->image('Grande photo de l’espace. '.self::WIDE, inRepeater: true),
                        ]),
                ])),
                Tab::make('Technologie')->schema($this->section('section_technology', 'La technologie (section sombre)', [
                    ...$this->image('Photo produit détourée ou sur fond sombre (facultative). '.self::HALF, 'section_technology'),
                    Repeater::make('section_technology.items')->label('Technologies')->columnSpanFull()->columns(2)->reorderable()->defaultItems(0)
                        ->addActionLabel('Ajouter une technologie')->itemLabel(fn (array $state) => $state['title'] ?? null)->collapsible()
                        ->helperText('Uniquement ce que les fiches produits indiquent réellement (technologie, fluide, Wi-Fi…). Pas d’argument non vérifié.')
                        ->schema([
                            Select::make('icon')->label('Icône')->options(ArfroHomeContent::TECHNOLOGY_ICONS),
                            TextInput::make('title')->label('Titre')->required(),
                            Textarea::make('text')->label('Texte')->rows(2)->columnSpanFull(),
                            $this->urlInput('url', 'Lien vers un produit ou une gamme')->columnSpanFull(),
                        ]),
                ])),
                Tab::make('Produits')->schema($this->section('section_products', 'Des équipements sélectionnés', [
                    ...$this->cta('cta', 'Bouton', 'section_products'),
                    Repeater::make('section_products.collections')->label('Collections (onglets)')->columnSpanFull()->reorderable()->defaultItems(0)
                        ->addActionLabel('Ajouter une collection')->itemLabel(fn (array $state) => $state['label'] ?? null)->collapsible()
                        ->helperText('Les produits choisis passent en premier, la gamme complète la liste (8 produits au plus). Une collection sans produit est masquée.')
                        ->schema([
                            Grid::make(2)->schema([
                                TextInput::make('label')->label('Nom de l’onglet')->required(),
                                Select::make('category')->label('Gammes')->multiple()->searchable()
                                    ->options(fn () => Category::query()->visibleOn('arfro')->orderBy('path')->get()
                                        ->mapWithKeys(fn (Category $c) => [$c->path => str_repeat('— ', substr_count($c->path, '/')).$c->name])->all())
                                    // A single path saved before gammes became a list.
                                    ->afterStateHydrated(fn (Select $component, $state) => is_string($state) ? $component->state([$state]) : null)
                                    ->helperText('Une gamme : le lien « Voir tout » mène à sa page. Plusieurs : pas de lien.'),
                            ]),
                            Select::make('product_ids')->label('Produits à placer en premier')->multiple()->searchable()
                                ->options(fn () => Product::query()->visibleOn('arfro')->orderBy('name')->pluck('name', 'id')->all())
                                ->helperText('L’ordre de sélection est l’ordre d’affichage.'),
                        ]),
                ])),
                Tab::make('Services')->schema($this->section('section_care', 'ARFRO Care', [
                    ...$this->cta('cta', 'Bouton', 'section_care'),
                    ...$this->image('Photo d’un technicien de l’équipe (facultative). '.self::HALF, 'section_care'),
                    Repeater::make('section_care.items')->label('Piliers')->columnSpanFull()->columns(2)->reorderable()->defaultItems(0)
                        ->addActionLabel('Ajouter un pilier')->itemLabel(fn (array $state) => $state['title'] ?? null)->collapsible()
                        ->helperText('Uniquement les services réellement proposés. '.ArfroHomeContent::PLACEHOLDERS)
                        ->schema([
                            Select::make('icon')->label('Icône')->options(ArfroHomeContent::SERVICE_ICONS),
                            TextInput::make('title')->label('Titre')->required(),
                            Textarea::make('text')->label('Texte')->rows(2)->columnSpanFull(),
                            ...$this->cta('cta', 'Lien', inRepeater: true),
                        ]),
                ])),
                Tab::make('Conseiller')->schema($this->section('section_advisor', 'Conseiller climatisation', [])),
                Tab::make('Réalisations')->schema($this->section('section_projects', 'Réalisations', [
                    Repeater::make('section_projects.items')->label('Projets')->columnSpanFull()->columns(2)->reorderable()->defaultItems(0)
                        ->addActionLabel('Ajouter un projet')->itemLabel(fn (array $state) => $state['title'] ?? null)->collapsible()
                        ->helperText('La section reste masquée tant qu’aucun projet réel n’est publié.')
                        ->schema([
                            TextInput::make('title')->label('Titre')->required(),
                            TextInput::make('location')->label('Lieu'),
                            TextInput::make('type')->label('Type de projet'),
                            TextInput::make('products')->label('Produits utilisés'),
                            Textarea::make('description')->label('Description')->rows(3)->columnSpanFull(),
                            ...$this->image('Photo réelle du projet. '.self::HALF, inRepeater: true),
                            Toggle::make('published')->label('Publié')->helperText('Projet réel et vérifié.')->default(false),
                        ]),
                ])),
                Tab::make('Professionnels')->schema($this->section('section_business', 'ARFRO Business', [
                    ...$this->cta('cta', 'Bouton principal', 'section_business'),
                    ...$this->cta('secondary', 'Bouton secondaire', 'section_business'),
                    ...$this->image('Photo d’un projet professionnel (bureaux, hôtel, restaurant). '.self::WIDE, 'section_business'),
                    Repeater::make('section_business.items')->label('Points forts')->columnSpanFull()->columns(2)->reorderable()->defaultItems(0)
                        ->addActionLabel('Ajouter un point')->itemLabel(fn (array $state) => $state['title'] ?? null)
                        ->schema([
                            TextInput::make('title')->label('Titre')->required(),
                            TextInput::make('text')->label('Texte'),
                        ]),
                ])),
                Tab::make('Marques')->schema($this->section('section_brands', 'Marques partenaires', [], helper: 'Les logos sont ceux de l’onglet « Produits et menus », section Marques.')),
                Tab::make('Confiance')->schema($this->section('section_trust', 'Votre confiance', [
                    Repeater::make('section_trust.items')->label('Engagements')->columnSpanFull()->columns(2)->reorderable()->defaultItems(0)
                        ->addActionLabel('Ajouter un engagement')->itemLabel(fn (array $state) => $state['title'] ?? null)->collapsible()
                        ->helperText('Informations réelles uniquement : pas de note ni de chiffre inventé. '.ArfroHomeContent::PLACEHOLDERS)
                        ->schema([
                            Select::make('icon')->label('Icône')->options(ArfroHomeContent::SERVICE_ICONS),
                            TextInput::make('title')->label('Titre')->required(),
                            Textarea::make('text')->label('Texte')->rows(2)->columnSpanFull(),
                        ]),
                ])),
                Tab::make('Témoignages')->schema($this->section('section_testimonials', 'Témoignages', [
                    Repeater::make('section_testimonials.items')->label('Témoignages')->columnSpanFull()->columns(2)->reorderable()->defaultItems(0)
                        ->addActionLabel('Ajouter un témoignage')->itemLabel(fn (array $state) => $state['author'] ?? null)->collapsible()
                        ->helperText('La section reste masquée tant qu’aucun témoignage réel n’est publié.')
                        ->schema([
                            TextInput::make('author')->label('Client')->required(),
                            TextInput::make('location')->label('Ville'),
                            TextInput::make('type')->label('Type de projet'),
                            TextInput::make('products')->label('Produits utilisés'),
                            Textarea::make('quote')->label('Témoignage')->rows(3)->required()->columnSpanFull(),
                            ...$this->image('Photo du client ou du chantier, avec son accord (facultative). Carrée, 600 px au moins.', inRepeater: true),
                            Toggle::make('published')->label('Publié')->helperText('Témoignage réel, avec l’accord du client.')->default(false),
                        ]),
                ], titleRequired: false, withText: false)),
                Tab::make('Conseils')->schema($this->section('section_journal', 'Journal', [
                    ...$this->cta('cta', 'Bouton', 'section_journal'),
                ], helper: 'Les derniers articles publiés sur Arfro s’affichent ; la section est masquée sans article.')),
                Tab::make('Final')->schema($this->section('section_final', 'Message final', [
                    ...$this->cta('cta', 'Bouton principal', 'section_final'),
                    ...$this->cta('secondary', 'Bouton secondaire', 'section_final'),
                    ...$this->image('Photo de fond (facultative). '.self::WIDE, 'section_final'),
                ])),
                Tab::make('Produits et menus')->schema($this->homeComponents()),
            ]),
        ]);
    }

    /**
     * One home section: switch, eyebrow, title, text, then its own fields.
     *
     * @param  list<mixed>  $fields
     * @return list<Section>
     */
    private function section(string $key, string $heading, array $fields, bool $longText = false, bool $titleRequired = true, bool $withText = true, ?string $helper = null): array
    {
        return [
            Section::make($heading)->description($helper)->columns(2)->schema([
                Toggle::make("{$key}.enabled")->label('Afficher cette section')->default(true)->columnSpanFull()
                    ->helperText('Une section sans contenu réel (aucun projet publié, aucun article…) reste masquée.'),
                TextInput::make("{$key}.eyebrow")->label('Surtitre')->helperText('Petit texte en capitales au-dessus du titre (facultatif).'),
                TextInput::make("{$key}.title")->label('Titre')->required($titleRequired),
                ...($withText ? [
                    Textarea::make("{$key}.text")->label('Texte')->rows($longText ? 4 : 2)->columnSpanFull(),
                ] : []),
                ...$fields,
            ]),
        ];
    }

    /**
     * CTA text and link, stored under the section key (`section_hero.cta_label`) or, in a
     * repeater item, under the item (`cta_label`).
     *
     * @return list<TextInput>
     */
    private function cta(string $prefix, string $label, ?string $key = null, bool $inRepeater = false): array
    {
        $path = $key ? "{$key}.{$prefix}" : $prefix;

        return [
            TextInput::make("{$path}_label")->label("{$label} : texte"),
            $this->urlInput("{$path}_url", "{$label} : lien")
                ->helperText($inRepeater ? null : 'Le bouton s’affiche quand le texte et le lien sont remplis.'),
        ];
    }

    private function urlInput(string $name, string $label): TextInput
    {
        return TextInput::make($name)->label($label)->placeholder('/climatisation')
            ->rule('regex:'.ArfroHomeContent::URL_PATTERN)
            ->validationMessages(['regex' => 'Un chemin du site (/contact), une adresse https://, tel:, mailto:, {telephone} ou {whatsapp}.']);
    }

    /** @return list<FileUpload|Select> */
    private function image(string $hint, ?string $key = null, bool $inRepeater = false): array
    {
        $path = $key ? "{$key}." : '';

        return [
            FileUpload::make("{$path}image")->label('Image')->image()->disk('public')->directory('accueil-arfro')
                ->acceptedFileTypes(['image/webp', 'image/jpeg', 'image/png'])->maxSize(8192)
                ->helperText($hint.' Prioritaire sur la photo du site.'),
            Select::make("{$path}design_image")->label('Photo du site (si aucune image)')->options(ArfroHomeContent::DESIGN_IMAGES)
                ->placeholder('Aucune : mise en page typographique')
                ->helperText($inRepeater ? null : 'Sans image ni photo, la section passe en mise en page typographique.'),
        ];
    }
}
