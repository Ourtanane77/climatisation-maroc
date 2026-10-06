<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Editable content: blog, sector (solutions), service, city and static pages, FAQ items,
 * SEO metadata, legacy redirects.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_category_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->json('body')->nullable()->comment('Content blocks');
            $table->unsignedSmallInteger('reading_time')->nullable()->comment('Minutes');
            $table->string('cover')->nullable();
            $table->string('art_key', 32)->nullable();
            $table->string('cover_bg', 9)->nullable();
            $table->string('author')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        // Links an article to a category, sector, product… ("Guides associés", "À lire aussi").
        Schema::create('article_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->morphs('linkable');
            $table->unsignedInteger('position')->default(0);
            $table->unique(['article_id', 'linkable_type', 'linkable_id']);
        });

        Schema::create('sector_pages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->string('scene_key', 32)->nullable();
            $table->string('tile_bg', 9)->nullable();
            $table->string('image')->nullable();
            $table->text('hero_text')->nullable();
            $table->text('intro')->nullable();
            $table->json('problems')->nullable();
            $table->json('solutions')->nullable();
            $table->json('range_tiles')->nullable();
            $table->json('image_band')->nullable();
            $table->string('quote_title')->nullable();
            $table->text('whatsapp_text')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('sector_page_product', function (Blueprint $table) {
            $table->foreignId('sector_page_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->primary(['sector_page_id', 'product_id']);
        });

        Schema::create('service_pages', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Short name, e.g. "Visite technique"');
            $table->string('slug')->unique();
            $table->text('hero_text')->nullable();
            $table->json('included')->nullable();
            $table->json('steps')->nullable();
            $table->json('prices')->nullable();
            $table->boolean('show_supplies')->default(true);
            $table->text('whatsapp_text')->nullable();
            $table->unsignedInteger('legacy_id')->nullable()->unique();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('service_page_product', function (Blueprint $table) {
            $table->foreignId('service_page_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->primary(['service_page_id', 'product_id']);
        });

        Schema::create('city_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('slug')->unique()->comment('Path segment: climatisation-<slug>');
            $table->text('intro')->nullable();
            $table->longText('body')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('kind', 16)->default('other');
            $table->text('intro')->nullable();
            $table->json('body')->nullable()->comment('Blocks, or numbered articles for legal pages');
            $table->string('updated_label')->nullable()->comment('"Dernière mise à jour : …"');
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('faq_items', function (Blueprint $table) {
            $table->id();
            $table->morphs('faqable');
            $table->string('question');
            $table->text('answer');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('seo_meta', function (Blueprint $table) {
            $table->id();
            $table->morphs('seoable');
            $table->string('title')->nullable();
            $table->string('description', 500)->nullable();
            $table->string('h1')->nullable();
            $table->string('canonical')->nullable();
            $table->string('og_image')->nullable();
            $table->boolean('noindex')->default(false);
            $table->timestamps();
            $table->unique(['seoable_type', 'seoable_id']);
        });

        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('from_path')->unique();
            $table->string('to_path');
            $table->unsignedSmallInteger('status_code')->default(301);
            $table->unsignedInteger('hits')->default(0);
            $table->timestamp('last_hit_at')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['redirects', 'seo_meta', 'faq_items', 'pages', 'city_pages', 'service_page_product', 'service_pages',
            'sector_page_product', 'sector_pages', 'article_links', 'articles', 'article_categories'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
