<?php

namespace App\Filament\Resources\Articles;

use App\Filament\Forms\ContentBlocks;
use App\Filament\Forms\Fields;
use App\Filament\Resources\Articles\Pages\CreateArticle;
use App\Filament\Resources\Articles\Pages\EditArticle;
use App\Filament\Resources\Articles\Pages\ListArticles;
use App\Models\Article;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use UnitEnum;

class ArticleResource extends Resource
{
    protected static ?string $model = Article::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedNewspaper;

    protected static string|UnitEnum|null $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Blog : articles';

    protected static ?string $modelLabel = 'article';

    protected static ?string $pluralModelLabel = 'articles';

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make()->columnSpanFull()->tabs([
                Tab::make('Article')->schema([
                    Grid::make(2)->schema([
                        Fields::name('title', 'Titre'),
                        Fields::slug('/blog/'),
                        Select::make('article_category_id')->label('Catégorie')->relationship('category', 'name')->required()->preload(),
                        TextInput::make('reading_time')->label('Temps de lecture')->numeric()->suffix('min'),
                        Textarea::make('excerpt')->label('Résumé')->rows(2)->columnSpanFull(),
                    ]),
                    ContentBlocks::article(),
                ]),
                Tab::make('Visuel et publication')->schema([
                    Grid::make(3)->schema([
                        FileUpload::make('cover')->label('Image de couverture')->image()->disk('public')->directory('blog'),
                        Select::make('art_key')->label('Illustration (sans image)')->options(Fields::ART_KEYS),
                        ColorPicker::make('cover_bg')->label('Fond de la vignette'),
                        TextInput::make('author')->label('Auteur'),
                        DateTimePicker::make('published_at')->label('Date de publication'),
                        Toggle::make('is_published')->label('Publié')->inline(false),
                    ]),
                ]),
                Tab::make('Liens')->schema([
                    Section::make('Afficher cet article dans « Guides associés » de :')->schema([
                        Select::make('linkedCategories')->label('Catégories')->relationship('linkedCategories', 'name')->multiple()->preload(),
                        Select::make('linkedSectors')->label('Secteurs')->relationship('linkedSectors', 'name')->multiple()->preload(),
                        Select::make('linkedProducts')->label('Produits')->relationship('linkedProducts', 'name')->multiple()->searchable(),
                    ]),
                ]),
                Tab::make('FAQ')->schema([Fields::faq()]),
                Tab::make('SEO')->schema([Fields::seo()->collapsed(false)]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('position')
            ->reorderable('position')
            ->columns([
                TextColumn::make('title')->label('Titre')->searchable()->weight('bold')->wrap(),
                TextColumn::make('category.name')->label('Catégorie')->badge(),
                TextColumn::make('reading_time')->label('Lecture')->suffix(' min'),
                TextColumn::make('published_at')->label('Publié le')->date('d/m/Y')->placeholder('—'),
                IconColumn::make('is_published')->label('Publié')->boolean(),
            ])
            ->filters([
                SelectFilter::make('article_category_id')->label('Catégorie')->relationship('category', 'name'),
                TernaryFilter::make('is_published')->label('Publié'),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListArticles::route('/'),
            'create' => CreateArticle::route('/create'),
            'edit' => EditArticle::route('/{record}/edit'),
        ];
    }
}
