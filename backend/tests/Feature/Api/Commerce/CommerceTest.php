<?php

use App\Enums\OrderStatus;
use App\Enums\ResellerStatus;
use App\Enums\StockStatus;
use App\Mail\NewOrderShop;
use App\Mail\OrderConfirmationCustomer;
use App\Models\Category;
use App\Models\City;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

/*
| Basket quote, checkout, confirmation and tracking (docs/plan.md §5, "Basket and orders").
*/

beforeEach(function () {
    City::query()->create(['name' => 'Marrakech', 'slug' => 'marrakech', 'position' => 1]);
    City::query()->create(['name' => 'Autre ville', 'slug' => 'autre-ville', 'position' => 99, 'is_other' => true]);

    $category = Category::query()->create(['name' => 'Climatiseurs muraux', 'slug' => 'mural']);
    $lg = Product::query()->create(['category_id' => $category->id, 'name' => 'LG Dual Inverter', 'slug' => 'lg-dual-inverter', 'art_key' => 'mural']);
    $lg->variants()->create(['sku' => 'D13AJH.N', 'label' => "12\u{00A0}000 BTU", 'power_btu' => 12000, 'price' => 650000, 'promo_price' => 570000, 'pro_price' => 520000, 'stock_status' => StockStatus::EnStock, 'position' => 0]);
    $lg->variants()->create(['sku' => 'D19AKH.NK0', 'label' => "18\u{00A0}000 BTU", 'power_btu' => 18000, 'price' => 810000, 'promo_price' => 760000, 'stock_status' => StockStatus::Rupture, 'position' => 1]);

    $kit = Product::query()->create(['category_id' => $category->id, 'name' => 'Kit duo 1/4-3/8 20 m', 'slug' => 'kit-duo', 'art_key' => 'duo']);
    $kit->variants()->create(['sku' => 'CUIV0018', 'price' => 113000, 'stock_status' => StockStatus::EnStock]);
    $support = Product::query()->create(['category_id' => $category->id, 'name' => 'Support GT', 'slug' => 'support-gt', 'art_key' => 'support']);
    $support->variants()->create(['sku' => 'CLIM00076', 'price' => 5500, 'stock_status' => StockStatus::EnStock]);
    $hidden = Product::query()->create(['category_id' => $category->id, 'name' => 'Brouillon', 'slug' => 'brouillon', 'is_published' => false]);
    $hidden->variants()->create(['sku' => 'HIDDEN1', 'price' => 1000, 'stock_status' => StockStatus::EnStock]);

    $lg->accessories()->attach([$kit->id => ['position' => 0], $support->id => ['position' => 1]]);
});

/** The design's demo basket (Panier.dc.html): 5 700 + 1 130 + 2 × 55 = 6 940 Dhs. */
function demoLines(): array
{
    return [['sku' => 'D13AJH.N', 'qty' => 1], ['sku' => 'CUIV0018', 'qty' => 1], ['sku' => 'CLIM00076', 'qty' => 2]];
}

function checkout(array $overrides = []): array
{
    return array_merge([
        'name' => 'Yassine El Amrani',
        'phone' => '06 12 34 56 78',
        'email' => 'client@example.com',
        'city' => 'marrakech',
        'address' => '24 rue Ibn Sina, Guéliz',
        'note' => '',
        'technical_visit' => false,
        'installation_quote' => true,
        'cgv' => true,
        'lines' => demoLines(),
        'website' => '',
        '_t' => 12000,
    ], $overrides);
}

function validatedReseller(): User
{
    Role::findOrCreate(User::ROLE_RESELLER, 'web');
    $user = User::factory()->create();
    $user->assignRole(User::ROLE_RESELLER);
    $user->resellerAccount()->create(['company' => 'Froid Atlas', 'ice' => '001528749000012', 'activity' => 'installateur', 'phone' => '0612345678', 'status' => ResellerStatus::Valide]);

    return $user;
}

it('quotes the basket with public prices computed on the server', function () {
    $this->postJson('/api/v1/cart/quote', ['lines' => [...demoLines(), ['sku' => 'D13AJH.N', 'qty' => 0], ['sku' => 'NOPE', 'qty' => 1]]])
        ->assertOk()
        ->assertJsonPath('pricing', 'public')
        ->assertJsonPath('subtotal', 694000)
        ->assertJsonPath('total', 694000)
        ->assertJsonPath('count', 4)
        ->assertJsonPath('deliveryFee', 0)
        ->assertJsonPath('lines.0.name', "LG Dual Inverter 12\u{00A0}000 BTU")
        ->assertJsonPath('lines.0.option', "Puissance : 12\u{00A0}000\u{00A0}BTU")
        ->assertJsonPath('lines.0.unitPrice', 570000)
        ->assertJsonPath('lines.0.regularPrice', 650000)
        ->assertJsonPath('lines.2.lineTotal', 11000)
        ->assertJsonPath('invalid.0.sku', 'NOPE')
        ->assertJsonMissingPath('lines.0.proPrice');
});

it('adds the technical visit priced in Réglages', function () {
    $this->postJson('/api/v1/cart/quote', ['lines' => demoLines(), 'options' => ['technical_visit' => true]])
        ->assertOk()
        ->assertJsonPath('technicalVisit', ['price' => 30000, 'selected' => true])
        ->assertJsonPath('total', 724000);
});

it('suggests the products\' accessories for the installation', function () {
    $this->postJson('/api/v1/cart/quote', ['lines' => [['sku' => 'D13AJH.N', 'qty' => 1]]])
        ->assertOk()
        ->assertJsonPath('suggestions.0.sku', 'CUIV0018')
        ->assertJsonPath('suggestions.1.sku', 'CLIM00076');
});

it('gives the pro price to a validated reseller only', function () {
    Sanctum::actingAs(validatedReseller());
    $this->postJson('/api/v1/cart/quote', ['lines' => [['sku' => 'D13AJH.N', 'qty' => 2]]])
        ->assertOk()
        ->assertJsonPath('pricing', 'pro')
        ->assertJsonPath('lines.0.unitPrice', 520000)
        ->assertJsonPath('subtotal', 1040000);
});

it('keeps public prices for a reseller awaiting validation', function () {
    $user = validatedReseller();
    $user->resellerAccount->update(['status' => ResellerStatus::EnAttente]);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/cart/quote', ['lines' => [['sku' => 'D13AJH.N', 'qty' => 1]]])
        ->assertJsonPath('pricing', 'public')
        ->assertJsonPath('lines.0.unitPrice', 570000);
});

it('flags out-of-stock and unpublished lines and leaves them out of the total', function () {
    $this->postJson('/api/v1/cart/quote', ['lines' => [['sku' => 'D19AKH.NK0', 'qty' => 1], ['sku' => 'HIDDEN1', 'qty' => 1], ['sku' => 'CUIV0018', 'qty' => 1]]])
        ->assertOk()
        ->assertJsonPath('lines.0.available', false)
        ->assertJsonPath('invalid.0.sku', 'HIDDEN1')
        ->assertJsonPath('subtotal', 113000);
});

it('places a cash-on-delivery order, snapshots the lines and queues both e-mails', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/orders', checkout(['technical_visit' => true]))->assertCreated();

    $reference = $response->json('reference');
    expect($reference)->toMatch('/^CM-'.now()->year.'-\d{5}$/');

    $order = Order::query()->where('reference', $reference)->firstOrFail();
    expect($order->status)->toBe(OrderStatus::Nouvelle)
        ->and($order->phone)->toBe('0612345678')
        ->and($order->city_name)->toBe('Marrakech')
        ->and($order->subtotal)->toBe(694000)
        ->and($order->technical_visit_price)->toBe(30000)
        ->and($order->total)->toBe(724000)
        ->and($order->option_installation_quote)->toBeTrue()
        ->and($order->pricing)->toBe('public')
        ->and($order->lines)->toHaveCount(3)
        ->and($order->lines->first()->unit_price)->toBe(570000)
        ->and($order->history)->toHaveCount(1)
        ->and($response->json('accessToken'))->toBe($order->access_token);

    Mail::assertQueued(NewOrderShop::class, fn (NewOrderShop $mail) => $mail->hasTo('ecom@arihafroid.com'));
    Mail::assertQueued(OrderConfirmationCustomer::class, fn (OrderConfirmationCustomer $mail) => $mail->hasTo('client@example.com'));
});

it('numbers orders in sequence within the year', function () {
    Mail::fake();
    $first = $this->postJson('/api/v1/orders', checkout())->json('reference');
    $second = $this->postJson('/api/v1/orders', checkout(['phone' => '0700000000']))->json('reference');

    expect((int) substr($second, -5))->toBe((int) substr($first, -5) + 1);
});

it('sends no customer e-mail when none was given', function () {
    Mail::fake();
    $this->postJson('/api/v1/orders', checkout(['email' => '']))->assertCreated();

    Mail::assertQueued(NewOrderShop::class);
    Mail::assertNotQueued(OrderConfirmationCustomer::class);
});

it('records the pro pricing on a reseller order', function () {
    Mail::fake();
    $user = validatedReseller();
    Sanctum::actingAs($user);

    $reference = $this->postJson('/api/v1/orders', checkout(['lines' => [['sku' => 'D13AJH.N', 'qty' => 1]]]))->assertCreated()->json('reference');

    $order = Order::query()->where('reference', $reference)->firstOrFail();
    expect($order->pricing)->toBe('pro')->and($order->user_id)->toBe($user->id)->and($order->total)->toBe(520000);
});

it('validates the checkout like the design', function (array $overrides, string $field, string $message) {
    $this->postJson('/api/v1/orders', checkout($overrides))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field => $message]);
})->with([
    'incomplete phone' => [['phone' => '06 12 34'], 'phone', 'Numéro incomplet : saisissez 10 chiffres, par exemple 06 12 34 56 78.'],
    'landline-like phone' => [['phone' => '0412345678'], 'phone', 'Numéro incomplet'],
    'CGV not accepted' => [['cgv' => false], 'cgv', 'Cochez cette case pour confirmer la commande.'],
    'unknown city' => [['city' => 'Paris'], 'city', 'Choisissez votre ville dans la liste.'],
    'empty basket' => [['lines' => []], 'lines', 'Votre panier est vide.'],
    'out of stock' => [['lines' => [['sku' => 'D19AKH.NK0', 'qty' => 1]]], 'lines', 'Article indisponible'],
    'honeypot filled' => [['website' => 'http://spam.example'], 'form', 'Envoi refusé'],
    'posted too fast' => [['_t' => 2500], 'form', 'Envoi refusé'],
]);

it('shows the confirmation only with the access token', function () {
    Mail::fake();
    $placed = $this->postJson('/api/v1/orders', checkout())->json();

    $this->getJson("/api/v1/orders/{$placed['reference']}?t=wrong")->assertNotFound();
    $this->getJson("/api/v1/orders/{$placed['reference']}?t={$placed['accessToken']}")
        ->assertOk()
        ->assertJsonPath('reference', $placed['reference'])
        ->assertJsonPath('customer.phone', '06 12 34 56 78')
        ->assertJsonPath('total', 694000)
        ->assertJsonMissingPath('access_token');
});

it('tracks an order by reference and phone, with the status timeline', function () {
    Mail::fake();
    $reference = $this->postJson('/api/v1/orders', checkout())->json('reference');
    Order::query()->where('reference', $reference)->firstOrFail()->transitionTo(OrderStatus::Confirmee);

    $this->postJson('/api/v1/orders/track', ['reference' => strtolower($reference), 'phone' => '+212 6 12 34 56 78'])
        ->assertOk()
        ->assertJsonPath('statusLabel', 'Confirmée')
        ->assertJsonPath('timeline.0.label', 'Reçue')
        ->assertJsonPath('timeline.0.state', 'done')
        ->assertJsonPath('timeline.1.state', 'active')
        ->assertJsonPath('timeline.2.state', 'pending')
        ->assertJsonPath('timeline.2.date', null);

    $this->postJson('/api/v1/orders/track', ['reference' => $reference, 'phone' => '0699999999'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['reference' => 'Aucune commande ne correspond']);
});
