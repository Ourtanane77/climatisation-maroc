<?php

use App\Enums\OrderStatus;
use App\Enums\ResellerStatus;
use App\Filament\Pages\ManageGeneralSettings;
use App\Filament\Resources\Orders\Pages\ViewOrder;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Resources\Redirects\RedirectResource;
use App\Filament\Resources\Resellers\Pages\ListResellerAccounts;
use App\Filament\Resources\Users\UserResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\ResellerAccount;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Livewire\Livewire;

beforeEach(function () {
    $this->seed();
    $this->admin = User::factory()->create();
    $this->admin->assignRole(User::ROLE_ADMIN);
});

it('moves an order through the status workflow and records who did it', function () {
    $order = Order::query()->where('reference', 'CM-2026-01042')->firstOrFail();
    expect($order->status)->toBe(OrderStatus::Confirmee);

    $this->actingAs($this->admin);
    $page = Livewire::test(ViewOrder::class, ['record' => $order->getRouteKey()])
        ->assertActionVisible('to_expediee')
        ->assertActionDoesNotExist('to_livree');   // only the next statuses are offered
    runAction($page, 'to_expediee', ['note' => 'Remis au livreur']);

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Expediee)
        ->and($order->history()->reorder()->latest('id')->first()->user_id)->toBe($this->admin->id)
        ->and($order->history()->reorder()->latest('id')->first()->note)->toBe('Remis au livreur');
});

it('prints the order sheet for staff only', function () {
    $order = Order::query()->firstOrFail();

    $this->actingAs($this->admin)->get(route('admin.orders.print', $order))
        ->assertOk()->assertSee('CM-2026-01042')->assertSee('Paiement à la livraison');

    $reseller = User::query()->where('email', 'contact@froid-atlas.ma')->first();
    if ($reseller) {
        $this->actingAs($reseller)->get(route('admin.orders.print', $order))->assertForbidden();
    }
});

it('validates and refuses reseller accounts', function () {
    $user = User::factory()->create();
    $user->assignRole(User::ROLE_RESELLER);
    $account = ResellerAccount::query()->create([
        'user_id' => $user->id, 'company' => 'Test SARL', 'ice' => '123456789012345', 'activity' => 'installateur',
        'phone' => '0612345678', 'status' => ResellerStatus::EnAttente,
    ]);
    expect($user->fresh()->isValidatedReseller())->toBeFalse();

    $this->actingAs($this->admin);
    Livewire::test(ListResellerAccounts::class, ['activeTab' => 'en_attente'])->callTableAction('validate', $account);
    expect($account->fresh()->status)->toBe(ResellerStatus::Valide)
        ->and($user->fresh()->isValidatedReseller())->toBeTrue();

    runAction(Livewire::test(ListResellerAccounts::class, ['activeTab' => 'valide']), TestAction::make('refuse')->table($account), ['reason' => 'ICE invalide']);
    expect($account->fresh()->status)->toBe(ResellerStatus::Refuse)->and($account->fresh()->refusal_reason)->toBe('ICE invalide');
});

it('filters the products to verify', function () {
    $this->actingAs($this->admin);

    Livewire::test(ListProducts::class)
        ->filterTable('a_verifier', true)
        ->assertCountTableRecords(17)
        ->assertCanNotSeeTableRecords(Product::query()->where('slug', 'lg-dual-inverter')->get());
});

it('keeps managers out of users, settings and redirects', function () {
    $manager = User::factory()->create();
    $manager->assignRole(User::ROLE_MANAGER);
    $this->actingAs($manager);

    $this->get(UserResource::getUrl('index'))->assertForbidden();
    $this->get(RedirectResource::getUrl('index'))->assertForbidden();
    $this->get(ManageGeneralSettings::getUrl())->assertForbidden();
    $this->get('/admin/products')->assertOk();
});
