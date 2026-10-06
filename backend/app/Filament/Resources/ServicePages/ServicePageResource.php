<?php

namespace App\Filament\Resources\ServicePages;

use App\Filament\Forms\Fields;
use App\Filament\Resources\ServicePages\Pages\CreateServicePage;
use App\Filament\Resources\ServicePages\Pages\EditServicePage;
use App\Filament\Resources\ServicePages\Pages\ListServicePages;
use App\Models\ServicePage;
use BackedEnum;
use Filament\Actions\EditAction;
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

class ServicePageResource extends Resource
{
    protected static ?string $model = ServicePage::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedWrenchScrewdriver;

    protected static string|UnitEnum|null $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Pages service';

    protected static ?string $modelLabel = 'page service';

    protected static ?string $pluralModelLabel = 'pages service';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make()->columnSpanFull()->tabs([
                Tab::make('Général')->schema([
                    Grid::make(2)->schema([
                        Fields::name(label: 'Nom court'),
                        Fields::slug('/services/'),
                        Textarea::make('hero_text')->label('Texte d’introduction')->rows(2)->columnSpanFull(),
                        Textarea::make('whatsapp_text')->label('Message WhatsApp prérempli')->rows(1),
                        TextInput::make('legacy_id')->label('ID ancien site')->numeric()->helperText('Redirection de /produit/service/{id}.'),
                        Toggle::make('show_supplies')->label('Afficher « Matériel d’installation »'),
                        Toggle::make('is_published')->label('Publiée'),
                    ]),
                ]),
                Tab::make('Inclus et étapes')->schema([
                    Repeater::make('included')->label('Ce qui est inclus')->columns(2)->defaultItems(0)->schema([
                        TextInput::make('title')->label('Texte')->required(),
                        Select::make('icon')->label('Icône')->options(Fields::ICON_KEYS),
                    ]),
                    Repeater::make('steps')->label('Comment ça se passe')->columns(2)->defaultItems(0)->schema([
                        TextInput::make('title')->label('Titre')->required(),
                        Textarea::make('text')->label('Texte')->rows(2),
                    ]),
                    Repeater::make('prices')->label('Tarifs')->columns(2)->defaultItems(0)->schema([
                        TextInput::make('label')->label('Prestation')->required(),
                        TextInput::make('value')->label('Prix')->required()->placeholder('300 Dhs ou Sur devis'),
                    ]),
                ]),
                Tab::make('Matériel d’installation')->schema([
                    Select::make('products')->label('Produits')->relationship('products', 'name')->multiple()->searchable()->preload(),
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
                TextColumn::make('name')->label('Service')->weight('bold'),
                TextColumn::make('slug')->label('Adresse')->prefix('/services/'),
                IconColumn::make('is_published')->label('Publiée')->boolean(),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListServicePages::route('/'),
            'create' => CreateServicePage::route('/create'),
            'edit' => EditServicePage::route('/{record}/edit'),
        ];
    }
}
