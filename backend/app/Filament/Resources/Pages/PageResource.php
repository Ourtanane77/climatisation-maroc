<?php

namespace App\Filament\Resources\Pages;

use App\Enums\PageKind;
use App\Filament\Forms\ContentBlocks;
use App\Filament\Forms\Fields;
use App\Filament\Resources\Pages\Pages\CreatePage;
use App\Filament\Resources\Pages\Pages\EditPage;
use App\Filament\Resources\Pages\Pages\ListPages;
use App\Models\Page;
use BackedEnum;
use Filament\Actions\EditAction;
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
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

class PageResource extends Resource
{
    protected static ?string $model = Page::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    protected static string|UnitEnum|null $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 6;

    protected static ?string $navigationLabel = 'Pages légales et statiques';

    protected static ?string $modelLabel = 'page';

    protected static ?string $pluralModelLabel = 'pages';

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make()->columnSpanFull()->tabs([
                Tab::make('Page')->schema([
                    Grid::make(2)->schema([
                        Fields::name('title', 'Titre'),
                        Fields::slug('/'),
                        Select::make('kind')->label('Type')->options(PageKind::class)->required()->default(PageKind::Other),
                        TextInput::make('updated_label')->label('Mention « Dernière mise à jour »')->placeholder('6 octobre 2026'),
                        Textarea::make('intro')->label('Introduction')->rows(3)->columnSpanFull(),
                        Toggle::make('is_published')->label('Publiée')
                            ->helperText('Les pages légales restent dépubliées tant que le texte juridique n’est pas saisi.'),
                    ]),
                    ContentBlocks::page(),
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
            ->columns([
                TextColumn::make('title')->label('Titre')->weight('bold'),
                TextColumn::make('slug')->label('Adresse')->prefix('/'),
                TextColumn::make('kind')->label('Type')->badge(),
                IconColumn::make('is_published')->label('Publiée')->boolean(),
                TextColumn::make('updated_at')->label('Modifiée le')->date('d/m/Y'),
            ])
            ->filters([SelectFilter::make('kind')->label('Type')->options(PageKind::class)])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPages::route('/'),
            'create' => CreatePage::route('/create'),
            'edit' => EditPage::route('/{record}/edit'),
        ];
    }
}
