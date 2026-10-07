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

    expect($variant->price)->toBe(670000)
        ->and($variant->promo_price)->toBe(550000)
        ->and($variant->sellingPrice())->toBe(550000)
        ->and($variant->legacy_id)->toBe(81)
        ->and($variant->product->name)->toBe('LG Dual Inverter')
        ->and($variant->product->category->path)->toBe('climatisation/mural')
        ->and(ProductVariant::query()->where('sku', 'CLIM00008')->value('price'))->toBe(300); // Excel price wins
});

it('flags the three suspect references and the design-only products', function () {
    foreach (['42HY48VSA', 'FSW18T23PW/N', 'UA13MUH0.MJO'] as $sku) {
        $variant = ProductVariant::query()->where('sku', $sku)->firstOrFail();
        expect($variant->needs_verification)->toBeTrue()->and($variant->verification_note)->not->toBeEmpty();
    }

    $cassette = ProductVariant::query()->where('sku', 'ATNW18GPLS1')->firstOrFail()->product;
    expect($cassette->needs_verification)->toBeTrue()
        // 3 suspect catalogue references, the design-only LG cassette, 3 rows noted by the old-site import,
        // and the Excel additions (62 new products + 4 products with new powers, minus overlaps).
        ->and(Product::query()->needsVerification()->count())->toBe(73);

    // Design products confirmed by the old site lose their flag and take its data.
    $copper = ProductVariant::query()->where('sku', 'CUIV0009')->firstOrFail();
    expect($copper->legacy_id)->toBe(308)
        ->and($copper->stock_status)->toBe(StockStatus::EnStock)
        ->and($copper->product->needs_verification)->toBeFalse();
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

    expect($order->total)->toBe(674000)->and($order->lines)->toHaveCount(3);
});

it('applies the Excel list: prices, new items with temporary references, merged powers', function () {
    // New powers join the existing product page; the variant is flagged until its real reference is entered.
    $cassette = ProductVariant::query()->where('sku', 'XLS-CARRIERCASSETTER32-12000')->firstOrFail();
    expect($cassette->price)->toBe(850000)
        ->and($cassette->power_btu)->toBe(12000)
        ->and($cassette->needs_verification)->toBeTrue()
        ->and($cassette->product->slug)->toBe('carrier-cassette-inverter')
        ->and($cassette->product->is_published)->toBeTrue()
        ->and($cassette->product->variants->pluck('power_btu')->all())->toBe([12000, 18000, 24000, 36000, 48000]);

    // New products are published; without an Excel price they are « Prix sur demande » (0).
    $grille = ProductVariant::query()->where('sku', 'XLS-GRILLESIMPLE6010')->firstOrFail();
    expect($grille->price)->toBe(0)
        ->and($grille->product->is_published)->toBeTrue()
        ->and(ProductVariant::query()->where('sku', 'like', 'XLS-%')->count())->toBe(73)
        // Excel prices win, without promotion.
        ->and(ProductVariant::query()->where('sku', 'FSW09T24PM/N')->first()?->only(['price', 'promo_price']))->toBe(['price' => 375000, 'promo_price' => null])
        // The Excel's adhesive band is the site's CLIM00399 (duplicate not created).
        ->and(ProductVariant::query()->where('sku', 'CLIM00399')->value('price'))->toBe(5000);
});
