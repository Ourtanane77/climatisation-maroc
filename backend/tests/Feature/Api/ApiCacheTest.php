<?php

use App\Enums\ResellerStatus;
use App\Enums\StockStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Support\Api\ApiCache;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/*
| Public read API cached per URL (CacheApiResponses), flushed on any catalogue change, never for a
| reseller. Tests run with the array store, which supports tags like Redis.
*/

beforeEach(function () {
    $category = Category::query()->create(['name' => 'Climatiseurs muraux', 'slug' => 'mural']);
    $brand = Brand::query()->create(['name' => 'LG', 'slug' => 'lg']);
    $product = Product::query()->create(['category_id' => $category->id, 'brand_id' => $brand->id, 'name' => 'LG Dual Inverter', 'slug' => 'lg-dual-inverter', 'is_published' => true]);
    $product->variants()->create(['sku' => 'D13AJH.N', 'label' => '12 000 BTU', 'power_btu' => 12000, 'price' => 650000, 'promo_price' => 570000, 'pro_price' => 520000, 'stock_status' => StockStatus::EnStock, 'is_default' => true]);
});

function countQueries(Closure $callback): int
{
    DB::flushQueryLog();
    DB::enableQueryLog();
    $callback();
    $count = count(DB::getQueryLog());
    DB::disableQueryLog();

    return $count;
}

it('serves a repeated public request from the cache', function () {
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertOk()->assertHeader('X-Api-Cache', 'MISS');

    $queries = countQueries(fn () => $this->getJson('/api/v1/products/lg-dual-inverter')
        ->assertOk()
        ->assertHeader('X-Api-Cache', 'HIT')
        ->assertJsonPath('name', 'LG Dual Inverter'));

    expect($queries)->toBe(0);
});

it('treats query strings in any order as the same request', function () {
    $this->getJson('/api/v1/categories/mural/products?sort=price_asc&page=1')->assertHeader('X-Api-Cache', 'MISS');
    $this->getJson('/api/v1/categories/mural/products?page=1&sort=price_asc')->assertHeader('X-Api-Cache', 'HIT');
});

it('answers unknown query parameters live without storing them', function () {
    $this->getJson('/api/v1/categories/mural/products?sort=price_asc&r=8514')->assertOk()->assertHeaderMissing('X-Api-Cache');
    $this->getJson('/api/v1/categories/mural/products?sort=price_asc&r=8514')->assertOk()->assertHeaderMissing('X-Api-Cache');
    $this->getJson('/api/v1/search?q='.str_repeat('a', 150))->assertOk()->assertHeaderMissing('X-Api-Cache');
});

it('drops cached responses as soon as the catalogue changes', function () {
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertHeader('X-Api-Cache', 'MISS');

    Product::query()->where('slug', 'lg-dual-inverter')->first()->update(['name' => 'LG Dual Inverter R32']);

    $this->getJson('/api/v1/products/lg-dual-inverter')
        ->assertHeader('X-Api-Cache', 'MISS')
        ->assertJsonPath('name', 'LG Dual Inverter R32');
});

it('stops serving a product once it is unpublished', function () {
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertOk();

    Product::query()->where('slug', 'lg-dual-inverter')->first()->update(['is_published' => false]);

    $this->getJson('/api/v1/products/lg-dual-inverter')->assertNotFound();
});

it('never caches or serves cached data to a reseller', function () {
    Role::findOrCreate(User::ROLE_RESELLER, 'web');
    $user = User::factory()->create();
    $user->assignRole(User::ROLE_RESELLER);
    $user->resellerAccount()->create(['company' => 'Froid Atlas', 'ice' => '001528749000012', 'activity' => 'installateur', 'phone' => '0612345678', 'status' => ResellerStatus::Valide]);
    $token = $user->createToken('test')->plainTextToken;

    // A public entry exists…
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertHeader('X-Api-Cache', 'MISS');

    // …but the reseller (bearer token) gets a fresh answer, never stored.
    $this->withToken($token)->getJson('/api/v1/products/lg-dual-inverter')
        ->assertOk()
        ->assertHeaderMissing('X-Api-Cache');
    $this->withToken($token)->getJson('/api/v1/products/lg-dual-inverter')->assertHeaderMissing('X-Api-Cache');
});

it('leaves live endpoints uncached', function () {
    $this->getJson('/api/v1/resolve?path=/climatisation')->assertHeaderMissing('X-Api-Cache');
    $this->getJson('/api/v1/resolve?path=/climatisation')->assertHeaderMissing('X-Api-Cache');
    $this->postJson('/api/v1/cart/quote', ['lines' => []])->assertHeaderMissing('X-Api-Cache');
});

it('can be switched off', function () {
    config(['shop.api_cache' => false]);

    expect(ApiCache::enabled())->toBeFalse();
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertHeaderMissing('X-Api-Cache');
});
