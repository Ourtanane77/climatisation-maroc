<?php

use App\Filament\Pages\ManageArfroGeneralSettings;
use App\Filament\Pages\ManageGeneralSettings;
use App\Models\User;
use App\Settings\ArfroGeneralSettings;
use App\Settings\GeneralSettings;
use App\Support\Sites\MapEmbed;
use Database\Seeders\RolesAndUsersSeeder;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;

/*
| Social links and contact page map of each site (Réglages): settings migrations of 2026-10-19,
| navigation API output (order, filtering, per site) and back-office validation.
*/

const ARFRO_MAP_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3396.4047309297084!2d-7.990787888134776!3d31.65014507404711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafefea414aac07%3A0xc50205eec02ae1c!2sARFRO!5e0!3m2!1sfr!2sma!4v1792428423780!5m2!1sfr!2sma';

function socialsOf(string $group): array
{
    return json_decode((string) DB::table('settings')->where('group', $group)->where('name', 'socials')->value('payload'), true);
}

it('sets each site\'s social links and map', function () {
    expect(socialsOf('general'))->toEqualCanonicalizing([
        'facebook' => 'https://www.facebook.com/climatisationmaroc',
        'instagram' => 'https://www.instagram.com/climatisationmaroc',
        'tiktok' => 'https://www.tiktok.com/@climatisationmaroc',
    ])->and(socialsOf('general_arfro'))->toEqualCanonicalizing([
        'facebook' => 'https://www.facebook.com/arfromaroc',
        'instagram' => 'https://www.instagram.com/arfromaroc/',
        'tiktok' => 'https://www.tiktok.com/@arfromaroc',
        'youtube' => 'https://www.youtube.com/@ARFROMaroc',
        'x' => 'https://x.com/ARFROMaroc',
        'threads' => 'https://www.threads.com/@arfromaroc',
        'pinterest' => 'https://www.pinterest.com/arfromaroc/',
    ])
        ->and((new GeneralSettings)->map_embed_url)->toBe(ARFRO_MAP_EMBED)
        ->and((new ArfroGeneralSettings)->map_embed_url)->toBe(ARFRO_MAP_EMBED);
});

it('keeps a social link the owner already changed', function () {
    DB::table('settings')->where('group', 'general_arfro')->where('name', 'socials')->update(['payload' => json_encode([
        'facebook' => 'https://www.facebook.com/page-du-proprietaire',
        'instagram' => 'https://www.instagram.com/arihafroid_climatisation/', // seeded default: replaced
        'youtube' => '',
    ])]);

    (require database_path('settings/2026_10_19_100100_social_links.php'))->up();

    expect(socialsOf('general_arfro'))
        ->toMatchArray([
            'facebook' => 'https://www.facebook.com/page-du-proprietaire',
            'instagram' => 'https://www.instagram.com/arfromaroc/',
            'youtube' => 'https://www.youtube.com/@ARFROMaroc',
            'pinterest' => 'https://www.pinterest.com/arfromaroc/',
        ]);
});

it('lists the filled social links of each site in a stable order, WhatsApp last', function () {
    expect(collect($this->getJson('/api/v1/navigation')->assertOk()->json('footer.socials'))->pluck('name')->all())
        ->toBe(['Facebook', 'Instagram', 'TikTok', 'WhatsApp']);

    expect($this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->json('footer.socials'))->toBe([
        ['name' => 'Facebook', 'href' => 'https://www.facebook.com/arfromaroc'],
        ['name' => 'Instagram', 'href' => 'https://www.instagram.com/arfromaroc/'],
        ['name' => 'TikTok', 'href' => 'https://www.tiktok.com/@arfromaroc'],
        ['name' => 'YouTube', 'href' => 'https://www.youtube.com/@ARFROMaroc'],
        ['name' => 'X', 'href' => 'https://x.com/ARFROMaroc'],
        ['name' => 'Threads', 'href' => 'https://www.threads.com/@arfromaroc'],
        ['name' => 'Pinterest', 'href' => 'https://www.pinterest.com/arfromaroc/'],
        ['name' => 'WhatsApp', 'href' => 'https://wa.me/212666854184'],
    ]);
});

it('skips empty and non-web social links', function () {
    $settings = new GeneralSettings;
    $settings->socials = ['pinterest' => 'https://www.pinterest.com/cm/', 'facebook' => '', 'instagram' => 'javascript:alert(1)', 'x' => 'https://x.com/cm', 'unknown' => 'https://example.com'];
    $settings->save();

    expect($this->getJson('/api/v1/navigation')->json('footer.socials'))->toBe([
        ['name' => 'X', 'href' => 'https://x.com/cm'],
        ['name' => 'Pinterest', 'href' => 'https://www.pinterest.com/cm/'],
        ['name' => 'WhatsApp', 'href' => 'https://wa.me/212666854184'],
    ]);
});

it('shows LinkedIn after Pinterest and before WhatsApp once its address is filled, and hides it while empty', function () {
    // No address is seeded: the owner pastes it in Réglages — Arfro.
    expect(socialsOf('general_arfro'))->not->toHaveKey('linkedin');
    $this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->assertJsonMissing(['name' => 'LinkedIn']);

    $arfro = new ArfroGeneralSettings;
    $arfro->socials = [...$arfro->socials, 'linkedin' => 'https://www.linkedin.com/company/exemple'];
    $arfro->save();

    $names = collect($this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->json('footer.socials'))->pluck('name')->all();
    expect(array_slice($names, -3))->toBe(['Pinterest', 'LinkedIn', 'WhatsApp']);

    $arfro->socials = [...$arfro->socials, 'linkedin' => ''];
    $arfro->save();
    $this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->assertJsonMissing(['name' => 'LinkedIn']);
});

it('outputs each site\'s map and never an invalid one', function () {
    $arfro = new ArfroGeneralSettings;
    $arfro->map_embed_url = '<iframe src="https://evil.example/"></iframe>';
    $arfro->save();

    $this->getJson('/api/v1/navigation')->assertJsonPath('mapEmbedUrl', ARFRO_MAP_EMBED);
    $this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->assertJsonPath('mapEmbedUrl', null);
});

it('accepts only Google Maps embed addresses', function (?string $url, bool $valid) {
    expect(MapEmbed::isValid($url))->toBe($valid);
})->with([
    'ARFRO place' => [ARFRO_MAP_EMBED, true],
    'empty' => ['', false],
    'null' => [null, false],
    'http' => ['http://www.google.com/maps/embed?pb=x', false],
    'other host' => ['https://www.google.com.evil.ma/maps/embed?pb=x', false],
    'place link' => ['https://www.google.com/maps/place/ARFRO', false],
    'no query' => ['https://www.google.com/maps/embed', false],
    'port' => ['https://www.google.com:8443/maps/embed?pb=x', false],
    'credentials' => ['https://u:p@www.google.com/maps/embed?pb=x', false],
    'fragment' => ['https://www.google.com/maps/embed?pb=x#y', false],
    'iframe html' => ['<iframe src="'.ARFRO_MAP_EMBED.'"></iframe>', false],
    'quote injection' => ['https://www.google.com/maps/embed?pb=x" onload="alert(1)', false],
]);

it('validates the map address in Réglages and saves it per site', function () {
    $this->seed(RolesAndUsersSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($admin);

    Livewire::test(ManageGeneralSettings::class)
        ->assertSee('Carte Google Maps (page Contact)')
        ->set('data.map_embed_url', 'https://www.google.com/maps/place/ARFRO')
        ->call('save')
        ->assertHasFormErrors(['map_embed_url']);

    Livewire::test(ManageGeneralSettings::class)
        ->set('data.socials.youtube', 'pas une adresse')
        ->call('save')
        ->assertHasFormErrors(['socials.youtube']);

    Livewire::test(ManageArfroGeneralSettings::class)
        ->set('data.map_embed_url', '')
        ->set('data.socials.threads', '')
        ->call('save')
        ->assertHasNoFormErrors();

    expect((new ArfroGeneralSettings)->map_embed_url)->toBeNull()
        ->and((new GeneralSettings)->map_embed_url)->toBe(ARFRO_MAP_EMBED);
    $this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])
        ->assertJsonPath('mapEmbedUrl', null)
        ->assertJsonMissing(['name' => 'Threads']);
});
