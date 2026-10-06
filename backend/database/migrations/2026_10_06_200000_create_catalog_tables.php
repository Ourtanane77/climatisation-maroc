<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catalogue: categories (tree), brands, products as families with variants, images, specs,
 * "pour l'installation" accessories. Money columns are integer centimes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name')->comment('Page name, e.g. "Climatiseurs muraux"');
            $table->string('short_name')->nullable()->comment('Chips, tiles and menus, e.g. "Mural"');
            $table->string('slug');
            $table->string('path')->unique()->comment('Full URL path, e.g. climatisation/mural');
            $table->text('intro')->nullable();
            $table->longText('body')->nullable()->comment('SEO text under the listing');
            $table->string('template', 16)->default('listing');
            $table->string('icon', 32)->nullable();
            $table->string('art_key', 32)->nullable();
            $table->string('tile_bg', 9)->nullable();
            $table->string('image')->nullable();
            $table->string('tile_text')->nullable()->comment('Short line on gamme tiles');
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_quote_only')->default(false);
            $table->unsignedInteger('legacy_id')->nullable()->unique();
            $table->timestamps();
            $table->unique(['parent_id', 'slug']);
            $table->index(['parent_id', 'position']);
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->decimal('logo_aspect', 5, 2)->nullable()->comment('Width / height, for equal-area logo sizing');
            $table->text('intro')->nullable();
            $table->string('caption')->nullable()->comment('e.g. "Climatisation" under the logo tile');
            $table->boolean('is_official_distributor')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('legacy_id')->nullable()->unique();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->json('highlights')->nullable()->comment('[{title, icon}]');
            $table->string('technology', 16)->nullable()->comment('Inverter, On/Off');
            $table->string('refrigerant', 16)->nullable()->comment('R32, R410A…');
            $table->string('wifi')->nullable();
            $table->string('art_key', 32)->nullable()->comment('Drawing used when there is no photo');
            $table->string('datasheet_path')->nullable();
            $table->boolean('is_new')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->boolean('needs_verification')->default(false);
            $table->text('verification_note')->nullable();
            $table->string('keywords')->nullable()->comment('Extra search terms');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->index(['category_id', 'is_published', 'position']);
            $table->fullText(['name', 'keywords']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku', 64)->unique();
            $table->string('label')->nullable()->comment('e.g. "12 000 BTU", "9 000 BTU · Blanc", "300 L"');
            $table->unsignedInteger('power_btu')->nullable();
            $table->string('colour', 32)->nullable();
            $table->unsignedInteger('price')->comment('Regular price, centimes');
            $table->unsignedInteger('promo_price')->nullable()->comment('Selling price when discounted, centimes');
            $table->unsignedInteger('pro_price')->nullable()->comment('Reseller price, centimes (never public)');
            $table->string('stock_status', 16)->default('en_stock');
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_default')->default(false);
            $table->boolean('needs_verification')->default(false);
            $table->text('verification_note')->nullable();
            $table->unsignedInteger('legacy_id')->nullable()->unique();
            $table->timestamps();
            $table->index(['product_id', 'position']);
            $table->index('power_btu');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('path')->nullable()->comment('On the public disk; null until downloaded');
            $table->string('source_url')->nullable()->comment('Original URL on the old site');
            $table->json('renditions')->nullable()->comment('{width: path} WebP renditions');
            $table->unsignedSmallInteger('width')->nullable();
            $table->unsignedSmallInteger('height')->nullable();
            $table->string('alt')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('product_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('value');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('product_accessories', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('accessory_id')->constrained('products')->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->primary(['product_id', 'accessory_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_accessories');
        Schema::dropIfExists('product_specs');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
    }
};
