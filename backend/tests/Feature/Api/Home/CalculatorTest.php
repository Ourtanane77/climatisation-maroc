<?php

use App\Models\Product;
use App\Support\Calculator\PowerCalculator;

/*
| Parity with frontend/src/lib/power.ts: the same cases are checked in src/lib/lib.test.ts.
*/

$nb = "\u{00A0}";

it('matches the calculator page default: 18 m² → 10 800 BTU → 12 000', function () use ($nb) {
    $r = PowerCalculator::compute(18);

    expect($r['tier']['btu'])->toBe(12000)
        ->and($r['tierIndex'])->toBe(1)
        ->and($r['explanation'])->toBe("Pour 18{$nb}m² : besoin estimé d’environ 10{$nb}800 BTU.");
});

it('follows the tier table at standard exposure', function (int $surface, int $tierIndex) {
    expect(PowerCalculator::compute($surface)['tierIndex'])->toBe($tierIndex);
})->with([[15, 0], [16, 1], [20, 1], [30, 2], [40, 3], [41, 4]]);

it('goes one size up for a very sunny room or a top floor', function () {
    expect(PowerCalculator::compute(20, sun: 'forte')['tier']['btu'])->toBe(18000)
        ->and(PowerCalculator::compute(20, topFloor: true)['tier']['btu'])->toBe(18000)
        ->and(PowerCalculator::compute(14, sun: 'faible')['tier']['btu'])->toBe(9000);
});

it('lists the reasons and clamps the surface', function () use ($nb) {
    expect(PowerCalculator::compute(25, ceiling: 'haute', room: 'cuisine-ouverte')['explanation'])
        ->toBe("Pour 25{$nb}m², avec plafond haut, cuisine ouverte : besoin estimé d’environ 21{$nb}600 BTU.")
        ->and(PowerCalculator::compute(2)['explanation'])->toContain("Pour 8{$nb}m²")
        ->and(PowerCalculator::compute(500)['explanation'])->toContain("Pour 60{$nb}m²");
});

it('answers GET /calculator/power with the call to action and matching air conditioners', function () {
    $this->seed();

    $this->getJson('/api/v1/calculator/power?surface=18')
        ->assertOk()
        ->assertJsonPath('tierIndex', 1)
        ->assertJsonPath('cta.href', '/climatisation/mural?puissance=12000')
        ->assertJsonPath('products.0.sku', 'D13AJH.N')
        ->assertJsonPath('products.0.price', 550000)
        ->assertJsonPath('products.0.regularPrice', 670000);

    $this->getJson('/api/v1/calculator/power?surface=55')
        ->assertOk()
        ->assertJsonPath('tierIndex', 4)
        ->assertJsonPath('cta.href', '/climatisation/gainable');

    $this->getJson('/api/v1/calculator/power?surface=18&sun=brulant')->assertUnprocessable();
});

it('lists matching air conditioners for every tier, only published ones', function () {
    $this->seed();
    Product::query()->where('slug', 'lg-dual-inverter')->update(['is_published' => false]);

    $tiers = $this->getJson('/api/v1/calculator/products')->assertOk()->json('tiers');

    expect($tiers)->toHaveCount(5)
        ->and(collect($tiers)->flatMap(fn ($t) => array_column($t['products'], 'sku'))->all())->not->toContain('D13AJH.N')
        ->and(count($tiers[1]['products']))->toBeLessThanOrEqual(3);
});
