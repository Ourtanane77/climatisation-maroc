<?php

use App\Models\Page;
use App\Models\ProductVariant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(fn () => $this->seed());

it('builds the navigation from the category tree and settings', function () {
    $nav = $this->getJson('/api/v1/navigation')->assertOk()->json();

    expect(collect($nav['ranges'])->pluck('href')->all())
        ->toBe(['/climatisation', '/chauffe-eau', '/ventilation', '/gaines', '/cuivre-et-gaz', '/pieces-de-rechange'])
        ->and($nav['ranges'][0]['mega']['subs'][0])->toBe(['label' => 'Mural', 'href' => '/climatisation/mural'])
        ->and(collect($nav['ranges'][0]['mega']['brands'])->pluck('label')->all())->toBe(['LG', 'Carrier', 'CIAT', 'Fitco'])
        ->and($nav['ranges'][0]['mega']['featured']['sku'])->toBe('D10AWH.NW0')
        ->and($nav['salesPhone']['href'])->toBe('tel:+212666854184')
        ->and(collect($nav['footer']['socials'])->pluck('name')->all())->toBe(['Facebook', 'Instagram', 'TikTok', 'WhatsApp'])
        ->and($nav['footer']['columns'][3]['links'][4])->toBe(['label' => 'Froid', 'href' => '/froid']);
});

it('links only published legal pages in the footer', function () {
    expect($this->getJson('/api/v1/navigation')->json('footer.legal'))->toBe([
        ['label' => "Service apr\u{00E8}s-vente", 'href' => '/services/service-apres-vente'],
    ]);

    Page::query()->where('slug', 'cgv')->update(['is_published' => true]);

    expect($this->getJson('/api/v1/navigation')->json('footer.legal.0'))
        ->toBe(['label' => "Conditions g\u{00E9}n\u{00E9}rales de vente", 'href' => '/cgv']);
});

it('returns a range landing page with tiles, power chips, brands and published guides only', function () {
    $range = $this->getJson('/api/v1/categories/climatisation')->assertOk()->json();

    expect($range['template'])->toBe('landing')
        ->and($range['h1'])->toBe('Climatisation et climatiseurs au Maroc')
        ->and(collect($range['children'])->pluck('shortName')->all())->toBe(['Mural', 'Gainable', 'Cassette', 'Console et armoire'])
        ->and(collect($range['powers'])->pluck('label')->first())->toBe("9\u{00A0}000\u{00A0}BTU")
        ->and($range['powers'][0]['href'])->toBe('/climatisation/mural?puissance=9000')
        ->and(collect($range['powers'])->last()['label'])->toBe("30\u{00A0}000 BTU et plus")
        ->and(collect($range['brands'])->pluck('note', 'name')->all())->toMatchArray(['LG' => 'Distributeur officiel'])
        ->and(collect($range['guides'])->pluck('href')->all())->toBe(['/blog/quelle-puissance-de-climatiseur-pour-ma-piece'])
        ->and($range['faq'])->toHaveCount(3)
        ->and($range['popular'])->toHaveCount(4);

    $this->getJson('/api/v1/categories/nope')->assertNotFound();
});

it('filters a listing and counts facets disjunctively', function () {
    $all = $this->getJson('/api/v1/categories/climatisation/mural/products')->assertOk()->json();
    expect($all['meta']['total'])->toBe(9)
        ->and(collect($all['facets'])->pluck('key')->all())->toBe(['power', 'brand', 'tech', 'fluid', 'colour', 'price', 'promo']);

    $lg = $this->getJson('/api/v1/categories/climatisation/mural/products?brand=lg')->json();
    $brands = collect($lg['facets'])->firstWhere('key', 'brand')['values'];
    expect($lg['meta']['total'])->toBe(3)
        ->and(collect($lg['data'])->pluck('brand')->unique()->all())->toBe(['LG'])
        // Other brands keep their own counts (the brand facet ignores its own filter).
        ->and(collect($brands)->pluck('count', 'value')->all())->toBe(['lg' => 3, 'carrier' => 3, 'ciat' => 1, 'fitco' => 2])
        ->and(collect($brands)->firstWhere('value', 'lg')['selected'])->toBeTrue();

    $power = $this->getJson('/api/v1/categories/climatisation/mural/products?power=24000&tech=Inverter')->json();
    expect(collect($power['data'])->pluck('name')->all())->each->not->toContain('ON/OFF');

    $empty = $this->getJson('/api/v1/categories/climatisation/mural/products?brand=simsek')->json();
    expect($empty['meta']['total'])->toBe(0)
        ->and(collect($empty['facets'])->firstWhere('key', 'brand')['values'])->toContain(['value' => 'simsek', 'label' => 'Simsek', 'count' => 0, 'selected' => true]);
});

it('sorts and paginates a listing', function () {
    $asc = $this->getJson('/api/v1/categories/climatisation/mural/products?sort=price_asc&per_page=4')->json();
    $prices = collect($asc['data'])->pluck('price')->all();
    $sorted = $prices;
    sort($sorted);

    expect($prices)->toBe($sorted)
        ->and($asc['meta'])->toMatchArray(['total' => 9, 'perPage' => 4, 'lastPage' => 3, 'page' => 1]);

    $page3 = $this->getJson('/api/v1/categories/climatisation/mural/products?per_page=4&page=3')->json();
    expect($page3['data'])->toHaveCount(1);
});

it('returns every variant as a dense row for the quick-order list', function () {
    $rows = collect($this->getJson('/api/v1/categories/cuivre-et-gaz/products?flat=1')->assertOk()->json('data'));

    expect($rows)->toHaveCount(13)
        ->and($rows->firstWhere('sku', 'CLIM00008'))->toMatchArray(['price' => 350, 'sub' => 'Isolant', 'inStock' => true])
        ->and($rows->firstWhere('sku', 'CUIV0009')['inStock'])->toBeFalse();
});

it('lists promoted families with only their discounted variants', function () {
    $promos = $this->getJson('/api/v1/promotions')->assertOk()->json();
    $fitco = collect($promos['data'])->firstWhere('name', 'Fitco Mural Inverter');

    expect($promos['meta']['perPage'])->toBe(6)
        ->and(collect($promos['data'])->every(fn ($card) => $card['badge'] !== null))->toBeTrue();

    $lg = $this->getJson('/api/v1/promotions?brand=lg')->json();
    expect(collect($lg['data'])->pluck('brand')->unique()->all())->toBe(['LG'])
        ->and(collect($lg['filters']['brands'])->firstWhere('value', 'lg')['selected'])->toBeTrue();

    if ($fitco) {
        expect(collect($fitco['options'])->every(fn ($o) => $o['regularPrice'] > $o['price']))->toBeTrue();
    }
});

it('searches names, references and brands without accents or case', function () {
    $results = $this->getJson('/api/v1/search?q=CUIVRE')->assertOk()->json();
    expect($results['total'])->toBe(5)
        ->and(collect($results['tabs'])->pluck('label')->all())->toBe(['Cuivre']);

    expect($this->getJson('/api/v1/search?q=d13ajh')->json('data.0.name'))->toBe('LG Dual Inverter')
        ->and($this->getJson('/api/v1/search?q=telecommande')->json('total'))->toBeGreaterThan(0)
        ->and($this->getJson('/api/v1/search?q=climatiseur portable')->json('total'))->toBe(0)
        ->and($this->getJson('/api/v1/search?q=dual&range=Chauffe-eau')->json('total'))->toBe(0)
        ->and($this->getJson('/api/v1/search/suggest?q=dual')->json('data.0.href'))->toBe('/produit/lg-dual-inverter');
});

it('shows pro prices to a validated reseller only', function () {
    ProductVariant::query()->where('sku', 'CUIV0005')->update(['pro_price' => 40000]);
    $row = fn () => collect($this->getJson('/api/v1/categories/cuivre-et-gaz/products?flat=1')->json('data'))->firstWhere('sku', 'CUIV0005');

    expect($row()['price'])->toBe(49500);

    $reseller = User::query()->whereHas('resellerAccount', fn ($q) => $q->where('status', 'valide'))->firstOrFail();
    Sanctum::actingAs($reseller);

    expect($row()['price'])->toBe(40000);
});
