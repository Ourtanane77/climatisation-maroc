<?php

namespace App\Filament\Pages;

use App\Filament\Forms\Fields;
use App\Models\User;
use App\Settings\GeneralSettings;
use App\Support\Sites\Sites;
use BackedEnum;
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
 * role, stores, hours, socials, promo bar, technical visit price. Admins only.
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
            Section::make('Réseaux sociaux')->columns(3)->schema([
                TextInput::make('socials.facebook')->label('Facebook')->url(),
                TextInput::make('socials.instagram')->label('Instagram')->url(),
                TextInput::make('socials.tiktok')->label('TikTok')->url(),
            ]),
            Section::make('Commande')->columns(2)->schema([
                Fields::money('technical_visit_price', 'Prix de la visite technique')->required(),
            ]),
            Section::make('Pied de page')->schema([
                Textarea::make('about_footer')->label('Texte de présentation')->rows(4)->required(),
            ]),
        ]);
    }
}
