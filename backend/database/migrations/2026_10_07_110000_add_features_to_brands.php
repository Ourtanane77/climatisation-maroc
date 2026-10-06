<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Brand page "Les technologies {marque}" grid (design: Marque LG): [{title, text, icon}].
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->json('features')->nullable()->after('intro')->comment('[{title, text, icon}] for the brand page');
        });
    }

    public function down(): void
    {
        Schema::table('brands', fn (Blueprint $table) => $table->dropColumn('features'));
    }
};
