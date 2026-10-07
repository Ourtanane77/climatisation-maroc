<?php

use App\Enums\PageKind;
use App\Models\Category;
use App\Models\City;
use App\Models\CityPage;
use App\Models\Page;
use App\Models\SectorPage;
use App\Models\ServicePage;

beforeEach(fn () => $this->seed());

it('lists only published sectors and serves the restaurant page', function () {
    $this->getJson('/api/v1/sectors')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'restaurants')
        ->assertJsonPath('data.0.href', '/solutions/restaurants')
        ->assertJsonPath('contact.whatsapp', '212666854184');

    $this->getJson('/api/v1/sectors/restaurants')
        ->assertOk()
        ->assertJsonPath('seo.h1', 'Climatisation pour restaurants et cafés au Maroc')
        ->assertJsonCount(4, 'problems')
        ->assertJsonPath('solutions.0.href', '/climatisation/cassette')
        ->assertJsonCount(4, 'products')
        ->assertJsonPath('products.0.sku', 'ATNW18GPLS1')
        ->assertJsonPath('products.0.price', 1250000)
        ->assertJsonPath('rangeTiles.1.href', '/gaines')
        ->assertJsonCount(3, 'faq')
        // The other sectors have no copy yet: never linked.
        ->assertJsonCount(0, 'others');

    $this->getJson('/api/v1/sectors/bureaux')->assertNotFound();
});

it('lists other sectors once they are published', function () {
    SectorPage::query()->where('slug', 'bureaux')->update(['is_published' => true]);

    $this->getJson('/api/v1/sectors')->assertJsonCount(2, 'data');
    $this->getJson('/api/v1/sectors/restaurants')->assertJsonPath('others.0.slug', 'bureaux');
});

it('drops solution links to inactive categories', function () {
    Category::query()->where('path', 'climatisation/cassette')->update(['is_active' => false]);

    $this->getJson('/api/v1/sectors/restaurants')->assertJsonPath('solutions.0.href', null);
});

it('serves the three services with their supplies', function () {
    $this->getJson('/api/v1/services')->assertOk()->assertJsonCount(3, 'data')
        ->assertJsonPath('data.0.h1', 'Installation de climatisation par nos techniciens');

    $this->getJson('/api/v1/services/installation')
        ->assertOk()
        ->assertJsonCount(4, 'included')
        ->assertJsonCount(2, 'prices')
        ->assertJsonPath('products.0.sku', 'CUIV0018')
        ->assertJsonPath('products.0.price', 113000);

    $this->getJson('/api/v1/services/service-apres-vente')
        ->assertOk()
        ->assertJsonPath('showSupplies', false)
        ->assertJsonCount(0, 'products');
});

it('serves published pages and hides unpublished legal pages', function () {
    $this->getJson('/api/v1/pages/a-propos')
        ->assertOk()
        ->assertJsonPath('kind', 'about')
        ->assertJsonPath('seo.h1', 'Ariha Froid, la climatisation à Marrakech depuis 2008')
        ->assertJsonPath('brands.0.name', 'LG')
        ->assertJsonPath('brands.0.official', true)
        ->assertJsonCount(2, 'contact.stores');

    $this->getJson('/api/v1/pages/livraison-et-paiement')->assertOk()->assertJsonCount(4, 'faq');
    $this->getJson('/api/v1/pages/cgv')->assertNotFound();
});

it('lists only the other published legal pages, the CGV last', function () {
    Page::query()->whereIn('slug', ['cgv', 'cgu', 'securite'])->update(['is_published' => true]);

    $this->getJson('/api/v1/pages/cgu')
        ->assertOk()
        ->assertJsonCount(2, 'legalPages')
        ->assertJsonPath('legalPages.0.href', '/securite')
        ->assertJsonPath('legalPages.1.href', '/cgv');

    $this->getJson('/api/v1/pages/cgv')
        ->assertJsonPath('legalPages.0.href', '/cgu')
        ->assertJsonCount(12, 'body');
});

it('serves a city page only once published', function () {
    $page = CityPage::query()->firstOrFail();
    $this->getJson("/api/v1/cities/{$page->slug}")->assertNotFound();

    $page->update(['is_published' => true, 'intro' => 'Texte de test.']);
    $city = City::query()->findOrFail($page->city_id);

    $this->getJson("/api/v1/cities/{$page->slug}")
        ->assertOk()
        ->assertJsonPath('city', $city->name)
        ->assertJsonPath('types.0.href', '/climatisation/mural')
        ->assertJsonCount(8, 'products');
});

it('builds the plan du site from active categories and published pages only', function () {
    $response = $this->getJson('/api/v1/site-map')->assertOk();

    expect(collect($response->json('ranges'))->pluck('href'))->toContain('/climatisation', '/cuivre-et-gaz')
        ->and($response->json('sectors'))->toBe([['title' => 'Restaurants et cafés', 'href' => '/solutions/restaurants']])
        ->and(collect($response->json('pages'))->pluck('kind')->unique()->values()->all())->not->toContain(PageKind::Legal->value)
        ->and($response->json('cities'))->toBe([])
        ->and(collect($response->json('articles'))->pluck('href')->all())->toBe(['/blog/quelle-puissance-de-climatiseur-pour-ma-piece']);
});

it('serves the photos uploaded in the back office for sectors, their solutions and services', function () {
    $sector = SectorPage::query()->where('slug', 'restaurants')->firstOrFail();
    $solutions = $sector->solutions;
    $solutions[0]['image'] = 'secteurs/solution.png';
    $sector->update(['image' => 'secteurs/salle.png', 'solutions' => $solutions]);
    ServicePage::query()->where('slug', 'installation')->firstOrFail()->update(['image' => 'services/pose.png']);

    $page = $this->getJson('/api/v1/sectors/restaurants')->assertOk()->json();
    expect($page['image'])->toEndWith('/storage/secteurs/salle.png')
        ->and($page['solutions'][0]['image'])->toEndWith('/storage/secteurs/solution.png')
        ->and($page['solutions'][1]['image'])->toBeNull()
        ->and($this->getJson('/api/v1/sectors')->json('data.0.image'))->toEndWith('/storage/secteurs/salle.png')
        ->and($this->getJson('/api/v1/services/installation')->json('image'))->toEndWith('/storage/services/pose.png')
        ->and($this->getJson('/api/v1/services/visite-technique')->json('image'))->toBeNull();
});
