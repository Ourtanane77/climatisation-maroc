<?php

namespace App\Filament\Resources\CityPages;

use App\Filament\Forms\Fields;
use App\Filament\Resources\CityPages\Pages\CreateCityPage;
use App\Filament\Resources\CityPages\Pages\EditCityPage;
use App\Filament\Resources\CityPages\Pages\ListCityPages;
use App\Models\CityPage;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

class CityPageResource extends Resource
{
    protected static ?string $model = CityPage::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMapPin;

    protected static string|UnitEnum|null $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 5;

    protected static ?string $navigationLabel = 'Pages ville';

    protected static ?string $modelLabel = 'page ville';

    protected static ?string $pluralModelLabel = 'pages ville';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(2)->columnSpanFull()->schema([
                Select::make('city_id')->label('Ville')->relationship('city', 'name')->required()->unique(ignoreRecord: true),
                Fields::slug('/climatisation-'),
                Textarea::make('intro')->label('Introduction')->rows(3)->columnSpanFull(),
                RichEditor::make('body')->label('Contenu')->columnSpanFull(),
                Toggle::make('is_published')->label('Publiée')
                    ->helperText('À publier une fois le texte rédigé : une page vide n’apparaît ni dans les menus ni dans le plan du site.'),
            ]),
            Fields::faq()->columnSpanFull(),
            Fields::seo()->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('city.name')->label('Ville')->weight('bold'),
                TextColumn::make('slug')->label('Adresse')->prefix('/climatisation-'),
                IconColumn::make('is_published')->label('Publiée')->boolean(),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCityPages::route('/'),
            'create' => CreateCityPage::route('/create'),
            'edit' => EditCityPage::route('/{record}/edit'),
        ];
    }
}
