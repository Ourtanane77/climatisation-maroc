<?php

namespace App\Filament\Pages;

use App\Filament\Forms\Fields;
use App\Models\User;
use App\Settings\GeneralSettings;
use App\Support\Sites\MapEmbed;
use App\Support\Sites\Sites;
use App\Support\Sites\SocialLinks;
use App\Support\Sites\WhatsAppNumbers;
use BackedEnum;
use Closure;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * "Réglages" of one site (default site here; ManageArfroGeneralSettings for arfro.com): phones by
 * role, WhatsApp numbers (main, home hero, floating button), contact page map, stores, hours, socials, promo bar, technical visit price. Admins only.
 */
class ManageGeneralSettings extends SettingsPage
{
    protected static string $settings = GeneralSettings::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static string|UnitEnum|null $navigationGroup = 'Configuration';

    protected static ?int $navigationSort = 3;

    /** Site whose settings the page edits. */
    public static function siteKey(): string
    {
        return Sites::defaultKey();
    }

    public static function getNavigationLabel(): string
    {
        return 'Réglages — '.Sites::get(static::siteKey())->name;
    }

    public function getTitle(): string
    {
        return static::getNavigationLabel();
    }

    public static function canAccess(): bool
    {
        $user = auth()->user();

        return $user instanceof User && $user->hasRole(User::ROLE_ADMIN) && $user->managesSite(static::siteKey());
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Bandeau promotionnel (haut de page)')->columns(3)->schema([
                TextInput::make('promo_bar_text')->label('Texte')->columnSpan(3)->helperText('Laisser vide pour masquer le bandeau.'),
                TextInput::make('promo_bar_link_label')->label('Texte du lien'),
                TextInput::make('promo_bar_link_url')->label('Lien')->columnSpan(2),
            ]),
            Section::make('Contact')->columns(3)->schema([
                TextInput::make('sales_phone')->label('Téléphone des ventes (affiché)')->required(),
                TextInput::make('whatsapp_number')->label('Numéro WhatsApp')->required()->helperText('Format international sans « + » : 212666854184.')->rule('digits_between:10,15'),
                TextInput::make('email')->label('E-mail')->email()->required(),
                TextInput::make('hours')->label('Horaires')->required()->columnSpan(3),
                TextInput::make('map_embed_url')->label('Carte Google Maps (page Contact)')->columnSpan(3)->nullable()
                    ->helperText('Dans Google Maps : ouvrir la fiche du magasin, Partager, Intégrer une carte, puis copier seulement l’adresse qui suit src=" (elle commence par https://www.google.com/maps/embed). Laisser vide pour afficher la carte par défaut.')
                    ->rule(fn () => function (string $attribute, mixed $value, Closure $fail): void {
                        if (filled($value) && ! MapEmbed::isValid(trim((string) $value))) {
                            $fail('Collez seulement l’adresse src de la carte intégrée, qui commence par https://www.google.com/maps/embed.');
                        }
                    })
                    ->dehydrateStateUsing(fn (?string $state) => filled($state) ? trim($state) : null),
                Repeater::make('hero_whatsapp_numbers')->label('Numéros WhatsApp du bouton de la page d’accueil')->columns(2)->columnSpan(2)->reorderable()->defaultItems(0)
                    ->addActionLabel('Ajouter un numéro')
                    ->helperText('Vide ou un seul numéro : le bouton « WhatsApp » ouvre directement la discussion (numéro WhatsApp ci-dessus si vide). Deux numéros ou plus : il ouvre un petit menu, un lien par numéro.')
                    ->schema([
                        TextInput::make('number')->label('Numéro')->required()->helperText('Format international sans « + » : 212666854184.')
                            ->rule('regex:'.WhatsAppNumbers::PATTERN)->validationMessages(['regex' => 'Saisissez de 10 à 15 chiffres, sans « + » ni espace : 212666854184.'])
                            ->dehydrateStateUsing(fn (?string $state) => trim((string) $state)),
                        TextInput::make('label')->label('Libellé (facultatif)')->maxLength(40)->helperText('Affiché avant le numéro dans le menu.')
                            ->dehydrateStateUsing(fn (?string $state) => trim((string) $state)),
                    ]),
                TextInput::make('floating_whatsapp_number')->label('Bouton WhatsApp flottant')->nullable()
                    ->helperText('Bouton rond en bas à droite de toutes les pages (sauf la commande). Format international sans « + ». Laisser vide pour le masquer.')
                    ->rule('regex:'.WhatsAppNumbers::PATTERN)->validationMessages(['regex' => 'Saisissez de 10 à 15 chiffres, sans « + » ni espace : 212666774394.'])
                    ->dehydrateStateUsing(fn (?string $state) => filled($state) ? trim($state) : null),
                Repeater::make('phones')->label('Téléphones par service')->columns(2)->columnSpan(3)->reorderable()->schema([
                    TextInput::make('label')->label('Service')->required(),
                    TextInput::make('display')->label('Numéro')->required(),
                ]),
            ]),
            Section::make('Magasins')->schema([
                Repeater::make('stores')->hiddenLabel()->columns(2)->schema([
                    TextInput::make('name')->label('Nom')->required(),
                    TextInput::make('address')->label('Adresse')->required(),
                ]),
            ]),
            Section::make('Réseaux sociaux')->columns(3)
                ->description('Adresse complète de chaque page (https://…). Laisser vide pour masquer l’icône (pied de page et page Contact).')
                ->schema(collect(SocialLinks::NETWORKS)->map(
                    fn (string $name, string $key) => TextInput::make("socials.{$key}")->label($name)->url()->rule('starts_with:https://,http://')->maxLength(255)
                )->values()->all()),
            Section::make('Commande')->columns(2)->schema([
                Fields::money('technical_visit_price', 'Prix de la visite technique')->required(),
            ]),
            Section::make('Pied de page')->schema([
                Textarea::make('about_footer')->label('Texte de présentation')->rows(4)->required(),
            ]),
        ]);
    }
}
