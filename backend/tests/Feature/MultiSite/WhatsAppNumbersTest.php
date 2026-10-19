<?php

use App\Filament\Pages\ManageArfroGeneralSettings;
use App\Filament\Pages\ManageGeneralSettings;
use App\Models\User;
use App\Settings\ArfroGeneralSettings;
use App\Settings\GeneralSettings;
use App\Support\Sites\WhatsAppNumbers;
use Database\Seeders\RolesAndUsersSeeder;
use Livewire\Livewire;

/*
| WhatsApp numbers of Réglages (owner's request of 2026-10-19): two numbers behind the home hero button
| and a floating button on Climatisation Maroc; Arfro unchanged until filled. Settings migration values,
| API output per site, server-side filtering and back-office validation.
*/

it('sets the hero and floating numbers of Climatisation Maroc only', function () {
    $cm = new GeneralSettings;
    $arfro = new ArfroGeneralSettings;

    expect(array_column($cm->hero_whatsapp_numbers, 'number'))->toBe(['212666854184', '212666088348'])
        ->and($cm->floating_whatsapp_number)->toBe('212666774394')
        ->and($arfro->hero_whatsapp_numbers)->toBe([])
        ->and($arfro->floating_whatsapp_number)->toBeNull();
});

it('outputs each site\'s WhatsApp numbers', function () {
    $this->getJson('/api/v1/home')->assertOk()->assertJsonPath('heroWhatsapp', [
        ['number' => '212666854184', 'label' => null],
        ['number' => '212666088348', 'label' => null],
    ]);
    $this->getJson('/api/v1/navigation')->assertOk()->assertJsonPath('floatingWhatsapp', '212666774394');

    $this->getJson('/api/v1/home', ['X-Site' => 'arfro'])->assertOk()
        ->assertJsonPath('heroWhatsapp', [])
        ->assertJsonPath('whatsapp', (new ArfroGeneralSettings)->whatsapp_number);
    $this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->assertOk()->assertJsonPath('floatingWhatsapp', null);
});

it('never outputs an invalid number', function () {
    $settings = new GeneralSettings;
    $settings->hero_whatsapp_numbers = [
        ['label' => ' Ventes ', 'number' => ' 212666854184 '],
        ['label' => 'Doublon', 'number' => '212666854184'],
        ['label' => '', 'number' => '+212666088348'],
        ['label' => '', 'number' => 'javascript:alert(1)'],
        ['label' => '', 'number' => '12345'],
        ['label' => null, 'number' => null],
        ['label' => '', 'number' => '212600000000'],
    ];
    $settings->floating_whatsapp_number = '0666 77 43 94';
    $settings->save();

    $this->getJson('/api/v1/home')->assertJsonPath('heroWhatsapp', [
        ['number' => '212666854184', 'label' => 'Ventes'],
        ['number' => '212600000000', 'label' => null],
    ]);
    $this->getJson('/api/v1/navigation')->assertJsonPath('floatingWhatsapp', null);
});

it('accepts 10 to 15 digits only', function (?string $number, bool $valid) {
    expect(WhatsAppNumbers::isValid($number))->toBe($valid);
})->with([
    'moroccan mobile' => ['212666774394', true],
    'ten digits' => ['0666774394', true],
    'fifteen digits' => ['123456789012345', true],
    'sixteen digits' => ['1234567890123456', false],
    'nine digits' => ['066677439', false],
    'plus sign' => ['+212666774394', false],
    'spaces' => ['212 666 774 394', false],
    'empty' => ['', false],
    'null' => [null, false],
]);

it('validates the WhatsApp numbers in Réglages and saves them per site', function () {
    $this->seed(RolesAndUsersSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($admin);

    Livewire::test(ManageGeneralSettings::class)
        ->assertSee('Bouton WhatsApp flottant')
        ->set('data.floating_whatsapp_number', '+212 666 77 43 94')
        ->call('save')
        ->assertHasFormErrors(['floating_whatsapp_number']);

    Livewire::test(ManageGeneralSettings::class)
        ->set('data.hero_whatsapp_numbers', [['number' => '06-66-85-41-84', 'label' => '']])
        ->call('save')
        ->assertHasFormErrors();

    Livewire::test(ManageArfroGeneralSettings::class)
        ->set('data.hero_whatsapp_numbers', [['number' => '212600000001', 'label' => 'Ventes'], ['number' => '212600000002', 'label' => '']])
        ->set('data.floating_whatsapp_number', '212600000003')
        ->call('save')
        ->assertHasNoFormErrors();

    Livewire::test(ManageGeneralSettings::class)
        ->set('data.floating_whatsapp_number', '')
        ->call('save')
        ->assertHasNoFormErrors();

    expect((new GeneralSettings)->floating_whatsapp_number)->toBeNull()
        ->and(array_column((new GeneralSettings)->hero_whatsapp_numbers, 'number'))->toBe(['212666854184', '212666088348']);
    $this->getJson('/api/v1/navigation')->assertJsonPath('floatingWhatsapp', null);
    $this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->assertJsonPath('floatingWhatsapp', '212600000003');
    $this->getJson('/api/v1/home', ['X-Site' => 'arfro'])->assertJsonPath('heroWhatsapp', [
        ['number' => '212600000001', 'label' => 'Ventes'],
        ['number' => '212600000002', 'label' => null],
    ]);
});
