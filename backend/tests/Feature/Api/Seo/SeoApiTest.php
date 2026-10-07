<?php

use App\Models\Article;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Redirect;
use App\Models\SectorPage;
use Illuminate\Testing\TestResponse;

/*
| sitemap.xml data and old-site URL redirects (docs/plan.md §5, "SEO").
*/

beforeEach(fn () => $this->seed());

function sitemapPaths(): array
{
    return collect(test()->getJson('/api/v1/sitemap')->assertOk()->json('data'))->pluck('path')->all();
}

it('leaves out empty categories but keeps quote-only ranges, and lists product photos', function () {
    $paths = sitemapPaths();

    // Chaudière has no product; Froid is a quote-only range page.
    expect($paths)->not->toContain('/chauffe-eau/chaudiere')
        ->and($paths)->toContain('/chauffe-eau', '/chauffe-eau/solaire', '/froid');

    $lg = collect($this->getJson('/api/v1/sitemap')->json('data'))->firstWhere('path', '/produit/lg-dual-inverter');
    expect($lg['images'])->each->toStartWith('/storage/');
});

function legacy(string $path): TestResponse
{
    return test()->getJson('/api/v1/redirects/legacy?path='.rawurlencode($path));
}

it('lists the live catalogue and content with their last change', function () {
    $paths = sitemapPaths();

    expect($paths)->toContain('/', '/climatisation', '/climatisation/mural', '/produit/lg-dual-inverter', '/marques/lg',
        '/promotions', '/blog', '/solutions/restaurants', '/services/installation', '/a-propos', '/contact', '/plan-du-site')
        ->and($paths)->toHaveCount(count(array_unique($paths)));

    $home = collect($this->getJson('/api/v1/sitemap')->json('data'))->firstWhere('path', '/produit/lg-dual-inverter');
    expect($home['lastmod'])->not->toBeNull();
});

it('never lists unpublished or inactive records', function () {
    Product::query()->where('slug', 'lg-dual-inverter')->update(['is_published' => false]);
    Category::query()->where('path', 'gaines')->update(['is_active' => false]);
    Brand::query()->where('slug', 'vivo')->update(['is_active' => false]);
    $draft = Article::query()->where('is_published', false)->firstOrFail();
    $sector = SectorPage::query()->where('is_published', false)->firstOrFail();

    $paths = sitemapPaths();

    expect($paths)->not->toContain('/produit/lg-dual-inverter', '/gaines', '/gaines/flexibles-souples',
        '/produit/flexible-souple-esbo-10-m', '/marques/vivo', $draft->url(), $sector->url(), '/cgv', '/cgu');
    // Pages of kind "other" back fixed routes and are listed once, by their route.
    expect(array_count_values($paths)['/espace-professionnel'])->toBe(1);
});

it('sends an old product URL to its family, selecting the variant', function () {
    $variant = ProductVariant::query()->where('sku', 'ABNW36GM2S1.ENWBME')->firstOrFail();

    legacy("/produit/details/{$variant->legacy_id}/LG GAINABLE INVERTER 36000 Btu/h")
        ->assertOk()
        ->assertJson(['type' => 'redirect', 'to' => '/produit/lg-gainable-inverter?v=ABNW36GM2S1.ENWBME', 'status' => 301]);

    $single = ProductVariant::query()->whereNotNull('legacy_id')->get()
        ->first(fn (ProductVariant $v) => $v->product->variants()->count() === 1);
    legacy("/produit/details/{$single->legacy_id}/x")->assertJson(['to' => $single->product->url(), 'status' => 301]);
});

it('sends an unpublished product to its category, temporarily', function () {
    $variant = ProductVariant::query()->where('sku', 'ABNW36GM2S1.ENWBME')->firstOrFail();
    $variant->product->update(['is_published' => false]);

    legacy("/produit/details/{$variant->legacy_id}/x")->assertJson(['to' => '/climatisation/gainable', 'status' => 302]);
});

it('sends old category, brand and shortcut URLs to their new pages', function () {
    legacy('/produit/service/3/Climatisation/Mono Split')->assertJson(['to' => '/climatisation/mural', 'status' => 301]);
    // Old « Chaudière » (id 11) has no product yet: its range, temporarily (no soft 404).
    legacy('/produit/service/11/Chauffe eau/Chaudière')->assertJson(['to' => '/chauffe-eau', 'status' => 302]);
    legacy('/produit/service/12/Froid/Chambre Froide')->assertJson(['to' => '/froid']);
    // Old id with no match: the range named in the URL.
    legacy('/produit/service/6/Climatisation/x')->assertJson(['to' => '/climatisation', 'status' => 301]);
    legacy('/produit/service/99/Piece de rechange/x')->assertJson(['to' => '/pieces-de-rechange']);
    legacy('/produit/marque/4/LG')->assertJson(['to' => '/marques/lg', 'status' => 301]);
    legacy('/produit/cuivre/cuivre-climatisation-maroc')->assertJson(['to' => '/cuivre-et-gaz/cuivre']);
    legacy('/produit/promotions')->assertJson(['to' => '/promotions']);
    legacy('/home')->assertJson(['to' => '/', 'status' => 301]);
    legacy('/home/devis')->assertJson(['to' => '/demander-un-devis', 'status' => 301]);
});

it('waits for unpublished pages with a temporary redirect home', function () {
    legacy('/home/conditionsgeneralesdevente')->assertJson(['to' => '/', 'status' => 302]);

    // Saved like the back office does (model events clear the API cache).
    Page::query()->where('slug', 'cgv')->firstOrFail()->update(['is_published' => true]);
    legacy('/home/conditionsgeneralesdevente')->assertJson(['to' => '/cgv', 'status' => 301]);
});

it('lets a back-office redirect win and answers 404 for unknown paths', function () {
    Redirect::query()->create(['from_path' => '/produit/marque/4/LG', 'to_path' => '/climatisation', 'status_code' => 301]);

    legacy('/produit/marque/4/LG')->assertJson(['to' => '/climatisation']);
    legacy('/produit/details/999999/x')->assertNotFound()->assertJson(['type' => 'none']);
    legacy('/produit/marque/9/Inconnue')->assertNotFound();
    legacy('/autre/chose')->assertNotFound();
});
