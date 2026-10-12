<?php

use App\Enums\PageKind;
use App\Enums\StockStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Settings\GeneralSettings;
use App\Support\Sites\SiteSettings;

/*
| Per-site texts (App\Models\Concerns\HasSites): an override replaces the shared text on its site
| only; SEO overrides win over the shared SEO row; editorial slugs are unique per site; settings
| are per site.
*/

beforeEach(function () {
    $this->category = Category::query()->create(['name' => 'Climatiseurs muraux', 'slug' => 'mural', 'intro' => 'Texte commun.']);
    $this->brand = Brand::query()->create(['name' => 'LG', 'slug' => 'lg', 'is_active' => true, 'intro' => 'Intro commune.']);
    $this->product = Product::query()->create([
        'category_id' => $this->category->id, 'brand_id' => $this->brand->id,
        'name' => 'LG Dual Inverter', 'slug' => 'lg-dual-inverter', 'short_description' => 'Description commune.',
        'is_published' => true,
    ]);
    $this->product->variants()->create(['sku' => 'D13AJH.N', 'label' => '12 000 BTU', 'power_btu' => 12000, 'price' => 650000, 'stock_status' => StockStatus::EnStock, 'is_default' => true]);
});

it('returns the arfro text on arfro and the main text on cm', function () {
    $this->product->update(['site_content' => ['arfro' => ['name' => 'Climatiseur LG Dual Inverter', 'short_description' => 'Texte Arfro.']]]);
    $this->category->update(['site_content' => ['arfro' => ['name' => 'Muraux Arfro', 'intro' => 'Intro Arfro.']]]);
    $this->brand->update(['site_content' => ['arfro' => ['intro' => 'LG chez Arfro.']]]);
    $arfro = ['X-Site' => 'arfro'];

    $this->getJson('/api/v1/products/lg-dual-inverter')
        ->assertJsonPath('name', 'LG Dual Inverter')
        ->assertJsonPath('shortDescription', 'Description commune.')
        ->assertJsonPath('variants.0.name', "LG Dual Inverter 12\u{00A0}000\u{00A0}BTU"); // French typography: no-break spaces
    $this->getJson('/api/v1/products/lg-dual-inverter', $arfro)
        ->assertJsonPath('name', 'Climatiseur LG Dual Inverter')
        ->assertJsonPath('shortDescription', 'Texte Arfro.')
        ->assertJsonPath('variants.0.name', "Climatiseur LG Dual Inverter 12\u{00A0}000\u{00A0}BTU")
        ->assertJsonPath('category.label', 'Muraux Arfro');

    $this->getJson('/api/v1/categories/mural', $arfro)->assertJsonPath('name', 'Muraux Arfro')->assertJsonPath('intro', 'Intro Arfro.');
    $this->getJson('/api/v1/categories/mural')->assertJsonPath('name', 'Climatiseurs muraux')->assertJsonPath('intro', 'Texte commun.');
    $this->getJson('/api/v1/categories/mural/products', $arfro)->assertJsonPath('data.0.name', 'Climatiseur LG Dual Inverter');
    $this->getJson('/api/v1/brands/lg', $arfro)->assertJsonPath('brand.intro', 'LG chez Arfro.');
    $this->getJson('/api/v1/brands/lg')->assertJsonPath('brand.intro', 'Intro commune.');
});

it('prefers the per-site SEO override and keeps canonicals on the current domain', function () {
    $this->product->seo()->create(['title' => 'Titre commun', 'description' => 'Meta commune', 'canonical' => 'http://localhost:8080/produit/lg-dual-inverter']);
    $this->product->update(['site_content' => ['arfro' => ['seo_title' => 'Titre Arfro', 'seo_h1' => 'H1 Arfro']]]);
    config(['sites.sites.cm.url' => 'http://localhost:8080', 'sites.sites.arfro.url' => 'https://arfro.com']);

    $this->getJson('/api/v1/products/lg-dual-inverter')
        ->assertJsonPath('seo.title', 'Titre commun')
        ->assertJsonPath('seo.canonical', 'http://localhost:8080/produit/lg-dual-inverter');
    $this->getJson('/api/v1/products/lg-dual-inverter', ['X-Site' => 'arfro'])
        ->assertJsonPath('seo.title', 'Titre Arfro')
        ->assertJsonPath('seo.h1', 'H1 Arfro')
        ->assertJsonPath('seo.description', 'Meta commune')
        ->assertJsonPath('seo.canonical', 'https://arfro.com/produit/lg-dual-inverter');
});

it('resolves the same page slug to each site\'s own page', function () {
    $cm = Page::query()->create(['slug' => 'a-propos', 'title' => 'À propos de Climatisation Maroc', 'kind' => PageKind::About, 'is_published' => true]);
    Page::query()->create(['slug' => 'a-propos', 'title' => 'À propos d’Arfro', 'kind' => PageKind::About, 'is_published' => true, 'sites' => ['arfro']]);

    expect($cm->sites)->toBe(['cm']); // editorial default: Climatisation Maroc only

    $this->getJson('/api/v1/pages/a-propos')->assertOk()->assertJsonPath('title', 'À propos de Climatisation Maroc');
    $this->getJson('/api/v1/pages/a-propos', ['X-Site' => 'arfro'])->assertOk()->assertJsonPath('title', 'À propos d’Arfro');
    $this->getJson('/api/v1/resolve?path=/a-propos', ['X-Site' => 'arfro'])->assertJsonPath('type', 'page');

    // A cm-only page answers 404 on arfro.
    Page::query()->create(['slug' => 'cgv', 'title' => 'CGV', 'kind' => PageKind::Legal, 'is_published' => true]);
    $this->getJson('/api/v1/pages/cgv')->assertOk();
    $this->getJson('/api/v1/pages/cgv', ['X-Site' => 'arfro'])->assertNotFound();
});

it('serves each site its own settings in the navigation', function () {
    $arfro = SiteSettings::for(GeneralSettings::class, 'arfro');
    $arfro->email = 'contact@arfro.com';
    $arfro->save();

    $email = fn (array $headers) => collect($this->getJson('/api/v1/navigation', $headers)->assertOk()->json('footer.phones'))->last()['display'];

    expect($email([]))->toBe('ecom@arihafroid.com')
        ->and($email(['X-Site' => 'arfro']))->toBe('contact@arfro.com');
    expect($this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->json('footer.copyright'))->toEndWith('Arfro');
});
