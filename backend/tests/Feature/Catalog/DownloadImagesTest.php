<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/*
| catalog:download-images: photos already on the disk (restored with scripts/storage-import.sh)
| are reused without contacting the old site; missing ones are downloaded; failures don't stop it.
*/

beforeEach(function () {
    Storage::fake('local');
    config(['filesystems.default' => 'local']);
    $category = Category::query()->create(['name' => 'Mural', 'slug' => 'mural']);
    $this->product = Product::query()->create(['category_id' => $category->id, 'name' => 'Test', 'slug' => 'test-produit']);
});

/** A tiny valid PNG. */
function tinyPng(): string
{
    $image = imagecreatetruecolor(40, 20);
    ob_start();
    imagepng($image);

    return (string) ob_get_clean();
}

it('reuses a photo already on the disk without downloading it', function () {
    Storage::disk('local')->put('products/test-produit/photo-1.png', tinyPng());
    Storage::disk('local')->put('products/test-produit/photo-1-320.webp', 'webp');
    $image = $this->product->images()->create(['source_url' => 'https://climatisationmaroc.com/prodimg/photo%201.png', 'position' => 0]);
    Http::fake();

    $this->artisan('catalog:download-images')->assertSuccessful();

    Http::assertNothingSent();
    expect($image->refresh()->path)->toBe('products/test-produit/photo-1.png')
        ->and($image->width)->toBe(40)
        ->and($image->renditions)->toBe([320 => 'products/test-produit/photo-1-320.webp']);
});

it('downloads missing photos and reports failures without stopping', function () {
    $ok = $this->product->images()->create(['source_url' => 'https://climatisationmaroc.com/prodimg/ok.png', 'position' => 0]);
    $broken = $this->product->images()->create(['source_url' => 'https://climatisationmaroc.com/prodimg/broken.png', 'position' => 1]);
    Http::fake([
        '*/ok.png' => Http::response(tinyPng()),
        '*/broken.png' => Http::response('', 404),
    ]);

    $this->artisan('catalog:download-images')->assertFailed();

    expect($ok->refresh()->path)->toBe('products/test-produit/ok.png')
        ->and(Storage::disk('local')->exists('products/test-produit/ok.png'))->toBeTrue()
        ->and($broken->refresh()->path)->toBeNull()
        ->and(ProductImage::query()->whereNull('path')->count())->toBe(1);
});
