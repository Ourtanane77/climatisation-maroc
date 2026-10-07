<?php

use App\Enums\StockStatus;
use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\City;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/*
| « Prix sur demande »: a variant with price 0 (items added from the client's Excel without a
| price) is shown but never orderable.
*/

beforeEach(function () {
    City::query()->create(['name' => 'Marrakech', 'slug' => 'marrakech', 'position' => 1]);
    $category = Category::query()->create(['name' => 'Grilles', 'slug' => 'grilles']);

    $this->grille = Product::query()->create(['category_id' => $category->id, 'name' => 'Grille Simple 60/10', 'slug' => 'grille-simple-6010']);
    $this->grille->variants()->create(['sku' => 'XLS-GRILLE', 'price' => 0, 'stock_status' => StockStatus::EnStock, 'position' => 0]);

    $this->mixed = Product::query()->create(['category_id' => $category->id, 'name' => 'Cassette', 'slug' => 'cassette']);
    $this->mixed->variants()->create(['sku' => 'XLS-12000', 'label' => '12 000 BTU', 'power_btu' => 12000, 'price' => 0, 'stock_status' => StockStatus::EnStock, 'position' => 0]);
    $this->mixed->variants()->create(['sku' => 'REAL-24000', 'label' => '24 000 BTU', 'power_btu' => 24000, 'price' => 1250000, 'stock_status' => StockStatus::EnStock, 'position' => 1]);
});

function onRequestOrder(array $lines): array
{
    return [
        'name' => 'Yassine El Amrani', 'phone' => '0612345678', 'city' => 'marrakech', 'address' => '24 rue Ibn Sina',
        'cgv' => true, 'lines' => $lines, 'website' => '', '_t' => 12000,
    ];
}

it('quotes an on-request line as not orderable and out of the total', function () {
    $quote = $this->postJson('/api/v1/cart/quote', ['lines' => [['sku' => 'XLS-GRILLE', 'qty' => 2], ['sku' => 'REAL-24000', 'qty' => 1]]])
        ->assertOk()->json();

    $grille = collect($quote['lines'])->firstWhere('sku', 'XLS-GRILLE');
    expect($grille['onRequest'])->toBeTrue()
        ->and($grille['available'])->toBeFalse()
        ->and($quote['subtotal'])->toBe(1250000)
        ->and($quote['count'])->toBe(1);
});

it('refuses an order containing an on-request item', function () {
    Mail::fake();

    $this->postJson('/api/v1/orders', onRequestOrder([['sku' => 'XLS-GRILLE', 'qty' => 1]]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['lines' => 'Prix sur demande']);

    $this->postJson('/api/v1/orders', onRequestOrder([['sku' => 'REAL-24000', 'qty' => 1]]))->assertCreated();
});

it('prices a card from the lowest real price and flags fully on-request cards', function () {
    $request = Request::create('/');
    $load = fn (Product $p) => (new ProductCardResource($p->load(['variants', 'images', 'brand'])))->toArray($request);

    $mixed = $load($this->mixed);
    expect($mixed['price'])->toBe(1250000)
        ->and($mixed['fromPrice'])->toBeTrue()
        ->and($mixed['onRequest'])->toBeFalse()
        ->and(collect($mixed['options'])->firstWhere('sku', 'XLS-12000')['onRequest'])->toBeTrue();

    $grille = $load($this->grille);
    expect($grille['price'])->toBe(0)
        ->and($grille['onRequest'])->toBeTrue()
        ->and($grille['fromPrice'])->toBeFalse();
});

it('marks on-request variants as not orderable on the product page', function () {
    $variants = collect($this->getJson('/api/v1/products/cassette')->assertOk()->json('variants'))->keyBy('sku');

    expect($variants['XLS-12000']['onRequest'])->toBeTrue()
        ->and($variants['XLS-12000']['orderable'])->toBeFalse()
        ->and($variants['REAL-24000']['orderable'])->toBeTrue()
        ->and(ProductVariant::query()->where('sku', 'XLS-GRILLE')->firstOrFail()->isOnRequest())->toBeTrue();
});
