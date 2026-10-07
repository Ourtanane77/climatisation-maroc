<?php

namespace App\Filament\Resources\SectorPages;

use App\Filament\Forms\Fields;
use App\Filament\Resources\SectorPages\Pages\CreateSectorPage;
use App\Filament\Resources\SectorPages\Pages\EditSectorPage;
use App\Filament\Resources\SectorPages\Pages\ListSectorPages;
use App\Models\SectorPage;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

class SectorPageResource extends Resource
{
    protected static ?string $model = SectorPage::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBriefcase;

    protected static string|UnitEnum|null $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Pages secteur';

    protected static ?string $modelLabel = 'page secteur';

    protected static ?string $pluralModelLabel = 'pages secteur';

    protected static ?string $recordTitleAttribute = 'name';

    /** Scenes drawn in the design (Solutions professionnelles). */
    public const SCENES = ['hotel' => 'Hôtel', 'resto' => 'Restaurant', 'bureau' => 'Bureau', 'shop' => 'Commerce', 'ecole' => 'École',
        'clinique' => 'Clinique', 'villa' => 'Villa', 'froid' => 'Chambre froide'];

    public static function form(Schema $schema): Schema
    {
        $categoryPaths = fn () => Fields::categoryPathOptions();

        return $schema->components([
            Tabs::make()->columnSpanFull()->tabs([
                Tab::make('Général')->schema([
                    Grid::make(2)->schema([
                        Fields::name(),
                        Fields::slug('/solutions/'),
                        TextInput::make('tagline')->label('Accroche (carte secteur)'),
                        Select::make('scene_key')->label('Illustration')->options(self::SCENES),
                        ColorPicker::make('tile_bg')->label('Fond de la carte'),
                        FileUpload::make('image')->label('Photo (carte et en-tête, remplace l’illustration)')->image()->disk('public')->directory('secteurs'),
                        Textarea::make('hero_text')->label('Texte d’introduction (bandeau)')->rows(2)->columnSpanFull(),
                        Textarea::make('intro')->label('Paragraphe d’introduction')->rows(4)->columnSpanFull(),
                        TextInput::make('quote_title')->label('Titre du formulaire de devis'),
                        Textarea::make('whatsapp_text')->label('Message WhatsApp prérempli')->rows(1),
                        Toggle::make('is_published')->label('Publiée'),
                    ]),
                ]),
                Tab::make('Contraintes')->schema([
                    Repeater::make('problems')->hiddenLabel()->columns(3)->defaultItems(0)->addActionLabel('Ajouter une contrainte')->schema([
                        TextInput::make('title')->label('Titre')->required(),
                        Textarea::make('text')->label('Texte')->rows(2),
                        Select::make('icon')->label('Icône')->options(Fields::ICON_KEYS),
                    ]),
                ]),
                Tab::make('Solutions')->schema([
                    Repeater::make('solutions')->hiddenLabel()->columns(3)->defaultItems(0)->addActionLabel('Ajouter une solution')->schema([
                        TextInput::make('title')->label('Titre')->required(),
                        Textarea::make('text')->label('Texte')->rows(2),
                        Select::make('art')->label('Illustration')->options(Fields::ART_KEYS),
                        FileUpload::make('image')->label('Photo (remplace l’illustration)')->image()->disk('public')->directory('secteurs'),
                        TextInput::make('cta')->label('Texte du lien'),
                        Select::make('category_path')->label('Catégorie liée')->options($categoryPaths),
                        ColorPicker::make('bg')->label('Fond'),
                    ]),
                ]),
                Tab::make('Produits recommandés')->schema([
                    Select::make('products')->label('Produits')->relationship('products', 'name')->multiple()->searchable()->preload(),
                ]),
                Tab::make('Ventilation et images')->schema([
                    Repeater::make('range_tiles')->label('Tuiles de gamme')->columns(3)->defaultItems(0)->schema([
                        TextInput::make('title')->label('Titre')->required(),
                        Textarea::make('text')->label('Texte')->rows(2),
                        TextInput::make('cta')->label('Texte du lien'),
                        Select::make('category_path')->label('Catégorie liée')->options($categoryPaths),
                        Select::make('art')->label('Illustration')->options(Fields::ART_KEYS),
                        ColorPicker::make('bg')->label('Fond'),
                    ]),
                    Repeater::make('image_band')->label('Bandeau d’images')->columns(4)->defaultItems(0)->maxItems(3)->schema([
                        TextInput::make('caption')->label('Légende'),
                        Select::make('scene')->label('Illustration')->options(self::SCENES),
                        FileUpload::make('image')->label('Photo')->image()->disk('public')->directory('secteurs'),
                        ColorPicker::make('bg')->label('Fond'),
                    ]),
                ]),
                Tab::make('Guides')->schema([
                    Select::make('articles')->label('Articles liés')->relationship('articles', 'title')->multiple()->preload(),
                ]),
                Tab::make('FAQ')->schema([Fields::faq()]),
                Tab::make('SEO')->schema([Fields::seo()->collapsed(false)]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('position')
            ->defaultSort('position')
            ->columns([
                TextColumn::make('name')->label('Secteur')->weight('bold')->description(fn (SectorPage $r) => $r->tagline),
                TextColumn::make('slug')->label('Adresse')->prefix('/solutions/'),
                IconColumn::make('is_published')->label('Publiée')->boolean(),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSectorPages::route('/'),
            'create' => CreateSectorPage::route('/create'),
            'edit' => EditSectorPage::route('/{record}/edit'),
        ];
    }
}
