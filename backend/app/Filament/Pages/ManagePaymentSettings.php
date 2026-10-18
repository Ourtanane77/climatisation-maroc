<?php

namespace App\Filament\Pages;

use App\Models\User;
use App\Settings\PaymentSettings;
use App\Support\Payments\Cmi;
use App\Support\Sites\Sites;
use App\Support\Sites\SiteSettings;
use BackedEnum;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * « Paiement en ligne » of one site (default site here; ManageArfroPaymentSettings for arfro.com):
 * card payment through CMI on or off, merchant id, store key. Payment on delivery is always
 * offered. The store key is write-only: it is never shown again, an empty field keeps it.
 * Admins only.
 */
class ManagePaymentSettings extends SettingsPage
{
    protected static string $settings = PaymentSettings::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCreditCard;

    protected static string|UnitEnum|null $navigationGroup = 'Configuration';

    protected static ?int $navigationSort = 4;

    /** Site whose settings the page edits. */
    public static function siteKey(): string
    {
        return Sites::defaultKey();
    }

    public static function getNavigationLabel(): string
    {
        return 'Paiement en ligne — '.Sites::get(static::siteKey())->name;
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

    private function storedKey(): ?string
    {
        return SiteSettings::for(PaymentSettings::class, static::siteKey())->cmi_store_key;
    }

    /** @param  array<string, mixed>  $data */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['cmi_store_key'] = null;

        return $data;
    }

    /** @param  array<string, mixed>  $data */
    protected function mutateFormDataBeforeSave(array $data): array
    {
        $key = trim((string) ($data['cmi_store_key'] ?? ''));
        $data['cmi_store_key'] = $key !== '' ? $key : $this->storedKey();
        $data['cmi_client_id'] = trim((string) ($data['cmi_client_id'] ?? ''));

        return $data;
    }

    public function form(Schema $schema): Schema
    {
        $hasKey = filled($this->storedKey());
        $site = Sites::get(static::siteKey());

        return $schema->components([
            Section::make('Modes de paiement')->schema([
                Placeholder::make('cash')->label('Paiement à la livraison')
                    ->content('Toujours proposé : le client ne paie rien en ligne, vous l\'appelez pour confirmer et il règle à la livraison.'),
                Toggle::make('cmi_enabled')->label('Proposer le paiement en ligne par carte bancaire (CMI)')
                    ->helperText('Le client choisit à la commande entre « À la livraison » et « Carte bancaire ».')
                    ->live(),
            ]),
            Section::make('Compte CMI')->columns(2)->schema([
                Select::make('cmi_mode')->label('Plate-forme')->required()->selectablePlaceholder(false)->live()
                    ->options(['production' => 'Production (paiements réels)', 'test' => 'Test (cartes de test CMI)'])
                    ->helperText(fn (Get $get) => $get('cmi_mode') === 'test'
                        ? 'Attention : en mode Test, des paiements avec des cartes de test marquent les commandes « Payée en ligne » sans aucun encaissement. Ne pas laisser ce mode sur le site public.'
                        : null),
                TextInput::make('cmi_client_id')->label('Identifiant marchand (ClientId)')->maxLength(32)
                    ->required(fn (Get $get) => (bool) $get('cmi_enabled'))
                    ->rule('regex:/^\s*\d+\s*$/'),
                TextInput::make('cmi_store_key')->label('Clé de hachage (clé du magasin)')->password()->maxLength(128)->columnSpan(2)
                    ->autocomplete('new-password')
                    ->required(fn (Get $get) => ! $hasKey && (bool) $get('cmi_enabled'))
                    ->placeholder($hasKey ? 'Clé enregistrée — laisser vide pour la conserver' : 'Aucune clé enregistrée')
                    ->helperText('La même clé que celle saisie dans le back office CMI (Administration → Changer les clés du magasin). Elle est chiffrée et n\'est plus jamais affichée.'),
                Placeholder::make('urls')->label('Adresses utilisées')->columnSpan(2)
                    ->content('Retour client et notification : '.$site->url.'/api/v1/payments/cmi/… (envoyées automatiquement à CMI avec chaque paiement).'),
                Placeholder::make('state')->label('État')->columnSpan(2)
                    ->content(fn () => Cmi::available(static::siteKey())
                        ? 'Le paiement par carte est proposé sur '.$site->name.'.'
                        : 'Le paiement par carte n\'est pas proposé sur '.$site->name.'.'),
            ]),
        ]);
    }
}
