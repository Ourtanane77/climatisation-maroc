<?php

use App\Enums\ResellerStatus;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ResellerAccount;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(fn () => $this->seed());

function productApiReseller(ResellerStatus $status = ResellerStatus::Valide): User
{
    $user = User::factory()->create();
    $user->assignRole(User::ROLE_RESELLER);
    ResellerAccount::query()->create([
        'user_id' => $user->id,
        'company' => 'Test Froid',
        'ice' => '000000000000001',
        'activity' => 'installateur',
        'phone' => '0612345678',
        'status' => $status,
    ]);

    return $user;
}

it('returns the product page with variants, specs, accessories, FAQ and same-range cards', function () {
    $this->getJson('/api/v1/products/lg-dual-inverter')
        ->assertOk()
        ->assertJsonPath('name', 'LG Dual Inverter')
        ->assertJsonPath('brand.official', true)
        ->assertJsonPath('category.href', '/climatisation/mural')
        ->assertJsonPath('breadcrumb.1.label', 'Climatisation')
        ->assertJsonPath('breadcrumb.3', ['label' => 'LG Dual Inverter'])
        ->assertJsonPath('selectorLabel', 'Puissance')
        ->assertJsonPath('variants.1.sku', 'D13AJH.N')
        ->assertJsonPath('variants.1.price', 550000)
        ->assertJsonPath('variants.1.regularPrice', 670000)
        ->assertJsonPath('variants.1.orderable', true)
        ->assertJsonPath('accessories.0.sku', 'CUIV0018')
        ->assertJsonPath('accessories.1.sku', 'CLIM00076')
        ->assertJsonPath('technicalVisitPrice', 30000)
        ->assertJsonPath('faq.0.question', "Quelle puissance choisir\u{202F}?") // French typography
        ->assertJsonPath('sameRange.0.brand', 'LG')
        ->assertJsonCount(4, 'sameRange')
        ->assertJsonPath('isReseller', false);
});

it('keeps variant-level specs on the variant', function () {
    $json = $this->getJson('/api/v1/products/lg-dual-inverter')->json();

    expect(collect($json['variants'][1]['specs'])->pluck('value', 'label')->all())
        ->toHaveKey('Puissance frigorifique', '12 000 BTU/h')
        ->and(collect($json['specs'])->pluck('label'))->toContain('Gamme', 'Classe climatique');
});

it('hides unpublished and unknown products', function () {
    Product::query()->where('slug', 'lg-dual-inverter')->update(['is_published' => false]);

    $this->getJson('/api/v1/products/lg-dual-inverter')->assertNotFound();
    $this->getJson('/api/v1/products/nexiste-pas')->assertNotFound();
});

it('shows pro prices to validated resellers only', function () {
    ProductVariant::query()->where('sku', 'D13AJH.N')->update(['pro_price' => 500000]);

    $this->getJson('/api/v1/products/lg-dual-inverter')->assertJsonPath('variants.1.price', 550000);

    Sanctum::actingAs(productApiReseller(ResellerStatus::EnAttente));
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertJsonPath('variants.1.price', 550000);

    Sanctum::actingAs(productApiReseller());
    $this->getJson('/api/v1/products/lg-dual-inverter')
        ->assertJsonPath('variants.1.price', 500000)
        ->assertJsonPath('isReseller', true);
});

it('compares up to three variants in the requested order', function () {
    $this->getJson('/api/v1/products/compare?skus=FSW12T24PM/N,D13AJH.N,42QHG012D8SC-R32,D10AWH.NW0')
        ->assertOk()
        ->assertJsonCount(3, 'products')
        ->assertJsonPath('products.0.sku', 'FSW12T24PM/N')
        ->assertJsonPath('products.1.name', "LG Dual Inverter 12\u{00A0}000\u{00A0}BTU")
        ->assertJsonPath('products.1.href', '/produit/lg-dual-inverter?v=D13AJH.N')
        ->assertJsonPath('rows.0', ['label' => 'Marque', 'values' => ['Fitco', 'LG', 'Carrier'], 'differs' => true])
        ->assertJsonPath('rows.1.differs', false)
        ->assertJsonPath('rows.4.values', ['—', '—', 'R32']);
});

it('ignores unknown or unpublished references in the comparison', function () {
    Product::query()->where('slug', 'carrier-mural-inverter-r32')->update(['is_published' => false]);

    $this->getJson('/api/v1/products/compare?skus=INCONNU,42QHG012D8SC-R32,D13AJH.N')
        ->assertOk()
        ->assertJsonCount(1, 'products')
        ->assertJsonPath('products.0.sku', 'D13AJH.N');
});

it('lists brands and shows a brand page grouped by category', function () {
    $this->getJson('/api/v1/brands')
        ->assertOk()
        ->assertJsonPath('data.0.slug', 'lg')
        ->assertJsonPath('data.0.logo', '/storage/brands/lg.png');

    $this->getJson('/api/v1/brands/lg')
        ->assertOk()
        ->assertJsonPath('brand.official', true)
        ->assertJsonPath('brand.features.0.title', 'Dual Inverter')
        ->assertJsonPath('groups.0.key', 'mural')
        ->assertJsonPath('groups.0.label', 'Mural')
        ->assertJsonPath('groups.0.products.0.name', 'LG Dual Inverter')
        ->assertJsonPath('others.0.slug', 'carrier')
        ->assertJsonPath('advicePhone.href', 'tel:+212666088348')
        ->assertJsonCount(4, 'others');
});

it('returns 404 for an inactive brand', function () {
    Brand::query()->where('slug', 'lg')->update(['is_active' => false]);

    $this->getJson('/api/v1/brands/lg')->assertNotFound();
});
