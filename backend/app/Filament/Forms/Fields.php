<?php

namespace App\Filament\Forms;

use App\Models\Category;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str;

/** Form pieces shared by the back-office resources (all labels in French). */
class Fields
{
    /** Illustration keys (front-office drawings used when there is no photo). */
    public const ART_KEYS = [
        'mural' => 'Climatiseur mural', 'gainable' => 'Gainable', 'cassette' => 'Cassette', 'console' => 'Console',
        'solaire' => 'Chauffe-eau solaire', 'vent' => 'Ventilateur', 'flex' => 'Gaine flexible', 'coilS' => 'Cuivre (petit)',
        'coilL' => 'Cuivre (grand)', 'duo' => 'Kit duo', 'gaz' => 'Bouteille de gaz', 'support' => 'Support', 'scotch' => 'Adhésif',
        'remote' => 'Télécommande', 'iso' => 'Isolant',
    ];

    /** Two-tone icon keys of the design. */
    public const ICON_KEYS = [
        'snow' => 'Flocon', 'unit' => 'Unité', 'drop' => 'Goutte', 'fan' => 'Ventilateur', 'duct' => 'Gaine', 'coil' => 'Cuivre',
        'gear' => 'Engrenage', 'tag' => 'Étiquette', 'box' => 'Carton', 'list' => 'Liste', 'wrench' => 'Clé', 'pipe' => 'Tuyau',
        'test' => 'Test', 'chat' => 'Conseil', 'ruler' => 'Mesure', 'bolt' => 'Puissance', 'pin' => 'Emplacement', 'phone' => 'Téléphone',
        'cart' => 'Panier', 'sav' => 'SAV', 'crane' => 'Chantier', 'truck' => 'Livraison', 'cash' => 'Paiement', 'clock' => 'Délai',
        'badge' => 'Marque officielle', 'crowd' => 'Affluence', 'heat' => 'Chaleur', 'door' => 'Porte', 'quiet' => 'Silence',
    ];

    /** Background tints of the design tiles. */
    public const TINTS = ['#DCE8F5' => 'Bleu clair', '#E8EFF8' => 'Bleu pâle', '#FCE6D6' => 'Orange clair', '#FDF0E6' => 'Orange pâle'];

    /** Name input that fills the slug while the slug is still empty. */
    public static function name(string $field = 'name', string $label = 'Nom', string $slugField = 'slug'): TextInput
    {
        return TextInput::make($field)
            ->label($label)
            ->required()
            ->maxLength(255)
            ->live(onBlur: true)
            ->afterStateUpdated(function (?string $state, ?string $old, Set $set, $get) use ($slugField) {
                if (blank($get($slugField)) || $get($slugField) === Str::slug((string) $old)) {
                    $set($slugField, Str::slug((string) $state));
                }
            });
    }

    public static function slug(string $prefix = ''): TextInput
    {
        return TextInput::make('slug')
            ->label('Adresse (slug)')
            ->prefix($prefix ?: null)
            ->required()
            ->maxLength(255)
            ->rule('alpha_dash')
            ->helperText('Partie de l’URL. La modifier change l’adresse publique : prévoir une redirection.');
    }

    /** Money field: shown and typed in Dhs, stored in centimes. */
    public static function money(string $field, string $label): TextInput
    {
        return TextInput::make($field)
            ->label($label)
            ->numeric()
            ->minValue(0)
            ->step(0.01)
            ->suffix('Dhs')
            ->formatStateUsing(fn ($state) => $state === null ? null : $state / 100)
            ->dehydrateStateUsing(fn ($state) => $state === null || $state === '' ? null : (int) round(((float) $state) * 100));
    }

    /** Per-page SEO (title, description, H1, canonical, Open Graph image, noindex). */
    public static function seo(): Section
    {
        return Section::make('Référencement (SEO)')
            ->description('Laisser vide pour utiliser les valeurs par défaut de la page.')
            ->relationship('seo')
            ->collapsible()
            ->collapsed()
            ->columns(2)
            ->schema([
                TextInput::make('title')->label('Titre (balise title)')->maxLength(70)->helperText('60 à 70 caractères.'),
                TextInput::make('h1')->label('Titre principal (H1)')->maxLength(255),
                Textarea::make('description')->label('Méta-description')->maxLength(320)->rows(2)->columnSpanFull()->helperText('Environ 155 caractères.'),
                TextInput::make('canonical')->label('URL canonique')->url()->maxLength(255),
                TextInput::make('og_image')->label('Image Open Graph (URL)')->maxLength(255),
                Toggle::make('noindex')->label('Ne pas indexer (noindex)'),
            ]);
    }

    /** FAQ items attached to the record, in order. */
    public static function faq(): Repeater
    {
        return Repeater::make('faqItems')
            ->label('Questions fréquentes')
            ->relationship()
            ->orderColumn('position')
            ->defaultItems(0)
            ->addActionLabel('Ajouter une question')
            ->collapsible()
            ->itemLabel(fn (array $state): ?string => $state['question'] ?? null)
            ->schema([
                TextInput::make('question')->label('Question')->required()->maxLength(255),
                Textarea::make('answer')->label('Réponse')->required()->rows(3),
            ]);
    }

    /**
     * Category options indented by depth ("Climatisation", "— Climatiseurs muraux").
     *
     * @return array<int, string>
     */
    public static function categoryOptions(): array
    {
        return Category::query()->orderBy('path')->get()
            ->mapWithKeys(fn (Category $c) => [$c->id => str_repeat('— ', substr_count($c->path, '/')).$c->name])
            ->all();
    }

    /**
     * Same list keyed by path (for links stored in JSON content, e.g. sector solutions).
     *
     * @return array<string, string>
     */
    public static function categoryPathOptions(): array
    {
        return Category::query()->orderBy('path')->get()
            ->mapWithKeys(fn (Category $c) => [$c->path => str_repeat('— ', substr_count($c->path, '/')).$c->name])
            ->all();
    }
}
