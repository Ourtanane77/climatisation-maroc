<?php

namespace App\Filament\Resources\ArticleCategories;

use App\Filament\Concerns\ScopesContentToManagedSites;
use App\Filament\Forms\Fields;
use App\Filament\Forms\SiteFields;
use App\Filament\Resources\ArticleCategories\Pages\ManageArticleCategories;
use App\Models\ArticleCategory;
use App\Support\Frontend\Revalidator;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
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
    use ScopesContentToManagedSites;

    /** Per-site texts (ArticleCategory::SITE_TEXT_FIELDS), with the main field's component. */
    public const SITE_TEXTS = [
        'description' => ['Description', 'textarea'],
    ];

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
            Textarea::make('description')->label('Description')->hint(SiteFields::mainHint())->rows(2),
            SiteFields::visibility(ArticleCategory::class),
            ...SiteFields::textSections(self::SITE_TEXTS),
            Fields::seo(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('position')
            ->afterReordering(fn () => Revalidator::changed()) // one query, no model events
            ->defaultSort('position')
            ->columns([
                TextColumn::make('name')->label('Nom')->weight('bold'),
                TextColumn::make('description')->label('Description')->limit(80),
                TextColumn::make('articles_count')->label('Articles')->counts('articles')->alignCenter(),
                SiteFields::sitesColumn(),
                ...SiteFields::textColumns('description'),
            ])
            ->filters([
                SiteFields::sitesFilter(),
                ...SiteFields::textFilters('description'),
            ])
            ->recordActions([EditAction::make()->slideOver(), DeleteAction::make()])
            ->toolbarActions([BulkActionGroup::make(SiteFields::visibilityBulkActions(ArticleCategory::class))]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageArticleCategories::route('/')];
    }
}
