<?php

use App\Http\Controllers\Api\Pro\QuickOrderController;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Routing\Middleware\ThrottleRequestsWithRedis;

beforeEach(function () {
    $this->seed();
    // Rate limits are covered by the limiter itself; here they would only couple the tests.
    $this->withoutMiddleware([ThrottleRequests::class, ThrottleRequestsWithRedis::class]);
    $this->token = User::query()->where('email', 'contact@froid-atlas.ma')->firstOrFail()->createToken('test')->plainTextToken;
});

it('parses a pasted list like the design (separators, default quantity, duplicates summed)', function () {
    expect(QuickOrderController::parsePaste("cuiv0006 3\nCLIM00080;5\n\nGAZ00042 x2\nCUIV0006\nVENT0135"))->toBe([
        ['ref' => 'CUIV0006', 'qty' => 4],
        ['ref' => 'CLIM00080', 'qty' => 5],
        ['ref' => 'GAZ00042', 'qty' => 2],
        ['ref' => 'VENT0135', 'qty' => 1],
    ]);
});

it('resolves references with public and reseller prices', function () {
    ProductVariant::query()->where('sku', 'CUIV0005')->update(['pro_price' => 42000]);

    $response = $this->withToken($this->token)->postJson('/api/v1/pro/quick-order/resolve', [
        'lines' => [['ref' => 'cuiv0005', 'qty' => 4], ['ref' => 'CUIV0099', 'qty' => 1]],
    ])->assertOk();

    expect($response->json('lines.0.item.price'))->toBe(49500)
        ->and($response->json('lines.0.item.proPrice'))->toBe(42000)
        ->and($response->json('lines.0.item.name'))->toBe('Cuivre 1/4 Lafarga 15 m')
        ->and($response->json('lines.1.item'))->toBeNull();
});

it('suggests references for the autocomplete', function () {
    $skus = collect($this->withToken($this->token)->getJson('/api/v1/pro/references?q=CUIV00')->assertOk()->json('data'))->pluck('sku');

    expect($skus)->toHaveCount(5)->and($skus->first())->toStartWith('CUIV00');
});

it('lists the reseller frequent references', function () {
    $data = $this->withToken($this->token)->getJson('/api/v1/pro/frequent-refs')->assertOk()->json('data');

    expect($data)->not->toBeEmpty()->and($data[0])->toHaveKeys(['sku', 'name', 'price', 'proPrice']);
});

it('serves the public pro landing data', function () {
    $this->getJson('/api/v1/pro/landing')->assertOk()
        ->assertJsonCount(9, 'brands')
        ->assertJsonCount(3, 'faq')
        ->assertJsonPath('preview.0.ref', 'CUIV0005')
        ->assertJsonPath('preview.0.total', 198000);
});
