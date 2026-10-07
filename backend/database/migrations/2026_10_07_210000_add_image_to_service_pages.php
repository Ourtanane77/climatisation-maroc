<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Service pages: a hero photo set in the back office (falls back to the design's wall unit). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_pages', function (Blueprint $table) {
            $table->string('image')->nullable()->after('hero_text');
        });
    }

    public function down(): void
    {
        Schema::table('service_pages', fn (Blueprint $table) => $table->dropColumn('image'));
    }
};
