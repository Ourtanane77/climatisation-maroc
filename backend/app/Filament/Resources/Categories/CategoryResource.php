<?php

namespace App\Filament\Resources\Categories;

use App\Enums\CategoryTemplate;
use App\Filament\Forms\Fields;
use App\Filament\Resources\Categories\Pages\CreateCategory;
use App\Filament\Resources\Categories\Pages\EditCategory;
use App\Filament\Resources\Categories\Pages\ListCategories;
use App\Models\Category;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
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
use Filament\Tables\Table;
use UnitEnum;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFolder;

    protected static string|UnitEnum|null $navigationGroup = 'Catalogue';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'catégorie';

    protected static ?string $pluralModelLabel = 'catégories';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make()->columnSpanFull()->tabs([
                Tab::make('Général')->schema([
                    Grid::make(2)->schema([
                        Fields::name(),
                        TextInput::make('short_name')->label('Nom court')->helperText('Puces, tuiles et menus (ex. « Mural »).'),
                        Fields::slug(),
                        Select::make('parent_id')->label('Gamme parente')
                            ->options(fn (?Category $record) => collect(Fields::categoryOptions())->except($record ? [$record->id] : [])->all())
                            ->placeholder('— Gamme principale —')
                            ->searchable(),
                        Select::make('template')->label('Gabarit')->options(CategoryTemplate::class)->required()->default(CategoryTemplate::Listing),
                        TextInput::make('path')->label('Adresse')->prefix('/')->disabled()->dehydrated(false),
                        Textarea::make('intro')->label('Introduction')->rows(3)->columnSpanFull(),
                        RichEditor::make('body')->label('Texte SEO (sous la liste)')->columnSpanFull(),
                    ]),
                    Section::make('Tuile et illustration')->columns(3)->collapsible()->schema([
                        TextInput::make('tile_text')->label('Texte de la tuile'),
                        ColorPicker::make('tile_bg')->label('Fond de la tuile'),
                        Select::make('art_key')->label('Illustration')->options(Fields::ART_KEYS),
                        Select::make('icon')->label('Icône')->options(Fields::ICON_KEYS),
                        FileUpload::make('image')->label('Image')->image()->disk('public')->directory('categories'),
                    ]),
                    Section::make('Publication')->columns(4)->schema([
                        Toggle::make('is_active')->label('Active')->default(true),
                        Toggle::make('is_quote_only')->label('Sur devis uniquement'),
                        TextInput::make('position')->label('Ordre')->numeric()->default(0),
                        TextInput::make('legacy_id')->label('ID ancien site')->numeric()->helperText('Sert aux redirections des anciennes adresses.'),
                    ]),
                ]),
                Tab::make('Guides associés')->schema([
                    Select::make('articles')->label('Articles liés (« Guides associés »)')
                        ->relationship('articles', 'title')->multiple()->searchable()->preload()
                        ->helperText('Seuls les articles publiés s’affichent sur le site.'),
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
            ->paginated(false)
            ->columns([
                TextColumn::make('name')->label('Nom')->weight('bold')->searchable()
                    ->description(fn (Category $record) => '/'.$record->path),
                TextColumn::make('short_name')->label('Nom court')->toggleable(),
                TextColumn::make('template')->label('Gabarit')->badge(),
                TextColumn::make('products_count')->label('Produits')->counts('products')->alignCenter(),
                TextColumn::make('children_count')->label('Sous-catégories')->counts('children')->alignCenter(),
                IconColumn::make('is_active')->label('Active')->boolean(),
                TextColumn::make('legacy_id')->label('ID ancien site')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCategories::route('/'),
            'create' => CreateCategory::route('/create'),
            'edit' => EditCategory::route('/{record}/edit'),
        ];
    }
}
