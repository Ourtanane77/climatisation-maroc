<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Brand order of the listings (owner request of 2026-10-27: « LG / CARRIER / FITCO / CIAT » in
 * « Clim mural »). Adds the per-category override `categories.brand_order` (brand ids, in order;
 * empty = the general brand order) and sets the general order LG, Carrier, Fitco, CIAT, then the
 * other brands in their current order. Idempotent; a missing brand is skipped.
 */
return new class extends Migration
{
    private const ORDER = ['lg', 'carrier', 'fitco', 'ciat'];

    public function up(): void
    {
        if (! Schema::hasColumn('categories', 'brand_order')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->json('brand_order')->nullable()->after('is_quote_only')
                    ->comment('Brand ids in listing order; null = general brand order (brands.position)');
            });
        }

        $brands = DB::table('brands')->orderBy('position')->orderBy('id')->get(['id', 'slug', 'name']);
        $key = fn (object $b) => mb_strtolower((string) $b->slug);
        $byKey = $brands->keyBy($key);
        // Match on the slug, else on the name (case-insensitive).
        $find = fn (string $wanted) => $byKey->get($wanted) ?? $brands->first(fn (object $b) => mb_strtolower(trim((string) $b->name)) === $wanted);

        $first = collect(self::ORDER)->map($find)->filter()->values();
        $ordered = $first->concat($brands->reject(fn (object $b) => $first->contains('id', $b->id)))->values();
        foreach ($ordered as $i => $brand) {
            DB::table('brands')->where('id', $brand->id)->update(['position' => $i + 1]);
        }

        if ($first->isNotEmpty()) {
            DB::table('categories')->where('path', 'climatisation/mural')
                ->update(['brand_order' => json_encode($first->pluck('id')->map(fn ($id) => (int) $id)->all())]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('categories', 'brand_order')) {
            Schema::table('categories', fn (Blueprint $table) => $table->dropColumn('brand_order'));
        }
    }
};
