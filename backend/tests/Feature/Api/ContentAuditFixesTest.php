<?php

use App\Models\Category;
use App\Models\Product;

/*
| Fixes from docs/audits/content-redaction.md and seo-technical.md (2026-10-07).
*/

beforeEach(fn () => $this->seed());

it('hides empty categories everywhere until a product is published in them', function () {
    $nav = json_encode($this->getJson('/api/v1/navigation')->json());
    expect($nav)->not->toContain('/chauffe-eau/chaudiere')
        ->and($this->getJson('/api/v1/resolve?path=/chauffe-eau/chaudiere')->json('type'))->toBe('none')
        ->and(collect($this->getJson('/api/v1/categories/chauffe-eau')->json('children'))->pluck('href')->all())->toBe(['/chauffe-eau/solaire'])
        // Quote-only ranges stay public although they have no product.
        ->and($this->getJson('/api/v1/resolve?path=/froid')->json('type'))->toBe('category');

    // A published product brings the category back.
    $product = Product::query()->published()->firstOrFail();
    $product->update(['category_id' => Category::query()->where('path', 'chauffe-eau/chaudiere')->value('id')]);
    expect($this->getJson('/api/v1/resolve?path=/chauffe-eau/chaudiere')->json('type'))->toBe('category');
});

it('never sends design placeholders to visitors', function () {
    $body = json_encode($this->getJson('/api/v1/pages/livraison-et-paiement')->assertOk()->json(), JSON_UNESCAPED_UNICODE);
    expect($body)->not->toContain('[DÉLAI PAR VILLE]')->not->toContain('[CONDITIONS DE RETOUR]');
});

it('applies French typography to public text but not to references and links', function () {
    $product = $this->getJson('/api/v1/products/lg-dual-inverter')->assertOk()->json();

    expect($product['faq'][0]['question'])->toEndWith("\u{202F}?")
        ->and(collect($product['variants'])->pluck('sku')->all())->toContain('D13AJH.N')
        ->and($product['href'] ?? '/produit/lg-dual-inverter')->not->toContain("\u{00A0}");
});
