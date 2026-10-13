<?php

namespace App\Filament\Imports;

use App\Enums\ResellerStatus;
use App\Models\City;
use App\Models\ResellerAccount;
use App\Models\User;
use App\Rules\MoroccanPhone;
use App\Support\Sites\Sites;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;
use Illuminate\Support\Number;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Reseller list import (CSV or Excel), keyed on the e-mail: an existing reseller is updated, a new
 * e-mail creates the user (role revendeur) and its reseller account, as « Devenir revendeur » does.
 * New accounts get a random password: the reseller chooses one with « Mot de passe oublié ». No
 * e-mail is sent. Accepts labels or keys for activity, status and site; Excel numbers that lost their
 * leading zero (phone, ICE) are restored.
 */
class ResellerAccountImporter extends Importer
{
    protected static ?string $model = ResellerAccount::class;

    /** E-mail of the row (resolveRecord), for the user created or updated after the account is filled. */
    private string $email = '';

    public static function getColumns(): array
    {
        $none = fn () => null;

        return [
            ImportColumn::make('company')->label('Société')->exampleHeader('Société')->requiredMapping()
                ->example(['Froid Service SARL', 'Clim Atlas'])
                ->rules(['required', 'string', 'max:160']),
            ImportColumn::make('ice')->label('ICE')->exampleHeader('ICE')->requiredMapping()
                ->example(['001234567000089', '002345678000012'])
                ->castStateUsing(fn ($state) => self::ice($state))
                ->rules(['required', 'digits:15']),
            ImportColumn::make('contact_name')->label('Contact')->exampleHeader('Contact')
                ->example(['Karim Alaoui', 'Salma Bennani'])
                ->rules(['nullable', 'string', 'max:120']),
            ImportColumn::make('email')->label('E-mail')->exampleHeader('E-mail')->requiredMapping()
                ->example(['contact@froid-service.ma', 'salma@climatlas.ma'])
                ->castStateUsing(fn ($state) => mb_strtolower(trim((string) $state)))
                ->rules(['required', 'email', 'max:160'])
                ->fillRecordUsing($none),
            ImportColumn::make('phone')->label('Téléphone')->exampleHeader('Téléphone')->requiredMapping()
                ->example(['0612345678', '0522123456'])
                ->castStateUsing(fn ($state) => self::phone($state))
                ->rules(['required', new MoroccanPhone('Téléphone : 10 chiffres, par exemple 0612345678.')]),
            ImportColumn::make('city')->label('Ville')->exampleHeader('Ville')
                ->example(['Marrakech', 'Casablanca'])
                ->helperText('Une ville inconnue est enregistrée comme « Autre ville ».')
                ->fillRecordUsing(function (ResellerAccount $record, ?string $state): void {
                    $record->city_id = self::cityId($state);
                }),
            ImportColumn::make('activity')->label('Activité')->exampleHeader('Activité')
                ->example(['installateur', 'revendeur'])
                ->helperText('installateur, revendeur, bureau_etudes, promoteur ou autre (défaut : revendeur).')
                ->castStateUsing(fn ($state) => self::option($state, ResellerAccount::ACTIVITIES) ?? (blank($state) ? 'revendeur' : (string) $state))
                ->rules(['required', 'in:'.implode(',', array_keys(ResellerAccount::ACTIVITIES))]),
            ImportColumn::make('status')->label('Statut')->exampleHeader('Statut')
                ->example(['valide', 'en_attente'])
                ->helperText('valide, en_attente ou refuse (défaut : valide).')
                ->castStateUsing(fn ($state) => self::option($state, self::statusOptions()) ?? (blank($state) ? ResellerStatus::Valide->value : (string) $state))
                ->rules(['required', 'in:'.implode(',', array_column(ResellerStatus::cases(), 'value'))]),
            ImportColumn::make('site')->label('Site')->exampleHeader('Site')
                ->example(['cm', 'arfro'])
                ->helperText('cm (Climatisation Maroc) ou arfro (défaut : cm). Les comptes servent sur les deux sites.')
                ->castStateUsing(fn ($state) => self::option($state, Sites::options()) ?? (blank($state) ? Sites::defaultKey() : (string) $state))
                ->rules(['required', 'in:'.implode(',', Sites::keys())]),
        ];
    }

    public function resolveRecord(): ?ResellerAccount
    {
        $this->email = mb_strtolower(trim((string) ($this->data['email'] ?? '')));
        $user = $this->email === '' ? null : User::query()->where('email', $this->email)->first();
        if ($user && ! $user->resellerAccount && $user->hasAnyRole([User::ROLE_ADMIN, User::ROLE_MANAGER])) {
            throw ValidationException::withMessages(['email' => "{$this->email} est un compte de l’équipe, pas un revendeur."]);
        }

        return $user->resellerAccount ?? new ResellerAccount;
    }

    /** Sites the importing user may write to, the phone not used by another account, the decision date. */
    protected function beforeSave(): void
    {
        /** @var ResellerAccount $account */
        $account = $this->record;
        // Defaults of a new account when the file has no such column.
        if (! $account->exists) {
            $account->site ??= Sites::defaultKey();
            $account->activity ??= 'revendeur';
            $account->status ??= ResellerStatus::Valide;
        }
        $importer = $this->import->user;
        if ($importer instanceof User && ! $importer->managesSite($account->site)) {
            throw ValidationException::withMessages(['site' => 'Vous ne gérez pas le site « '.Sites::get($account->site)->name.' ».']);
        }

        $phoneTaken = User::query()
            ->where('phone', $account->phone)
            ->where('email', '!=', $this->email)
            ->exists();
        if ($phoneTaken) {
            throw ValidationException::withMessages(['phone' => "Le téléphone {$account->phone} est déjà utilisé par un autre compte."]);
        }

        if ($account->isDirty('status')) {
            $decided = $account->status !== ResellerStatus::EnAttente;
            $account->decided_at = $decided ? now() : null;
            $account->decided_by = $decided && $importer instanceof User ? $importer->id : null;
        }

        $user = User::query()->firstOrNew(['email' => $this->email]);
        $user->fill([
            'name' => $account->contact_name ?: $account->company,
            'phone' => $account->phone,
        ]);
        if (! $user->exists) {
            $user->password = Str::password(32);
        }
        $user->save();
        if (! $user->hasRole(User::ROLE_RESELLER)) {
            $user->assignRole(User::ROLE_RESELLER);
        }
        $account->user_id = $user->id;
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'Import des revendeurs terminé : '.Number::format($import->successful_rows).' '.str('ligne')->plural($import->successful_rows).' importée(s).';

        if ($failedRowsCount = $import->getFailedRowsCount()) {
            $body .= ' '.Number::format($failedRowsCount).' '.str('ligne')->plural($failedRowsCount).' en erreur (téléchargez le fichier des erreurs).';
        }

        return $body;
    }

    /** Digits only; an ICE typed as a number in Excel lost its leading zeros: pad back to 15. */
    private static function ice(mixed $state): string
    {
        $digits = (string) preg_replace('/\D/', '', (string) $state);

        return $digits !== '' && strlen($digits) >= 12 && strlen($digits) < 15 ? str_pad($digits, 15, '0', STR_PAD_LEFT) : $digits;
    }

    /** 0612345678; a number typed in Excel (612345678) or +212 / 00212 forms are accepted. */
    private static function phone(mixed $state): string
    {
        $digits = (string) preg_replace('/\D/', '', (string) $state);
        if (strlen($digits) === 9 && preg_match('/^[5-7]/', $digits)) {
            $digits = '0'.$digits;
        }

        return MoroccanPhone::normalize($digits);
    }

    private static function cityId(?string $name): ?int
    {
        $name = trim((string) $name);
        if ($name === '') {
            return null;
        }
        $slug = Str::slug($name);
        $city = City::query()->get(['id', 'name', 'slug'])
            ->first(fn (City $city) => $city->slug === $slug || Str::slug($city->name) === $slug)
            ?? City::query()->where('slug', 'autre-ville')->orWhere('name', 'Autre ville')->first();

        return $city?->id;
    }

    /**
     * A key from its key or its label (case and accents ignored), null when unknown.
     *
     * @param  array<string, string>  $options  key => label
     */
    private static function option(mixed $state, array $options): ?string
    {
        $value = Str::slug((string) $state, '_');
        if ($value === '') {
            return null;
        }
        foreach ($options as $key => $label) {
            if ($value === Str::slug($key, '_') || $value === Str::slug($label, '_')) {
                return $key;
            }
        }

        return null;
    }

    /** @return array<string, string> */
    private static function statusOptions(): array
    {
        $options = [];
        foreach (ResellerStatus::cases() as $status) {
            $options[$status->value] = $status->getLabel();
        }

        return $options;
    }
}
