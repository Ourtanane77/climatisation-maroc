<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Enums\StockStatus;
use App\Filament\Forms\Fields;
use App\Models\Product;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make()->columnSpanFull()->persistTabInQueryString()->tabs([
                Tab::make('Général')->schema([
                    Grid::make(2)->schema([
                        Fields::name(label: 'Nom de la famille'),
                        Fields::slug('/produit/'),
                        Select::make('category_id')->label('Catégorie')->options(Fields::categoryOptions())->required()->searchable(),
                        Select::make('brand_id')->label('Marque')->relationship('brand', 'name')->searchable()->preload(),
                        Textarea::make('short_description')->label('Description courte')->rows(2)->columnSpanFull(),
                        RichEditor::make('description')->label('Description')->columnSpanFull(),
                    ]),
                    Section::make('Caractéristiques de la famille')->columns(3)->schema([
                        Select::make('technology')->label('Technologie')->options(['Inverter' => 'Inverter', 'On/Off' => 'On/Off']),
                        Select::make('refrigerant')->label('Fluide')->options(['R32' => 'R32', 'R410A' => 'R410A', 'R22' => 'R22']),
                        TextInput::make('wifi')->label('Connectivité')->maxLength(255),
                        Select::make('art_key')->label('Illustration (sans photo)')->options(Fields::ART_KEYS),
                        TextInput::make('keywords')->label('Mots-clés de recherche')->helperText('Termes supplémentaires pour la recherche, séparés par des espaces.'),
                        FileUpload::make('datasheet_path')->label('Fiche technique (PDF)')->disk('public')->directory('fiches')->acceptedFileTypes(['application/pdf'])->maxSize(10240),
                    ]),
                    Section::make('Publication')->columns(4)->schema([
                        Toggle::make('is_published')->label('Publié')->default(true),
                        Toggle::make('is_new')->label('Nouveauté'),
                        Toggle::make('is_featured')->label('Mis en avant'),
                        TextInput::make('position')->label('Ordre')->numeric()->default(0),
                    ]),
                    Section::make('À vérifier')
                        ->description('Signale une fiche dont la référence, le prix ou le contenu doit être confirmé.')
                        ->columns(2)
                        ->schema([
                            Toggle::make('needs_verification')->label('Fiche à vérifier'),
                            Textarea::make('verification_note')->label('Note')->rows(2),
                        ]),
                ]),

                Tab::make('Variantes')->badge(fn (?Product $record) => $record?->variants()->count())->schema([
                    Repeater::make('variants')
                        ->hiddenLabel()
                        ->relationship()
                        ->orderColumn('position')
                        ->minItems(1)
                        ->addActionLabel('Ajouter une variante')
                        ->collapsible()
                        ->itemLabel(fn (array $state): string => trim(($state['label'] ?? '').' · '.($state['sku'] ?? ''), ' ·'))
                        ->columns(4)
                        ->schema([
                            TextInput::make('sku')->label('Référence (SKU)')->required()->maxLength(64)->distinct()
                                ->unique('product_variants', 'sku', ignoreRecord: true),
                            TextInput::make('label')->label('Libellé')->placeholder('12 000 BTU · Blanc')->maxLength(255),
                            TextInput::make('power_btu')->label('Puissance (BTU)')->numeric()->minValue(0),
                            TextInput::make('colour')->label('Couleur')->maxLength(32),
                            Fields::money('price', 'Prix normal')->required(),
                            Fields::money('promo_price', 'Prix promotion')->helperText('Prix de vente quand il est inférieur au prix normal.'),
                            Fields::money('pro_price', 'Prix revendeur')->helperText('Visible uniquement par les revendeurs validés.'),
                            Select::make('stock_status')->label('Stock')->options(StockStatus::class)->default(StockStatus::EnStock)->required(),
                            Toggle::make('needs_verification')->label('À vérifier')->inline(false),
                            Textarea::make('verification_note')->label('Note de vérification')->rows(1)->columnSpan(3),
                        ]),
                ]),

                Tab::make('Images')->schema([
                    Repeater::make('images')
                        ->hiddenLabel()
                        ->relationship()
                        ->orderColumn('position')
                        ->defaultItems(0)
                        ->addActionLabel('Ajouter une image')
                        ->grid(3)
                        ->schema([
                            FileUpload::make('path')->label('Image')->image()->disk('public')->directory('products/uploads')->maxSize(8192)->imagePreviewHeight('160'),
                            TextInput::make('alt')->label('Texte alternatif')->helperText('Décrit l’image : marque, modèle, puissance.'),
                            Select::make('product_variant_id')->label('Variante')
                                ->relationship('variant', 'sku', fn ($query, $livewire) => $query->where('product_id', $livewire->record?->id))
                                ->placeholder('Toutes les variantes'),
                        ]),
                ]),

                Tab::make('Caractéristiques')->schema([
                    Repeater::make('specs')
                        ->hiddenLabel()
                        ->relationship()
                        ->orderColumn('position')
                        ->defaultItems(0)
                        ->addActionLabel('Ajouter une ligne')
                        ->columns(2)
                        ->schema([
                            TextInput::make('label')->label('Libellé')->required(),
                            TextInput::make('value')->label('Valeur')->required(),
                        ]),
                ]),

                Tab::make('Points forts')->schema([
                    Repeater::make('highlights')
                        ->hiddenLabel()
                        ->defaultItems(0)
                        ->maxItems(5)
                        ->addActionLabel('Ajouter un point fort')
                        ->columns(2)
                        ->schema([
                            TextInput::make('title')->label('Texte')->required(),
                            Select::make('icon')->label('Icône')->options(Fields::ICON_KEYS),
                        ]),
                ]),

                Tab::make('Pour l’installation')->schema([
                    Select::make('accessories')
                        ->label('Produits proposés pour l’installation')
                        ->helperText('Affichés dans le bloc « Pour l’installation » de la fiche produit.')
                        ->relationship('accessories', 'name')
                        ->multiple()
                        ->searchable()
                        ->preload(),
                ]),

                Tab::make('FAQ')->schema([Fields::faq()]),
                Tab::make('SEO')->schema([Fields::seo()->collapsed(false)]),
            ]),
        ]);
    }
}
