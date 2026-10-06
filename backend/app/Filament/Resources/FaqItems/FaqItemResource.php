<?php

namespace App\Filament\Resources\FaqItems;

use App\Filament\Resources\FaqItems\Pages\ManageFaqItems;
use App\Models\Article;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CityPage;
use App\Models\FaqItem;
use App\Models\Page;
use App\Models\Product;
use App\Models\SectorPage;
use App\Models\ServicePage;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\MorphToSelect;
use Filament\Forms\Components\MorphToSelect\Type;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

/** All FAQ items in one place (they are also editable from each page's "FAQ" tab). */
class FaqItemResource extends Resource
{
    protected static ?string $model = FaqItem::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedQuestionMarkCircle;

    protected static string|UnitEnum|null $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 7;

    protected static ?string $navigationLabel = 'FAQ';

    protected static ?string $modelLabel = 'question';

    protected static ?string $pluralModelLabel = 'questions (FAQ)';

    /** @var array<string, string> morph alias → label */
    private const OWNERS = [
        'category' => 'Catégorie', 'product' => 'Produit', 'brand' => 'Marque', 'service' => 'Service', 'sector' => 'Secteur',
        'city_page' => 'Ville', 'page' => 'Page', 'article' => 'Article',
    ];

    public static function form(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            MorphToSelect::make('faqable')->label('Page')->searchable()->required()->types([
                Type::make(Category::class)->titleAttribute('name')->label('Catégorie'),
                Type::make(Product::class)->titleAttribute('name')->label('Produit'),
                Type::make(Brand::class)->titleAttribute('name')->label('Marque'),
                Type::make(ServicePage::class)->titleAttribute('name')->label('Service'),
                Type::make(SectorPage::class)->titleAttribute('name')->label('Secteur'),
                Type::make(CityPage::class)->titleAttribute('slug')->label('Ville'),
                Type::make(Page::class)->titleAttribute('title')->label('Page'),
                Type::make(Article::class)->titleAttribute('title')->label('Article'),
            ]),
            TextInput::make('question')->label('Question')->required()->maxLength(255),
            Textarea::make('answer')->label('Réponse')->required()->rows(4),
            TextInput::make('position')->label('Ordre')->numeric()->default(0),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('faqable_type')
            ->columns([
                TextColumn::make('question')->label('Question')->searchable()->wrap()->weight('bold'),
                TextColumn::make('faqable_type')->label('Type')->badge()->formatStateUsing(fn (string $state) => self::OWNERS[$state] ?? $state),
                TextColumn::make('faqable_id')->label('Page')
                    ->formatStateUsing(fn (FaqItem $record) => match (true) {
                        $record->faqable instanceof Article, $record->faqable instanceof Page => $record->faqable->title,
                        $record->faqable instanceof CityPage => $record->faqable->slug,
                        $record->faqable !== null => (string) $record->faqable->getAttribute('name'),
                        default => '—',
                    }),
                TextColumn::make('position')->label('Ordre')->sortable(),
            ])
            ->filters([SelectFilter::make('faqable_type')->label('Type')->options(self::OWNERS)])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageFaqItems::route('/')];
    }
}
