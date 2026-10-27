<?php

use App\Filament\Resources\Brands\Pages\ManageBrands;
use App\Filament\Resources\Categories\Pages\EditCategory;
use App\Models\Brand;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;

/*
| Brand order of the listings (owner request of 2026-10-27: « LG / CARRIER / FITCO / CIAT » in
| « Clim mural »): general order (Marques, drag and drop), per-category override (« Ordre des
| marques »), default sort « Pertinence ».
*/

beforeEach(fn () => $this->seed());

const MURAL = '/api/v1/categories/climatisation/mural/products?per_page=48';

/** Brands of the listing in order of first appearance, checking each brand forms one block. */
function brandBlocks(array $cards): array
{
    $blocks = [];
    foreach (array_column($cards, 'brand') as $brand) {
        if (end($blocks) !== $brand) {
            $blocks[] = $brand;
        }
    }
    expect($blocks)->toBe(array_values(array_unique($blocks)));

    return $blocks;
}

function brandId(string $slug): int
{
    return (int) Brand::query()->where('slug', $slug)->value('id');
}

it('lists « Clim mural » by brand by default: LG, Carrier, Fitco, CIAT', function () {
    $listing = $this->getJson(MURAL)->assertOk()->json();

    expect($listing['meta']['sort'])->toBe('relevance')
        ->and(brandBlocks($listing['data']))->toBe(['LG', 'Carrier', 'Fitco', 'CIAT'])
        // Within a brand, the catalogue order.
        ->and($listing['data'][0]['name'])->toStartWith('LG Dual Inverter')
        ->and(collect($listing['facets'])->firstWhere('key', 'brand')['values'])->sequence(
            fn ($v) => $v->label->toBe('LG'),
            fn ($v) => $v->label->toBe('Carrier'),
            fn ($v) => $v->label->toBe('Fitco'),
            fn ($v) => $v->label->toBe('CIAT'),
        );

    expect(collect($this->getJson('/api/v1/categories/climatisation/mural')->json('brands'))->pluck('name')->all())
        ->toBe(['LG', 'Carrier', 'Fitco', 'CIAT']);
});

it('keeps the explicit sorts', function () {
    $prices = fn (string $sort) => collect($this->getJson(MURAL."&sort={$sort}")->json('data'))->pluck('price')->all();

    $asc = $prices('price_asc');
    $sorted = $asc;
    sort($sorted);
    expect($asc)->toBe($sorted)
        ->and($prices('price_desc'))->toBe(array_reverse($sorted));

    $names = collect($this->getJson(MURAL.'&sort=name')->json('data'))->pluck('name')->map(fn ($n) => mb_strtolower($n))->all();
    $sortedNames = $names;
    sort($sortedNames);
    expect($names)->toBe($sortedNames);
});

it('follows the category override first, then the general brand order', function () {
    $mural = Category::query()->where('path', 'climatisation/mural')->firstOrFail();
    $mural->update(['brand_order' => [brandId('ciat'), brandId('lg')]]);

    // Carrier and Fitco are not listed: they follow in the general order.
    expect(brandBlocks($this->getJson(MURAL)->json('data')))->toBe(['CIAT', 'LG', 'Carrier', 'Fitco']);

    // Empty override: the general order (Marques), here changed to Fitco, CIAT, Carrier, LG.
    $mural->update(['brand_order' => null]);
    foreach (['fitco', 'ciat', 'carrier', 'lg'] as $i => $slug) {
        Brand::query()->where('slug', $slug)->update(['position' => $i]);
    }
    expect(brandBlocks($this->getJson(MURAL)->json('data')))->toBe(['Fitco', 'CIAT', 'Carrier', 'LG']);
});

it('reorders brands by drag and drop in the back office and refreshes the cached listing', function () {
    Category::query()->where('path', 'climatisation/mural')->update(['brand_order' => null]);
    $this->getJson(MURAL)->assertHeader('X-Api-Cache', 'MISS');
    $this->getJson(MURAL)->assertHeader('X-Api-Cache', 'HIT');

    $admin = User::factory()->create();
    $admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($admin);
    $others = Brand::query()->whereNotIn('slug', ['ciat', 'fitco', 'carrier', 'lg'])->orderBy('position')->pluck('id')->all();
    Livewire::test(ManageBrands::class)
        ->call('reorderTable', array_map('strval', [brandId('ciat'), brandId('fitco'), brandId('carrier'), brandId('lg'), ...$others]));

    expect(Brand::query()->orderBy('position')->limit(4)->pluck('slug')->all())->toBe(['ciat', 'fitco', 'carrier', 'lg']);

    // The reorder (one UPDATE, no model events) flushed the API cache (read as a visitor).
    $this->app['auth']->forgetGuards();
    $listing = $this->getJson(MURAL)->assertHeader('X-Api-Cache', 'MISS')->json('data');
    expect(brandBlocks($listing))->toBe(['CIAT', 'Fitco', 'Carrier', 'LG']);
});

it('saves the category brand order from the edit form', function () {
    $admin = User::factory()->create();
    $admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($admin);
    $mural = Category::query()->where('path', 'climatisation/mural')->firstOrFail();

    Livewire::test(EditCategory::class, ['record' => $mural->getRouteKey()])
        ->assertSee('Laisser vide pour suivre l’ordre général des marques', false)
        ->assertSet('data.brand_order', [brandId('lg'), brandId('carrier'), brandId('fitco'), brandId('ciat')])
        ->set('data.brand_order', [(string) brandId('fitco'), (string) brandId('lg')])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($mural->refresh()->brandOrder())->toBe([brandId('fitco'), brandId('lg')])
        ->and(brandBlocks($this->getJson(MURAL)->json('data')))->toBe(['Fitco', 'LG', 'Carrier', 'CIAT']);
});

it('sets the owner order in the migration, idempotently and without a missing brand', function () {
    $migration = require database_path('migrations/2026_10_27_100000_add_brand_order_to_categories.php');
    $positions = fn () => Brand::query()->orderBy('position')->orderBy('id')->pluck('slug')->all();

    // Before: the former design order, no override.
    foreach (['ciat', 'fitco', 'carrier', 'lg'] as $i => $slug) {
        Brand::query()->where('slug', $slug)->update(['position' => $i]);
    }
    DB::table('categories')->where('path', 'climatisation/mural')->update(['brand_order' => null]);
    $before = array_values(array_diff($positions(), ['lg', 'carrier', 'fitco', 'ciat']));

    $migration->up();
    $migration->up();

    expect($positions())->toBe(['lg', 'carrier', 'fitco', 'ciat', ...$before])
        ->and(Brand::query()->where('slug', 'lg')->value('position'))->toBe(1)
        ->and(Category::query()->where('path', 'climatisation/mural')->firstOrFail()->brandOrder())
        ->toBe([brandId('lg'), brandId('carrier'), brandId('fitco'), brandId('ciat')]);

    // A brand that no longer exists is skipped (matched on slug or name, case-insensitive).
    Brand::query()->where('slug', 'ciat')->update(['slug' => 'ciat-ancien', 'name' => 'Ancien']);
    Brand::query()->where('slug', 'carrier')->update(['slug' => 'carrier-maroc', 'name' => 'CARRIER']);
    $migration->up();

    expect(array_slice($positions(), 0, 3))->toBe(['lg', 'carrier-maroc', 'fitco'])
        ->and(Category::query()->where('path', 'climatisation/mural')->firstOrFail()->brandOrder())
        ->toBe([brandId('lg'), brandId('carrier-maroc'), brandId('fitco')]);
});
