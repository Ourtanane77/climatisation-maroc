<?php

use App\Enums\ResellerStatus;
use App\Filament\Actions\SpreadsheetImportAction;
use App\Filament\Imports\ResellerAccountImporter;
use App\Filament\Resources\Resellers\Pages\ListResellerAccounts;
use App\Models\City;
use App\Models\ResellerAccount;
use App\Models\User;
use Filament\Actions\Imports\Models\Import;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

/*
| Reseller list import (Revendeurs › « Importer une liste »): CSV or Excel, keyed on the e-mail.
*/

beforeEach(function () {
    $this->seed();
    $this->admin = User::factory()->create();
    $this->admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($this->admin);
});

/** @param array<string, string> $row */
function importReseller(User $by, array $row): void
{
    $import = Import::query()->create([
        'user_id' => $by->id, 'file_name' => 'revendeurs.csv', 'file_path' => 'revendeurs.csv',
        'importer' => ResellerAccountImporter::class, 'total_rows' => 1,
    ]);
    $columns = array_combine(array_keys($row), array_keys($row));
    (new ResellerAccountImporter($import, $columns, []))($row);
}

it('creates a validated reseller with its user from a row', function () {
    importReseller($this->admin, [
        'company' => 'Froid Service SARL', 'ice' => '001234567000089', 'contact_name' => 'Karim Alaoui',
        'email' => 'Contact@Froid-Service.ma', 'phone' => '06 12 34 56 78', 'city' => 'marrakech',
        'activity' => 'Installateur', 'status' => '', 'site' => 'Arfro',
    ]);

    $account = ResellerAccount::query()->where('company', 'Froid Service SARL')->firstOrFail();
    expect($account->status)->toBe(ResellerStatus::Valide)
        ->and($account->activity)->toBe('installateur')
        ->and($account->site)->toBe('arfro')
        ->and($account->phone)->toBe('0612345678')
        ->and($account->city?->name)->toBe('Marrakech')
        ->and($account->decided_by)->toBe($this->admin->id)
        ->and($account->user->email)->toBe('contact@froid-service.ma')
        ->and($account->user->name)->toBe('Karim Alaoui')
        ->and($account->user->hasRole(User::ROLE_RESELLER))->toBeTrue()
        ->and($account->user->isValidatedReseller())->toBeTrue();
});

it('updates the reseller with the same e-mail instead of creating a second one', function () {
    $row = ['company' => 'Clim Atlas', 'ice' => '002345678000012', 'email' => 'salma@climatlas.ma', 'phone' => '0522123456', 'status' => 'en_attente'];
    importReseller($this->admin, $row);
    importReseller($this->admin, [...$row, 'company' => 'Clim Atlas SARL', 'status' => 'Validé']);

    expect(ResellerAccount::query()->whereHas('user', fn ($q) => $q->where('email', 'salma@climatlas.ma'))->count())->toBe(1)
        ->and(ResellerAccount::query()->where('company', 'Clim Atlas SARL')->value('status'))->toBe(ResellerStatus::Valide);
});

it('restores the leading zeros Excel drops from numbers and maps unknown cities to « Autre ville »', function () {
    importReseller($this->admin, [
        'company' => 'Tanger Clim', 'ice' => '1234567000089', 'email' => 'tanger@clim.ma', 'phone' => '612345679', 'city' => 'Larache',
    ]);

    $account = ResellerAccount::query()->where('company', 'Tanger Clim')->firstOrFail();
    expect($account->ice)->toBe('001234567000089')
        ->and($account->phone)->toBe('0612345679')
        ->and($account->city_id)->toBe(City::query()->where('name', 'Autre ville')->value('id'));
});

it('refuses rows it cannot import', function (array $row) {
    expect(fn () => importReseller($this->admin, [
        'company' => 'Test', 'ice' => '001234567000089', 'email' => 'test@test.ma', 'phone' => '0612345670', ...$row,
    ]))->toThrow(ValidationException::class);
})->with([
    'short ICE' => [['ice' => '12345']],
    'bad phone' => [['phone' => '1234']],
    'unknown activity' => [['activity' => 'plombier']],
    'unknown site' => [['site' => 'autre']],
]);

it('never turns a team account into a reseller, nor reuses another account’s phone', function () {
    expect(fn () => importReseller($this->admin, ['company' => 'X', 'ice' => '001234567000089', 'email' => $this->admin->email, 'phone' => '0612345671']))
        ->toThrow(ValidationException::class);

    importReseller($this->admin, ['company' => 'A', 'ice' => '001234567000089', 'email' => 'a@a.ma', 'phone' => '0612345672']);
    expect(fn () => importReseller($this->admin, ['company' => 'B', 'ice' => '001234567000089', 'email' => 'b@b.ma', 'phone' => '0612345672']))
        ->toThrow(ValidationException::class);
});

it('keeps a manager to the sites they manage', function () {
    $manager = User::factory()->create(['sites' => ['cm']]);
    $manager->assignRole(User::ROLE_MANAGER);

    expect(fn () => importReseller($manager, ['company' => 'Arfro Pro', 'ice' => '001234567000089', 'email' => 'pro@arfro.ma', 'phone' => '0612345673', 'site' => 'arfro']))
        ->toThrow(ValidationException::class);
});

it('reads the first sheet of an Excel file as CSV, keeping whole numbers whole', function () {
    $path = tempnam(sys_get_temp_dir(), 'revendeurs').'.xlsx';
    $writer = new Writer;
    $writer->openToFile($path);
    $writer->addRow(Row::fromValues(['Société', 'ICE', 'Téléphone']));
    $writer->addRow(Row::fromValues(['Froid Service, SARL', 1234567000089, 612345678]));
    $writer->addRow(Row::fromValues(['', '', '']));
    $writer->close();

    $stream = SpreadsheetImportAction::xlsxToCsvStream($path);
    $lines = array_values(array_filter(explode("\n", stream_get_contents($stream))));
    unlink($path);

    expect($lines)->toBe(['Société,ICE,Téléphone', '"Froid Service, SARL",1234567000089,612345678']);
});

it('offers the import with both example files on the resellers list', function () {
    Livewire::test(ListResellerAccounts::class)
        ->assertActionExists('import')
        ->mountAction('import')
        ->assertMountedActionModalSee(['Télécharger un exemple Excel', 'Fichier CSV ou Excel (.xlsx)']);
});
