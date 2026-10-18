<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Payment method of an order: on delivery (default, every existing order) or online by card
 * through the CMI gateway. Every message the gateway sends is kept in order_payments (audit).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method', 16)->default('livraison')->after('status_changed_at');
            // Card orders only: en_attente → payee | echouee.
            $table->string('payment_status', 16)->nullable()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('payment_status');
            $table->string('payment_transaction_id', 64)->nullable()->after('paid_at');
        });

        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 16)->default('cmi');
            $table->string('proc_return_code', 8)->nullable();
            $table->string('response', 32)->nullable();
            $table->string('transaction_id', 64)->nullable();
            $table->unsignedBigInteger('amount')->nullable()->comment('centimes');
            $table->boolean('valid_hash');
            $table->json('payload');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_payments');
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_status', 'paid_at', 'payment_transaction_id']);
        });
    }
};
