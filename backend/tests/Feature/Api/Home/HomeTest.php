<?php

use App\Enums\ResellerStatus;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(fn () => $this->seed());

it('returns the home sections from the settings and the catalogue', function () {
    $home = $this->getJson('/api/v1/home')->assertOk()->json();

    expect($home['hero']['title'])->toBe("Jusqu'à -30 % sur toute la gamme de climatiseurs")
        ->and(array_column($home['bento'], 'key'))->toBe(['climatisation', 'chauffe-eau', 'ventilation', 'gaines', 'cuivre-et-gaz', 'pieces-de-rechange', 'solutions'])
        ->and(array_column($home['bento'][0]['types'], 'href'))->toContain('/climatisation/mural')
        ->and($home['newProducts'][0]['badge'])->toBe(['text' => 'Nouveau', 'tone' => 'brand'])
        ->and($home['promotions']['brands'])->toBe(['LG', 'Carrier', 'CIAT', 'Fitco'])
        ->and($home['promotions']['products'][0]['name'])->toBe('LG Dual Inverter')
        ->and(array_column($home['ducts'], 'sku'))->toBe(['CLIM00319', 'VENT0135', 'CLIM00323', 'VENT0136', 'CLIM00377', 'CLIM00320'])
        ->and($home['ducts'][1]['diameter'])->toBe(125)
        ->and($home['ducts'][0]['kind'])->toBe('calo')
        ->and(array_column($home['supplies'], 'sku'))->toBe(['CUIV0005', 'CUIV0006', 'CUIV0018', 'GAZ00042', 'CLIM00076', 'CLIM00080'])
        ->and(array_column($home['brands'], 'name'))->toBe(['LG', 'Carrier', 'CIAT', 'Fitco', 'Simsek', 'GS', 'Lafarga', 'Alpha', 'Arfro'])
        ->and($home['pro']['phone']['display'])->toBe('0666-602599');
});

it('links unpublished sectors to the solutions hub only', function () {
    $tile = collect($this->getJson('/api/v1/home')->json('bento'))->firstWhere('key', 'solutions');

    expect(collect($tile['types'])->pluck('href', 'label')->all())->toBe([
        'Hôtels' => '/solutions',
        'Restaurants' => '/solutions/restaurants',
        'Bureaux' => '/solutions',
        'Écoles' => '/solutions',
        '…' => '/solutions',
    ]);
});

it('leaves out unpublished products', function () {
    Product::query()->where('slug', 'lg-dual-inverter')->update(['is_published' => false]);

    $names = array_column($this->getJson('/api/v1/home')->json('promotions.products'), 'name');

    expect($names)->not->toContain('LG Dual Inverter');
});

it('shows pro prices to a validated reseller only', function () {
    ProductVariant::query()->where('sku', 'CUIV0005')->update(['pro_price' => 40000]);
    $price = fn () => collect($this->getJson('/api/v1/home')->json('supplies'))->firstWhere('sku', 'CUIV0005')['price'];

    expect($price())->toBe(49500);

    $reseller = User::query()->whereHas('resellerAccount', fn ($q) => $q->where('status', ResellerStatus::Valide))->firstOrFail();
    Sanctum::actingAs($reseller);

    expect($price())->toBe(40000);
});
