<?php

use App\Models\Article;

beforeEach(fn () => $this->seed());

const PUISSANCE = 'quelle-puissance-de-climatiseur-pour-ma-piece';

it('features the published guide and lists only categories with published articles', function () {
    $blog = $this->getJson('/api/v1/blog')->assertOk()->json();

    expect($blog['featured']['slug'])->toBe(PUISSANCE)
        ->and($blog['featured']['category']['name'])->toBe('Guides d’achat')
        ->and($blog['data'])->toBe([])
        ->and(array_column($blog['categories'], 'slug'))->toBe(['guides'])
        ->and($blog['meta']['total'])->toBe(1);
});

it('lists a category and answers 404 for a category without published articles', function () {
    $this->getJson('/api/v1/blog?category=guides')
        ->assertOk()
        ->assertJsonPath('category.name', 'Guides d’achat')
        ->assertJsonPath('featured', null)
        ->assertJsonPath('data.0.slug', PUISSANCE)
        ->assertJsonPath('meta.total', 1);

    $this->getJson('/api/v1/blog?category=pros')->assertNotFound();
    $this->getJson('/api/v1/blog?category=inconnue')->assertNotFound();
});

it('returns an article with its blocks, table of contents and resolved products', function () {
    $res = $this->getJson('/api/v1/blog/'.PUISSANCE)->assertOk();

    expect(array_column($res->json('article.toc'), 'id'))->toBe(['regle', 'tableau', 'au-dessus', 'inverter'])
        ->and(array_column($res->json('article.blocks'), 'type'))->toContain('calculator', 'power_table', 'figure', 'tip', 'callout')
        ->and($res->json('article.publishedAt'))->toBeNull()
        ->and($res->json('related'))->toBe([]);

    $products = collect($res->json('article.blocks'))->firstWhere('type', 'products')['items'];
    expect(array_column($products, 'sku'))->toBe(['D13AJH.N', 'FSW12T24PM/N'])
        ->and($products[0]['price'])->toBe(550000)
        ->and($products[0]['href'])->toBe('/produit/lg-dual-inverter?v=D13AJH.N');
});

it('never serves or links unpublished articles', function () {
    $this->getJson('/api/v1/blog/climatiseur-inverter-ou-on-off')->assertNotFound();

    Article::query()->where('slug', 'climatiseur-inverter-ou-on-off')->update(['is_published' => true]);

    expect(array_column($this->getJson('/api/v1/blog/'.PUISSANCE)->json('related'), 'slug'))->toBe(['climatiseur-inverter-ou-on-off'])
        ->and(array_column($this->getJson('/api/v1/blog')->json('data'), 'slug'))->toBe(['climatiseur-inverter-ou-on-off']);
});
