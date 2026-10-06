<?php

use App\Enums\StockStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Order;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SectorPage;

beforeEach(fn () => $this->seed());

it('seeds the catalogue with catalog.json prices in centimes', function () {
    $variant = ProductVariant::query()->where('sku', 'D13AJH.N')->firstOrFail();

    expect($variant->price)->toBe(650000)
        ->and($variant->promo_price)->toBe(570000)
        ->and($variant->sellingPrice())->toBe(570000)
        ->and($variant->legacy_id)->toBe(81)
        ->and($variant->product->name)->toBe('LG Dual Inverter')
        ->and($variant->product->category->path)->toBe('climatisation/mural')
        ->and(ProductVariant::query()->where('sku', 'CLIM00008')->value('price'))->toBe(350);
});

it('flags the three suspect references and the design-only products', function () {
    foreach (['42HY48VSA', 'FSW18T23PW/N', 'UA13MUH0.MJO'] as $sku) {
        $variant = ProductVariant::query()->where('sku', $sku)->firstOrFail();
        expect($variant->needs_verification)->toBeTrue()->and($variant->verification_note)->not->toBeEmpty();
    }

    $cassette = ProductVariant::query()->where('sku', 'ATNW18GPLS1')->firstOrFail()->product;
    expect($cassette->needs_verification)->toBeTrue()
        ->and(ProductVariant::query()->where('sku', 'CUIV0009')->value('stock_status'))->toBe(StockStatus::Rupture)
        // 3 catalogue variants + 14 design-only families.
        ->and(Product::query()->needsVerification()->count())->toBe(17);
});

it('keeps the old category ids for redirects', function () {
    expect(Category::query()->where('path', 'climatisation/mural')->value('legacy_id'))->toBe(3)
        ->and(Category::query()->where('path', 'froid')->value('legacy_id'))->toBe(12)
        ->and(Category::query()->where('path', 'pieces-de-rechange')->value('legacy_id'))->toBe(13);
});

it('publishes only pages that have real content', function () {
    expect(SectorPage::query()->where('is_published', true)->pluck('slug')->all())->toBe(['restaurants'])
        ->and(Article::query()->published()->count())->toBe(1)
        ->and(Page::query()->where('kind', 'legal')->where('is_published', true)->count())->toBe(0)
        ->and(Page::query()->whereIn('slug', ['a-propos', 'livraison-et-paiement'])->where('is_published', true)->count())->toBe(2);
});

it('is idempotent', function () {
    $counts = [Product::query()->count(), ProductVariant::query()->count(), Category::query()->count(), Order::query()->count()];

    $this->seed();

    expect([Product::query()->count(), ProductVariant::query()->count(), Category::query()->count(), Order::query()->count()])->toBe($counts);
});

it('creates the demo order of the design', function () {
    $order = Order::query()->where('reference', 'CM-2026-01042')->firstOrFail();

    expect($order->total)->toBe(694000)->and($order->lines)->toHaveCount(3);
});
