<?php

use App\Filament\Exports\ProductVariantExporter;
use App\Filament\Imports\ProductVariantImporter;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Resources\Redirects\Pages\ManageRedirects;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Redirect;
use App\Models\User;
use Filament\Actions\Imports\Models\Import;
use Filament\Actions\Testing\TestAction;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;

/*
| Back-office review of 2026-10-07: bulk actions refresh the public site, product images need a
| file, price-on-request items read « Sur demande », Filament's missing French strings are filled.
*/

beforeEach(function () {
    $this->seed();
    $this->admin = User::factory()->create();
    $this->admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($this->admin);
});

it('refreshes the public API when products are unpublished in bulk', function () {
    $product = Product::query()->where('slug', 'lg-dual-inverter')->firstOrFail();
    // Visitors' requests are cached (never a logged-in user's).
    auth()->logout();
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertOk();
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertOk()->assertHeader('X-Api-Cache', 'HIT');

    Livewire::actingAs($this->admin)->test(ListProducts::class)
        ->selectTableRecords([$product->getKey()])
        ->callAction(TestAction::make('unpublish')->table()->bulk());
    auth()->logout();

    expect($product->fresh()->is_published)->toBeFalse();
    // The cached copy is gone: the API answers from the database (unpublished → 404).
    $this->getJson('/api/v1/products/lg-dual-inverter')->assertNotFound();
});

it('refuses a product image without a file', function () {
    $product = Product::query()->where('slug', 'lg-dual-inverter')->firstOrFail();

    Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
        ->set('data.images', ['new' => ['path' => null, 'alt' => 'Sans fichier', 'product_variant_id' => null]])
        ->call('save')
        ->assertHasFormErrors(['images.new.path' => 'required']);
});

it('shows « Sur demande » for products without a price', function () {
    $onRequest = ProductVariant::query()->where('price', 0)->firstOrFail()->product;

    Livewire::test(ListProducts::class)
        ->searchTable($onRequest->name)
        ->assertSee('Sur demande');
});

it('opens the « À vérifier » section on flagged products', function () {
    $flagged = ProductVariant::query()->where('sku', 'XLS-GRILLESIMPLE6010')->firstOrFail()->product;

    $this->get("/admin/products/{$flagged->getKey()}/edit")->assertOk()->assertSee('À vérifier');
});

it('fills the French strings missing from Filament', function () {
    $this->get('/admin')->assertOk()
        ->assertSee('Aller au contenu')
        ->assertDontSee('filament-panels::');
});

it('replaces a temporary reference and sets the price through the CSV import', function () {
    $import = Import::query()->create([
        'user_id' => $this->admin->id, 'file_name' => 'variantes.csv', 'file_path' => 'variantes.csv',
        'importer' => ProductVariantImporter::class, 'total_rows' => 1,
    ]);
    $columns = ['sku' => 'Référence', 'price' => 'Prix (Dhs)', 'nouvelle_reference' => 'Nouvelle référence'];
    $importer = new ProductVariantImporter($import, $columns, []);

    $importer(['Référence' => 'XLS-GRILLESIMPLE6010', 'Prix (Dhs)' => '125,50', 'Nouvelle référence' => 'VENT00500']);

    $variant = ProductVariant::query()->where('sku', 'VENT00500')->firstOrFail();
    expect($variant->price)->toBe(12550)
        ->and(ProductVariant::query()->where('sku', 'XLS-GRILLESIMPLE6010')->exists())->toBeFalse();

    // A new reference already in use is refused.
    expect(fn () => $importer(['Référence' => 'VENT00500', 'Prix (Dhs)' => '', 'Nouvelle référence' => 'D13AJH.N']))
        ->toThrow(ValidationException::class);
});

it('exports the variants of the products listed in the table', function () {
    $products = Product::query()->where('slug', 'lg-dual-inverter');
    $variants = ProductVariantExporter::modifyQuery($products)->get();

    expect($variants)->toHaveCount(4)
        ->and($variants->first())->toBeInstanceOf(ProductVariant::class)
        ->and($variants->pluck('sku')->first())->toBe('D10AWH.NW0');
});

it('creates a redirect from the back office, normalised', function () {
    runAction(Livewire::test(ManageRedirects::class), 'create', [
        'from_path' => 'https://climatisationmaroc.com/Ancienne-Page/',
        'to_path' => '/climatisation',
        'status_code' => 301,
    ]);

    expect(Redirect::query()->where('from_path', '/ancienne-page')->value('to_path'))->toBe('/climatisation');
});

it('refuses a duplicate or looping redirect', function () {
    Redirect::query()->create(['from_path' => '/ancienne-page', 'to_path' => '/climatisation', 'status_code' => 301]);

    runAction(Livewire::test(ManageRedirects::class), 'create', [
        'from_path' => '/Ancienne-Page/', 'to_path' => '/chauffe-eau', 'status_code' => 301,
    ])->assertHasActionErrors(['from_path']);

    runAction(Livewire::test(ManageRedirects::class), 'create', [
        'from_path' => '/autre', 'to_path' => 'climatisation', 'status_code' => 301,
    ])->assertHasActionErrors(['to_path']);

    expect(Redirect::query()->count())->toBe(1);
});
