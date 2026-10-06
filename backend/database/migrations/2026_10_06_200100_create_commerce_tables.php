<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cities, orders (cash on delivery, lines are snapshots), leads, reseller accounts.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_other')->default(false)->comment('"Autre ville"');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->unique()->after('email');
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique()->comment('CM-YYYY-NNNNN');
            $table->string('access_token', 64)->comment('Lets the customer view the confirmation page');
            $table->foreignId('user_id')->nullable()->comment('Reseller, when logged in')->constrained()->nullOnDelete();
            $table->string('pricing', 8)->default('public')->comment('public | pro');
            $table->string('customer_name');
            $table->string('phone', 20);
            $table->string('email')->nullable();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('city_name')->comment('Snapshot');
            $table->string('address');
            $table->text('note')->nullable();
            $table->string('status', 16)->default('nouvelle');
            $table->timestamp('status_changed_at')->nullable();
            $table->text('internal_note')->nullable();
            $table->boolean('option_technical_visit')->default(false);
            $table->unsignedInteger('technical_visit_price')->default(0);
            $table->boolean('option_installation_quote')->default(false);
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('delivery_fee')->default(0);
            $table->unsignedInteger('total');
            $table->string('ip', 45)->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
            $table->index('phone');
        });

        Schema::create('order_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('sku', 64);
            $table->string('name');
            $table->string('variant_label')->nullable();
            $table->unsignedInteger('unit_price');
            $table->unsignedInteger('qty');
            $table->unsignedInteger('line_total');
            $table->timestamps();
        });

        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status', 16);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('type', 16);
            $table->string('status', 16)->default('nouveau');
            $table->string('customer_kind', 16)->nullable()->comment('particulier | professionnel');
            $table->string('name')->nullable();
            $table->string('company')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('city_name')->nullable();
            $table->string('subject')->nullable();
            $table->string('project_type')->nullable();
            $table->string('space_type')->nullable();
            $table->unsignedInteger('surface')->nullable();
            $table->text('message')->nullable();
            $table->string('attachment_path')->nullable();
            $table->nullableMorphs('source', 'leads_source_index');
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->json('payload')->nullable()->comment('Any extra form fields');
            $table->string('source_url')->nullable();
            $table->string('ip', 45)->nullable();
            $table->text('internal_note')->nullable();
            $table->timestamps();
            $table->index(['type', 'status', 'created_at']);
        });

        Schema::create('reseller_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('company');
            $table->string('ice', 15);
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('activity', 32);
            $table->string('contact_name')->nullable();
            $table->string('phone', 20);
            $table->text('message')->nullable();
            $table->string('status', 16)->default('en_attente');
            $table->timestamp('decided_at')->nullable();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('refusal_reason')->nullable();
            $table->timestamps();
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reseller_accounts');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('order_lines');
        Schema::dropIfExists('orders');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('phone'));
        Schema::dropIfExists('cities');
    }
};
