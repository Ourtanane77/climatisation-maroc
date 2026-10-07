<?php

/*
| Filter rules of the category listings (owner's request, 2026-10-07): facets only when they split
| the listing, a "Dimension" facet for ducts and diffusers, price bands that adapt to cheap products,
| and the unfiltered count the page uses to hide filters and sort for a single product.
*/

beforeEach(fn () => $this->seed());

function facetKeys(array $response): array
{
    return array_column($response['facets'], 'key');
}

it('returns no facet and an unfiltered count of 1 for a single-product category', function () {
    $r = $this->getJson('/api/v1/categories/ventilation/multizone/products')->assertOk()->json();

    expect($r['facets'])->toBe([])
        ->and($r['meta']['unfilteredTotal'])->toBe(1);
});

it('drops facets whose only value covers every product', function () {
    // Every circular duct has no brand and the same technology: only dimension and price split them.
    $r = $this->getJson('/api/v1/categories/gaines/gaines-circulaires/products')->json();

    expect(facetKeys($r))->toBe(['size', 'price'])
        ->and($r['meta']['unfilteredTotal'])->toBe(5);
});

it('offers dimensions for ducts and diffusers, diameters first', function () {
    $r = $this->getJson('/api/v1/categories/ventilation/grilles-et-diffuseurs/products')->json();
    $sizes = collect($r['facets'])->firstWhere('key', 'size')['values'];

    expect(array_column($sizes, 'value'))->toBe(['d100', 'd125', 'd160', 'd200', 'd250', 'd300', '150x150', '225x225', '375x375', '450x450'])
        ->and($sizes[0]['label'])->toBe("Ø\u{00A0}100");

    $square = $this->getJson('/api/v1/categories/ventilation/grilles-et-diffuseurs/products?size=450x450')->json();
    expect($square['meta']['total'])->toBe(1)
        ->and($square['data'][0]['name'])->toContain('450/450');
});

it('cuts price bands at round amounts when the design bands do not split the listing', function () {
    $r = $this->getJson('/api/v1/categories/gaines/gaines-circulaires/products')->json();
    $bands = collect($r['facets'])->firstWhere('key', 'price')['values'];

    expect(array_column($bands, 'value'))->toBe(['moins-200', 'plus-200']);

    $cheap = $this->getJson('/api/v1/categories/gaines/gaines-circulaires/products?price=moins-200')->json();
    expect(collect($cheap['data'])->pluck('price')->every(fn ($p) => $p < 20000))->toBeTrue();
});

it('keeps the facets of the unfiltered listing when a filter leaves no product', function () {
    $r = $this->getJson('/api/v1/categories/gaines/gaines-circulaires/products?size=d100&price=plus-200')->json();

    expect($r['meta']['total'])->toBe(0)
        ->and($r['meta']['unfilteredTotal'])->toBe(5)
        ->and(facetKeys($r))->toBe(['size', 'price']);
});
