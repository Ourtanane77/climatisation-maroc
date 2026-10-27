<?php

namespace App\Filament\Resources\Brands;

use App\Filament\Concerns\ScopesContentToManagedSites;
use App\Filament\Forms\Fields;
use App\Filament\Forms\SiteFields;
use App\Filament\Resources\Brands\Pages\ManageBrands;
use App\Models\Brand;
use App\Support\Frontend\Revalidator;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

class BrandResource extends Resource
{
    use ScopesContentToManagedSites;

    /** Per-site texts (Brand::SITE_TEXT_FIELDS), with the main field's component. */
    public const SITE_TEXTS = [
        'intro' => ['Présentation', 'textarea'],
        'caption' => ['Légende sous le logo', 'text'],
    ];

    protected static ?string $model = Brand::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTag;

    protected static string|UnitEnum|null $navigationGroup = 'Catalogue';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'marque';

    protected static ?string $pluralModelLabel = 'marques';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(2)->columnSpanFull()->schema([
                Fields::name(),
                Fields::slug('/marques/'),
                FileUpload::make('logo')->label('Logo (PNG transparent)')->image()->disk('public')->directory('brands'),
                Grid::make(1)->schema([
                    TextInput::make('logo_aspect')->label('Rapport largeur / hauteur du logo')->numeric()->step(0.01)
                        ->helperText('Sert à donner la même surface visuelle à tous les logos (ex. LG : 2,05).'),
                    TextInput::make('caption')->label('Légende sous le logo')->hint(SiteFields::mainHint())->placeholder('Climatisation'),
                ]),
                Textarea::make('intro')->label('Présentation')->hint(SiteFields::mainHint())->rows(3)->columnSpanFull(),
                Toggle::make('is_official_distributor')->label('Distributeur officiel'),
                Toggle::make('is_active')->label('Active')->default(true),
                SiteFields::visibility(Brand::class)->columnSpanFull(),
            ]),
            ...SiteFields::textSections(self::SITE_TEXTS),
            Repeater::make('features')->label('Technologies (page marque)')->columnSpanFull()->columns(2)
                ->schema([
                    TextInput::make('title')->label('Titre')->required(),
                    Select::make('icon')->label('Icône')->options(Fields::ICON_KEYS)->required(),
                    Textarea::make('text')->label('Texte')->rows(2)->required()->columnSpanFull(),
                ])
                ->defaultItems(0)->collapsible()->reorderable(),
            Fields::faq()->columnSpanFull(),
            Fields::seo()->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('position')
            // Drag and drop updates the rows in one query, without model events.
            ->afterReordering(fn () => Revalidator::changed())
            ->defaultSort('position')
            ->description('L’ordre de cette liste (glisser-déposer après « Classer les enregistrements ») est l’ordre des produits sur les pages catégorie (tri « Pertinence ») et des marques dans les filtres, sauf si la catégorie a son propre ordre.')
            ->columns([
                ImageColumn::make('logo')->label('')->disk('public')->imageHeight(32),
                TextColumn::make('name')->label('Nom')->searchable()->weight('bold'),
                TextColumn::make('products_count')->label('Produits')->counts('products')->alignCenter(),
                IconColumn::make('is_official_distributor')->label('Distributeur officiel')->boolean(),
                IconColumn::make('is_active')->label('Active')->boolean(),
                SiteFields::sitesColumn(),
                ...SiteFields::textColumns('intro'),
            ])
            ->filters([
                SiteFields::sitesFilter(),
                ...SiteFields::textFilters('intro'),
            ])
            ->recordActions([EditAction::make()->slideOver(), DeleteAction::make()])
            ->toolbarActions([BulkActionGroup::make(SiteFields::visibilityBulkActions(Brand::class))]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageBrands::route('/')];
    }
}
