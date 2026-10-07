<?php

use App\Enums\LeadType;
use App\Models\Lead;
use App\Models\Order;

function e2eOrder(string $name): Order
{
    return Order::query()->create([
        'reference' => 'CM-2026-'.random_int(10000, 99999),
        'access_token' => bin2hex(random_bytes(16)),
        'customer_name' => $name,
        'phone' => '0612345678',
        'city_name' => 'Marrakech',
        'address' => '1 rue Test',
        'subtotal' => 100,
        'total' => 100,
    ]);
}

it('deletes only the orders and leads created by the e2e suite', function () {
    $e2eOrder = e2eOrder('E2E Test Commande');
    $realOrder = e2eOrder('Yassine El Amrani');
    Lead::query()->create(['type' => LeadType::Devis, 'name' => 'E2E Test Devis']);
    $realLead = Lead::query()->create(['type' => LeadType::Devis, 'name' => 'Karim Benali']);

    $this->artisan('app:e2e-cleanup')->assertSuccessful();

    expect(Order::query()->find($e2eOrder->id))->toBeNull()
        ->and(Order::query()->find($realOrder->id))->not->toBeNull()
        ->and(Lead::query()->pluck('id')->all())->toBe([$realLead->id]);
});

it('refuses to run in production', function () {
    app()->detectEnvironment(fn () => 'production');
    $order = e2eOrder('E2E Test Commande');

    $this->artisan('app:e2e-cleanup')->assertFailed();

    expect(Order::query()->find($order->id))->not->toBeNull();
});
