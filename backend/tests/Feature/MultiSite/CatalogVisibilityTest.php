<?php

use App\Enums\StockStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\City;
use App\Models\Product;
use App\Settings\HomeSettings;
use App\Support\Sites\SiteSettings;

/*
| Two storefronts, one catalogue (config/sites.php): a record hidden on a site behaves there like an
| unpublished one (404, absent from listings, search, sitemap and menus), and stays on the other.
| No X-Site header = Climatisation Maroc (cm).
*/

const MS_ARFRO = ['X-Site' => 'arfro'];

beforeEach(function () {
    $this->range = Category::query()->create(['name' => 'Climatisation', 'slug' => 'climatisation', 'position' => 1]);
    $this->mural = Category::query()->create(['name' => 'Climatiseurs muraux', 'short_name' => 'Mural', 'slug' => 'mural', 'parent_id' => $this->range->id]);
    $this->lg = Brand::query()->create(['name' => 'LG', 'slug' => 'lg', 'is_active' => true]);

    $both = Product::query()->create(['category_id' => $this->mural->id, 'brand_id' => $this->lg->id, 'name' => 'LG Dual Inverter', 'slug' => 'lg-dual-inverter', 'is_published' => true]);
    $both->variants()->create(['sku' => 'D13AJH.N', 'label' => '12 000 BTU', 'power_btu' => 12000, 'price' => 650000, 'stock_status' => StockStatus::EnStock, 'is_default' => true]);

    $this->cmOnly = Product::query()->create(['category_id' => $this->mural->id, 'brand_id' => $this->lg->id, 'name' => 'LG Artcool', 'slug' => 'lg-artcool', 'is_published' => true, 'sites' => ['cm']]);
    $this->cmOnly->variants()->create(['sku' => 'UA19MKH0.NJ0', 'label' => '18 000 BTU', 'power_btu' => 18000, 'price' => 900000, 'stock_status' => StockStatus::EnStock, 'is_default' => true]);
});

it('answers 404 on arfro for a product hidden there and serves it on cm', function () {
    $this->getJson('/api/v1/products/lg-artcool')->assertOk()->assertJsonPath('name', 'LG Artcool');
    $this->getJson('/api/v1/products/lg-artcool', MS_ARFRO)->assertNotFound();
    $this->getJson('/api/v1/products/lg-dual-inverter', MS_ARFRO)->assertOk();
});

it('leaves a hidden product out of listings, search, sitemap, compare and menus on that site only', function () {
    $names = fn (array $headers) => collect($this->getJson('/api/v1/categories/climatisation/mural/products', $headers)->assertOk()->json('data'))->pluck('name')->all();
    expect($names([]))->toContain('LG Artcool')
        ->and($names(MS_ARFRO))->toBe(['LG Dual Inverter']);

    $search = fn (array $headers) => collect($this->getJson('/api/v1/search?q=lg', $headers)->json('data'))->pluck('name')->all();
    expect($search([]))->toContain('LG Artcool')
        ->and($search(MS_ARFRO))->not->toContain('LG Artcool');

    $paths = fn (array $headers) => collect($this->getJson('/api/v1/sitemap', $headers)->assertOk()->json('data'))->pluck('path')->all();
    expect($paths([]))->toContain('/produit/lg-artcool')
        ->and($paths(MS_ARFRO))->not->toContain('/produit/lg-artcool')
        ->and($paths(MS_ARFRO))->toContain('/produit/lg-dual-inverter');

    expect($this->getJson('/api/v1/products/compare?skus=UA19MKH0.NJ0,D13AJH.N', MS_ARFRO)->json('products'))->toHaveCount(1);

    // Mega menu featured product of the range: hidden on arfro.
    foreach (['cm', 'arfro'] as $site) {
        $home = SiteSettings::for(HomeSettings::class, $site);
        $home->mega_featured = ['climatisation' => $this->cmOnly->id];
        $home->save();
    }
    expect($this->getJson('/api/v1/navigation')->json('ranges.0.mega.featured.sku'))->toBe('UA19MKH0.NJ0')
        ->and($this->getJson('/api/v1/navigation', MS_ARFRO)->json('ranges.0.mega.featured'))->toBeNull();
});

it('hides the products of a brand or category hidden on a site, and their pages', function () {
    $this->lg->update(['sites' => ['cm']]);

    $this->getJson('/api/v1/brands/lg', MS_ARFRO)->assertNotFound();
    $this->getJson('/api/v1/products/lg-dual-inverter', MS_ARFRO)->assertNotFound();
    expect($this->getJson('/api/v1/navigation', MS_ARFRO)->json('ranges'))->toBe([]);
    $this->getJson('/api/v1/brands/lg')->assertOk();

    $this->lg->update(['sites' => ['cm', 'arfro']]);
    $this->range->update(['sites' => ['cm']]);

    // The sub-category of a hidden range is hidden too, with its products.
    $this->getJson('/api/v1/categories/climatisation/mural', MS_ARFRO)->assertNotFound();
    $this->getJson('/api/v1/resolve?path=/climatisation/mural', MS_ARFRO)->assertJsonPath('type', 'none');
    $this->getJson('/api/v1/products/lg-dual-inverter', MS_ARFRO)->assertNotFound();
    $this->getJson('/api/v1/resolve?path=/climatisation/mural')->assertJsonPath('type', 'category');
});

it('refuses a product hidden on the site in the basket and the order, with a French message', function () {
    City::query()->create(['name' => 'Marrakech', 'slug' => 'marrakech', 'position' => 1]);

    $this->postJson('/api/v1/cart/quote', ['lines' => [['sku' => 'UA19MKH0.NJ0', 'qty' => 1]]], MS_ARFRO)
        ->assertOk()
        ->assertJsonPath('invalid.0', ['sku' => 'UA19MKH0.NJ0', 'reason' => 'introuvable'])
        ->assertJsonPath('subtotal', 0);

    $this->postJson('/api/v1/orders', [
        'name' => 'Yassine El Amrani', 'phone' => '06 12 34 56 78', 'city' => 'marrakech', 'address' => '24 rue Ibn Sina',
        'cgv' => true, 'lines' => [['sku' => 'UA19MKH0.NJ0', 'qty' => 1]], 'website' => '', '_t' => 12000,
    ], MS_ARFRO)
        ->assertUnprocessable()
        ->assertJsonPath('errors.lines.0', 'Article indisponible : UA19MKH0.NJ0. Retirez-le du panier pour continuer.');

    $this->postJson('/api/v1/cart/quote', ['lines' => [['sku' => 'UA19MKH0.NJ0', 'qty' => 1]]])
        ->assertJsonPath('lines.0.sku', 'UA19MKH0.NJ0');
});

it('does not leak one site\'s cached response to the other', function () {
    $this->cmOnly->update(['site_content' => ['arfro' => ['name' => 'Arfro Artcool']], 'sites' => ['cm', 'arfro']]);

    $this->getJson('/api/v1/products/lg-artcool')->assertHeader('X-Api-Cache', 'MISS')->assertJsonPath('name', 'LG Artcool');
    $this->getJson('/api/v1/products/lg-artcool', MS_ARFRO)->assertHeader('X-Api-Cache', 'MISS')->assertJsonPath('name', 'Arfro Artcool');
    $this->getJson('/api/v1/products/lg-artcool', MS_ARFRO)->assertHeader('X-Api-Cache', 'HIT')->assertJsonPath('name', 'Arfro Artcool');
    $this->getJson('/api/v1/products/lg-artcool')->assertHeader('X-Api-Cache', 'HIT')->assertJsonPath('name', 'LG Artcool');
});
