<?php

namespace App\Filament\Resources\ArticleCategories;

use App\Filament\Forms\Fields;
use App\Filament\Resources\ArticleCategories\Pages\ManageArticleCategories;
use App\Models\ArticleCategory;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

class ArticleCategoryResource extends Resource
{
    protected static ?string $model = ArticleCategory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleGroup;

    protected static string|UnitEnum|null $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Blog : catégories';

    protected static ?string $modelLabel = 'catégorie du blog';

    protected static ?string $pluralModelLabel = 'catégories du blog';

    public static function form(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            Fields::name(),
            Fields::slug('/blog/categorie/'),
            Textarea::make('description')->label('Description')->rows(2),
            Fields::seo(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('position')
            ->defaultSort('position')
            ->columns([
                TextColumn::make('name')->label('Nom')->weight('bold'),
                TextColumn::make('description')->label('Description')->limit(80),
                TextColumn::make('articles_count')->label('Articles')->counts('articles')->alignCenter(),
            ])
            ->recordActions([EditAction::make()->slideOver(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageArticleCategories::route('/')];
    }
}
