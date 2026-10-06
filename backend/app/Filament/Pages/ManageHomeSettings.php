<?php

namespace App\Filament\Pages;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Settings\HomeSettings;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/** "Page d'accueil": hero, product rails, brand order, mega-menu featured products. */
class ManageHomeSettings extends SettingsPage
{
    protected static string $settings = HomeSettings::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedHome;

    protected static string|UnitEnum|null $navigationGroup = 'Configuration';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Page d’accueil';

    protected static ?string $title = 'Page d’accueil';

    public function form(Schema $schema): Schema
    {
        $products = fn () => Product::query()->orderBy('name')->pluck('name', 'id')->all();
        $productSelect = fn (string $field, string $label) => Select::make($field)->label($label)->options($products)->multiple()->searchable()
            ->helperText('L’ordre de sélection est l’ordre d’affichage.');

        return $schema->components([
            Section::make('Bandeau principal')->columns(2)->schema([
                TextInput::make('hero_title')->label('Titre')->required()->columnSpanFull(),
                TextInput::make('hero_subtitle')->label('Sous-titre')->columnSpanFull(),
                TextInput::make('hero_cta_label')->label('Texte du bouton'),
                TextInput::make('hero_cta_url')->label('Lien du bouton'),
                FileUpload::make('hero_image')->label('Image de fond')->image()->disk('public')->directory('accueil')->columnSpanFull(),
            ]),
            Section::make('Produits mis en avant')->schema([
                $productSelect('new_product_ids', 'Nouveaux produits'),
                $productSelect('promo_product_ids', 'Promotions'),
                $productSelect('ducts_product_ids', 'Gaines circulaires'),
                $productSelect('supplies_product_ids', 'Cuivre, gaz et pièces de rechange'),
            ]),
            Section::make('Marques')->schema([
                Select::make('brand_ids')->label('Marques du bandeau, dans l’ordre')
                    ->options(fn () => Brand::query()->orderBy('position')->pluck('name', 'id')->all())->multiple(),
            ]),
            Section::make('Produit vedette du menu')->description('Produit affiché dans le menu déroulant de chaque gamme.')->schema([
                Grid::make(3)->schema(
                    Category::query()->whereNull('parent_id')->orderBy('position')->get()
                        ->map(fn (Category $c) => Select::make("mega_featured.{$c->path}")->label($c->name)->options($products)->searchable())
                        ->all()
                ),
            ]),
        ]);
    }
}
