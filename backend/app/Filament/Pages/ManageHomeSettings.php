<?php

namespace App\Filament\Pages;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Settings\HomeSettings;
use App\Support\Sites\Sites;
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

/**
 * "Page d'accueil" of one site (default site here; ManageArfroHomeSettings for arfro.com): hero,
 * product rails, brand order, mega-menu featured products. The pickers list what the site shows.
 * Open to the users managing that site.
 */
class ManageHomeSettings extends SettingsPage
{
    protected static string $settings = HomeSettings::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedHome;

    protected static string|UnitEnum|null $navigationGroup = 'Configuration';

    protected static ?int $navigationSort = 1;

    /** Site whose home page the page edits. */
    public static function siteKey(): string
    {
        return Sites::defaultKey();
    }

    public static function getNavigationLabel(): string
    {
        return 'Page d’accueil — '.Sites::get(static::siteKey())->name;
    }

    public function getTitle(): string
    {
        return static::getNavigationLabel();
    }

    public static function canAccess(): bool
    {
        $user = auth()->user();

        return $user instanceof User && $user->managesSite(static::siteKey());
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components($this->homeComponents());
    }

    /**
     * Sections of the form shared by every site (hero, product rails, brands, mega menu).
     *
     * @return list<Section>
     */
    protected function homeComponents(): array
    {
        $site = static::siteKey();
        // Products shown on the site, plus those already chosen (so a product hidden since stays valid).
        $products = function () use ($site) {
            /** @var HomeSettings $settings */
            $settings = app(static::getSettings());
            $chosen = collect([$settings->new_product_ids, $settings->promo_product_ids, $settings->ducts_product_ids,
                $settings->supplies_product_ids, array_values($settings->mega_featured)])->flatten()->filter()->all();

            return Product::query()->where(fn ($q) => $q->visibleOn($site)->orWhereIn('id', $chosen))
                ->orderBy('name')->pluck('name', 'id')->all();
        };
        $productSelect = fn (string $field, string $label) => Select::make($field)->label($label)->options($products)->multiple()->searchable()
            ->helperText('L’ordre de sélection est l’ordre d’affichage.');

        return [
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
                $productSelect('ducts_product_ids', 'Gaines circulaires : à placer en premier')
                    ->helperText('Toute la gamme Gaines s’affiche automatiquement ; les produits choisis ici passent en tête.'),
                $productSelect('supplies_product_ids', 'Cuivre, gaz et pièces de rechange'),
            ]),
            Section::make('Marques')->schema([
                Select::make('brand_ids')->label('Marques du bandeau, dans l’ordre')
                    ->options(fn () => Brand::query()->visibleOn($site)->orderBy('position')->pluck('name', 'id')->all())->multiple(),
            ]),
            Section::make('Produit vedette du menu')->description('Produit affiché dans le menu déroulant de chaque gamme.')->schema([
                Grid::make(3)->schema(
                    Category::query()->visibleOn($site)->whereNull('parent_id')->orderBy('position')->get()
                        ->map(fn (Category $c) => Select::make("mega_featured.{$c->path}")->label($c->name)->options($products)->searchable())
                        ->all()
                ),
            ]),
        ];
    }
}
