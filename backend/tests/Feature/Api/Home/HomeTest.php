<?php

use App\Enums\ResellerStatus;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Settings\HomeSettings;
use Laravel\Sanctum\Sanctum;

beforeEach(fn () => $this->seed());

it('returns the home sections from the settings and the catalogue', function () {
    $home = $this->getJson('/api/v1/home')->assertOk()->json();

    expect($home['hero']['title'])->toBe("Jusqu’à -30\u{202F}% sur toute la gamme de climatiseurs") // French typography
        ->and(array_column($home['bento'], 'key'))->toBe(['climatisation', 'chauffe-eau', 'ventilation', 'gaines', 'cuivre-et-gaz', 'pieces-de-rechange', 'solutions'])
        ->and(array_column($home['bento'][0]['types'], 'href'))->toContain('/climatisation/mural')
        ->and($home['newProducts'][0]['badge'])->toBe(['text' => 'Nouveau', 'tone' => 'brand'])
        // Only families with a real discount (the Excel prices removed the others' promotions).
        ->and($home['promotions']['products'][0]['name'])->toBe('LG Dual Inverter')
        ->and(collect($home['promotions']['products'])->every(fn ($p) => $p['badge'] !== null))->toBeTrue()
        ->and($home['promotions']['brands'])->toBe(collect($home['promotions']['products'])->pluck('brand')->unique()->values()->all())
        // Whole Gaines range, automatically: rigid ducts, then flexibles souples, then isolés, by diameter.
        ->and(array_slice(array_column($home['ducts'], 'sku'), 0, 6))->toBe(['VENT00130', 'VENT00131', 'VENT00132', 'VENT00133', 'VENT00134', 'CLIM00322'])
        ->and($home['ducts'][0])->toMatchArray(['diameter' => 100, 'kind' => 'rigide', 'href' => '/produit/gaines-circulaires-3-m-q100'])
        ->and($home['ducts'][5])->toMatchArray(['diameter' => 100, 'kind' => 'souple'])
        ->and(collect($home['ducts'])->firstWhere('sku', 'XLS-FLEXISOLEESBO125'))->toMatchArray(['kind' => 'calo', 'price' => 0, 'onRequest' => true])
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

it('puts the families chosen in the settings first in the ducts rail', function () {
    $settings = app(HomeSettings::class);
    $settings->ducts_product_ids = [ProductVariant::query()->where('sku', 'CLIM00319')->value('product_id')];
    $settings->save();

    expect($this->getJson('/api/v1/home')->json('ducts.0.sku'))->toBe('CLIM00319');
});
