<?php

namespace App\Filament\Forms;

use Filament\Forms\Components\Builder;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;

/**
 * Content blocks of articles and static pages. Each block maps to a front-office component of
 * the design (ArticleBody, Callout, InlineCalculator, PowerTable, InlineProductCard…).
 */
class ContentBlocks
{
    public static function article(string $field = 'body'): Builder
    {
        return Builder::make($field)
            ->label('Contenu')
            ->collapsible()
            ->blockNumbers(false)
            ->addActionLabel('Ajouter un bloc')
            ->blocks([
                self::paragraph(),
                Block::make('h2')->label('Intertitre (H2)')->icon('heroicon-o-h1')->schema([
                    TextInput::make('text')->label('Texte')->required(),
                    TextInput::make('id')->label('Ancre (sommaire)')->helperText('Ex. « tableau ». Les intertitres avec ancre forment le sommaire.')->rule('alpha_dash'),
                ]),
                Block::make('h3')->label('Sous-titre (H3)')->icon('heroicon-o-h2')->schema([TextInput::make('text')->label('Texte')->required()]),
                Block::make('callout')->label('Encadré « En bref »')->icon('heroicon-o-list-bullet')->schema([
                    TextInput::make('title')->label('Titre')->default('En bref'),
                    TagsInput::make('items')->label('Points')->placeholder('Ajouter un point'),
                ]),
                Block::make('tip')->label('Astuce')->icon('heroicon-o-light-bulb')->schema([
                    TextInput::make('title')->label('Titre')->default('Astuce'),
                    Textarea::make('text')->label('Texte')->rows(3)->required(),
                ]),
                Block::make('figure')->label('Image d’un produit')->icon('heroicon-o-photo')->schema([
                    TextInput::make('product_sku')->label('Référence du produit'),
                    TextInput::make('alt')->label('Texte alternatif'),
                    Textarea::make('caption')->label('Légende')->rows(2),
                ]),
                Block::make('calculator')->label('Calculateur de puissance')->icon('heroicon-o-calculator')->schema([]),
                Block::make('power_table')->label('Tableau des puissances')->icon('heroicon-o-table-cells')->schema([]),
                Block::make('products')->label('Produits')->icon('heroicon-o-shopping-bag')->schema([
                    TagsInput::make('skus')->label('Références')->placeholder('Ex. D13AJH.N'),
                ]),
            ]);
    }

    public static function page(string $field = 'body'): Builder
    {
        $iconSelect = fn () => Select::make('icon')->label('Icône')->options(Fields::ICON_KEYS);

        return Builder::make($field)
            ->label('Contenu')
            ->collapsible()
            ->addActionLabel('Ajouter un bloc')
            ->blocks([
                Block::make('article')->label('Article numéroté (page légale)')->icon('heroicon-o-scale')->schema([
                    TextInput::make('title')->label('Titre')->required(),
                    Textarea::make('text')->label('Texte')->rows(6)->required(),
                ]),
                self::paragraph(),
                Block::make('services')->label('Cartes de services')->icon('heroicon-o-squares-2x2')->schema([
                    Repeater::make('items')->label('Cartes')->columns(2)->schema([
                        TextInput::make('title')->label('Titre')->required(),
                        TextInput::make('href')->label('Lien'),
                        Textarea::make('text')->label('Texte')->rows(2),
                        $iconSelect(),
                    ]),
                ]),
                Block::make('commitments')->label('Engagements')->icon('heroicon-o-shield-check')->schema([
                    Repeater::make('items')->label('Engagements')->columns(2)->schema([TextInput::make('text')->label('Texte')->required(), $iconSelect()]),
                ]),
                Block::make('promises')->label('Grandes promesses')->icon('heroicon-o-star')->schema([
                    Repeater::make('items')->label('Promesses')->columns(2)->schema([
                        TextInput::make('title')->label('Titre')->required(),
                        $iconSelect(),
                        Textarea::make('text')->label('Texte')->rows(2),
                        ColorPicker::make('bg')->label('Fond'),
                    ]),
                ]),
                Block::make('steps')->label('Étapes')->icon('heroicon-o-numbered-list')->schema([
                    TextInput::make('title')->label('Titre de la section'),
                    Repeater::make('items')->label('Étapes')->columns(2)->schema([
                        TextInput::make('title')->label('Titre')->required(),
                        Textarea::make('text')->label('Texte')->rows(2),
                    ]),
                ]),
                Block::make('info')->label('Carte d’information')->icon('heroicon-o-information-circle')->schema([
                    TextInput::make('title')->label('Titre')->required(),
                    Textarea::make('text')->label('Texte')->rows(3),
                    TextInput::make('placeholder')->label('Texte à fournir')->helperText('Affiché tant que le texte définitif n’est pas saisi.'),
                    TextInput::make('link.label')->label('Lien : texte'),
                    TextInput::make('link.href')->label('Lien : adresse'),
                ]),
            ]);
    }

    private static function paragraph(): Block
    {
        return Block::make('paragraph')->label('Paragraphe')->icon('heroicon-o-bars-3-bottom-left')->schema([
            Textarea::make('text')->label('Texte')->rows(4)->required(),
        ]);
    }
}
