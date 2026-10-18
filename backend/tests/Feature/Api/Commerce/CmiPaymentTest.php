<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\StockStatus;
use App\Filament\Pages\ManagePaymentSettings;
use App\Mail\NewOrderShop;
use App\Mail\OrderConfirmationCustomer;
use App\Models\Category;
use App\Models\City;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Settings\ArfroPaymentSettings;
use App\Settings\PaymentSettings;
use App\Support\Payments\Cmi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\TestResponse;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;

/*
| Online card payment through CMI: settings, checkout choice, signed form, callback, browser return.
*/

const CMI_TEST_KEY = 'Cle|De\\Test2026';

beforeEach(function () {
    City::query()->create(['name' => 'Marrakech', 'slug' => 'marrakech', 'position' => 1]);
    $category = Category::query()->create(['name' => 'Climatiseurs muraux', 'slug' => 'mural']);
    $product = Product::query()->create(['category_id' => $category->id, 'name' => 'LG Dual Inverter', 'slug' => 'lg-dual-inverter', 'art_key' => 'mural']);
    $product->variants()->create(['sku' => 'D13AJH.N', 'price' => 650000, 'promo_price' => 570000, 'stock_status' => StockStatus::EnStock]);
});

function enableCmi(string $settings = PaymentSettings::class, string $key = CMI_TEST_KEY): void
{
    /** @var PaymentSettings $s */
    $s = new $settings;
    $s->cmi_enabled = true;
    $s->cmi_client_id = '600005142';
    $s->cmi_store_key = $key;
    $s->save();
}

function cmiCheckout(array $overrides = []): array
{
    return array_merge([
        'name' => 'Yassine El Amrani',
        'phone' => '06 12 34 56 78',
        'email' => 'client@example.com',
        'city' => 'marrakech',
        'address' => '24 rue Ibn Sina, Guéliz',
        'cgv' => true,
        'payment_method' => 'carte',
        'lines' => [['sku' => 'D13AJH.N', 'qty' => 1]],
        'website' => '',
        '_t' => 12000,
    ], $overrides);
}

function cardOrder(): Order
{
    $response = test()->postJson('/api/v1/orders', cmiCheckout())->assertCreated();

    return Order::query()->where('reference', $response->json('reference'))->firstOrFail();
}

/** A message from CMI about an order, signed with a key. */
function cmiMessage(Order $order, array $overrides = [], string $key = CMI_TEST_KEY): array
{
    $params = array_merge([
        'clientid' => '600005142',
        'oid' => $order->reference,
        'amount' => Cmi::amount((int) $order->total),
        'currency' => '504',
        'ProcReturnCode' => '00',
        'Response' => 'Approved',
        'TransId' => '26291KJHG12345',
        'mdStatus' => '1',
        'MaskedPan' => '423456***1234',
        'rnd' => 'abc',
        'hashAlgorithm' => 'ver3',
        'encoding' => 'UTF-8',
    ], $overrides);
    $params['HASH'] = Cmi::hash($params, $key);

    return $params;
}

/** Posts a form body exactly as CMI does (the controller reads the raw body). */
function cmiPost(string $uri, array $params): TestResponse
{
    return test()->call('POST', $uri, [], [], [], ['CONTENT_TYPE' => 'application/x-www-form-urlencoded'], http_build_query($params));
}

it('computes the ver3 hash of the CMI kit', function () {
    // The kit's PHP sample, transcribed as is.
    $params = ['clientid' => '600005142', 'amount' => '5700.00', 'BillToName' => 'A|B\\C', 'oid' => 'CM-2026-00001', 'encoding' => 'UTF-8', 'Currency' => '504'];
    $keys = array_keys($params);
    natcasesort($keys);
    $hashval = '';
    foreach ($keys as $param) {
        $escaped = str_replace('|', '\\|', str_replace('\\', '\\\\', trim($params[$param])));
        if (! in_array(strtolower($param), ['hash', 'encoding'], true)) {
            $hashval .= $escaped.'|';
        }
    }
    $hashval .= str_replace('|', '\\|', str_replace('\\', '\\\\', CMI_TEST_KEY));
    $expected = base64_encode(pack('H*', hash('sha512', $hashval)));

    expect(Cmi::hash($params, CMI_TEST_KEY))->toBe($expected)
        ->and(Cmi::verify([...$params, 'HASH' => $expected], CMI_TEST_KEY))->toBeTrue()
        ->and(Cmi::verify([...$params, 'amount' => '1.00', 'HASH' => $expected], CMI_TEST_KEY))->toBeFalse();
});

it('offers card payment only once enabled with a store key', function () {
    $this->getJson('/api/v1/checkout/options')->assertOk()->assertJsonPath('onlinePayment', false);
    $this->postJson('/api/v1/orders', cmiCheckout())->assertUnprocessable()->assertJsonValidationErrors('payment_method');

    enableCmi();

    $this->getJson('/api/v1/checkout/options')->assertOk()->assertJsonPath('onlinePayment', true);
    // Per site: Arfro keeps it off.
    $this->getJson('/api/v1/checkout/options', ['X-Site' => 'arfro'])->assertOk()->assertJsonPath('onlinePayment', false);
});

it('stores the store key encrypted', function () {
    enableCmi();

    $raw = (string) DB::table('settings')->where('group', 'payment')->where('name', 'cmi_store_key')->value('payload');
    expect($raw)->not->toContain('Cle')
        ->and((new PaymentSettings)->cmi_store_key)->toBe(CMI_TEST_KEY);
});

it('places a card order awaiting payment, without e-mails yet', function () {
    enableCmi();
    Mail::fake();

    $this->postJson('/api/v1/orders', cmiCheckout(['email' => '']))->assertUnprocessable()->assertJsonValidationErrors('email');

    $response = $this->postJson('/api/v1/orders', cmiCheckout())->assertCreated()->assertJsonPath('paymentMethod', 'carte');
    $order = Order::query()->where('reference', $response->json('reference'))->firstOrFail();

    expect($order->payment_method)->toBe(PaymentMethod::Carte)
        ->and($order->payment_status)->toBe(PaymentStatus::EnAttente);
    Mail::assertNothingQueued();
});

it('keeps payment on delivery as the default', function () {
    enableCmi();
    Mail::fake();

    $response = $this->postJson('/api/v1/orders', cmiCheckout(['payment_method' => null, 'email' => '']))->assertCreated();
    $order = Order::query()->where('reference', $response->json('reference'))->firstOrFail();

    expect($order->payment_method)->toBe(PaymentMethod::Livraison)->and($order->payment_status)->toBeNull();
    Mail::assertQueued(NewOrderShop::class);
});

it('gives the signed CMI form with the order token only', function () {
    enableCmi();
    $order = cardOrder();

    $this->postJson("/api/v1/orders/{$order->reference}/payment", ['t' => 'wrong'])->assertNotFound();
    $this->postJson("/api/v1/orders/{$order->reference}/payment", ['t' => $order->access_token], ['X-Site' => 'arfro'])->assertNotFound();

    $form = $this->postJson("/api/v1/orders/{$order->reference}/payment", ['t' => $order->access_token])
        ->assertOk()
        ->assertJsonPath('url', 'https://payment.cmi.co.ma/fim/est3Dgate')
        ->assertJsonPath('fields.amount', '5700.00')
        ->assertJsonPath('fields.currency', '504')
        ->assertJsonPath('fields.oid', $order->reference)
        ->assertJsonPath('fields.clientid', '600005142')
        ->json('fields');

    expect(Cmi::verify($form, CMI_TEST_KEY))->toBeTrue()
        ->and($form['callbackUrl'])->toEndWith('/api/v1/payments/cmi/callback')
        ->and(json_encode($form))->not->toContain('Cle');
});

it('marks the order paid on a signed approved callback and captures it', function () {
    enableCmi();
    $order = cardOrder();
    Mail::fake();

    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order))->assertOk()->assertSeeText('ACTION=POSTAUTH');

    $order->refresh();
    expect($order->payment_status)->toBe(PaymentStatus::Payee)
        ->and($order->paid_at)->not->toBeNull()
        ->and($order->payment_transaction_id)->toBe('26291KJHG12345')
        ->and($order->payments()->count())->toBe(1)
        ->and($order->payments()->first()->payload)->not->toHaveKey('HASH');
    Mail::assertQueued(NewOrderShop::class);
    Mail::assertQueued(OrderConfirmationCustomer::class);

    // Notified again: captured again, no second e-mail. Another transaction: never charged twice.
    Mail::fake();
    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order))->assertSeeText('ACTION=POSTAUTH');
    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order, ['TransId' => 'OTHER']))->assertSeeText('FAILURE');
    Mail::assertNothingQueued();

    // Paid: no payment form any more.
    $this->postJson("/api/v1/orders/{$order->reference}/payment", ['t' => $order->access_token])->assertStatus(409);
});

it('checks the hash on the raw body: edge Unicode spaces and dotted names', function () {
    enableCmi();
    $order = cardOrder();

    // Laravel's input would trim the non-breaking space and rename EXTRA.TRXDATE to EXTRA_TRXDATE.
    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order, ['ErrMsg' => "Approuv\u{00E9}\u{00A0}", 'EXTRA.TRXDATE' => '20261018 10:00:00', 'EXTRA.CARDBRAND' => '']))
        ->assertSeeText('ACTION=POSTAUTH');

    $payload = $order->payments()->first()->payload;
    expect($order->refresh()->payment_status)->toBe(PaymentStatus::Payee)
        ->and($payload)->toHaveKey('EXTRA.TRXDATE')
        ->and($payload)->not->toHaveKey('clientid')
        ->and($payload)->not->toHaveKey('HASH');
});

it('sends CMI customer fields without edge spaces', function () {
    enableCmi();
    $response = $this->postJson('/api/v1/orders', cmiCheckout(['name' => str_repeat('a', 59)."\u{00A0}b"]))->assertCreated();
    $order = Order::query()->where('reference', $response->json('reference'))->firstOrFail();

    $form = Cmi::form($order)['fields'];
    expect($form['BillToName'])->toBe(str_repeat('a', 59))
        ->and(Cmi::verify($form, CMI_TEST_KEY))->toBeTrue();
});

it('refuses a callback with a wrong signature, amount or currency', function () {
    enableCmi();
    $order = cardOrder();

    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order, [], 'autre-cle'))->assertSeeText('FAILURE');
    $forged = cmiMessage($order);
    $forged['amount'] = '1.00';
    cmiPost('/api/v1/payments/cmi/callback', $forged)->assertSeeText('FAILURE');
    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order, ['amount' => '1.00']))->assertSeeText('FAILURE');
    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order, ['currency' => '978']))->assertSeeText('FAILURE');
    cmiPost('/api/v1/payments/cmi/callback', ['oid' => 'XX-2026-99999'])->assertSeeText('FAILURE');

    expect($order->refresh()->payment_status)->toBe(PaymentStatus::EnAttente)
        ->and($order->payments()->where('valid_hash', false)->count())->toBe(2)
        // An unsigned message keeps nothing but the order id.
        ->and($order->payments()->where('valid_hash', false)->first()->payload)->toBe(['oid' => $order->reference]);
});

it('records a declined payment', function () {
    enableCmi();
    $order = cardOrder();

    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order, ['ProcReturnCode' => '05', 'Response' => 'Declined']))->assertSeeText('APPROVED');

    expect($order->refresh()->payment_status)->toBe(PaymentStatus::Echouee);
    // It can be paid again.
    $this->postJson("/api/v1/orders/{$order->reference}/payment", ['t' => $order->access_token])->assertOk();
});

it('sends the customer back to the confirmation page only with a signed return', function () {
    enableCmi();
    $order = cardOrder();

    $ok = cmiPost('/api/v1/payments/cmi/retour', cmiMessage($order))->assertStatus(303)->headers->get('Location');
    expect($ok)->toContain('/commande/confirmation?')->toContain('t='.$order->access_token)->toContain('paiement=ok');
    // The return never marks the order paid: only the callback does.
    expect($order->refresh()->payment_status)->toBe(PaymentStatus::EnAttente);

    $forged = cmiPost('/api/v1/payments/cmi/retour', cmiMessage($order, [], 'autre-cle'))->assertStatus(303)->headers->get('Location');
    expect($forged)->not->toContain($order->access_token)->toContain('/suivi-commande');

    $failed = cmiPost('/api/v1/payments/cmi/retour', cmiMessage($order, ['ProcReturnCode' => '99']))->headers->get('Location');
    expect($failed)->toContain('paiement=echec')
        ->and($order->refresh()->payment_status)->toBe(PaymentStatus::Echouee);
});

it('handles an Arfro order with the Arfro key', function () {
    enableCmi(ArfroPaymentSettings::class, 'cle-arfro');
    $response = $this->postJson('/api/v1/orders', cmiCheckout(), ['X-Site' => 'arfro'])->assertCreated();
    $order = Order::query()->where('reference', $response->json('reference'))->firstOrFail();

    // CMI sends no X-Site header: the site is the order's.
    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order, [], CMI_TEST_KEY))->assertSeeText('FAILURE');
    cmiPost('/api/v1/payments/cmi/callback', cmiMessage($order, [], 'cle-arfro'))->assertSeeText('ACTION=POSTAUTH');
    expect($order->refresh()->payment_status)->toBe(PaymentStatus::Payee);
});

it('keeps the stored key when the settings are saved with an empty key field', function () {
    enableCmi();
    Role::findOrCreate(User::ROLE_ADMIN, 'web');
    $admin = User::factory()->create();
    $admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($admin);

    Livewire::test(ManagePaymentSettings::class)
        ->assertSet('data.cmi_store_key', null)
        ->assertDontSee(CMI_TEST_KEY)
        ->set('data.cmi_mode', 'test')
        ->call('save')
        ->assertHasNoFormErrors();

    $settings = new PaymentSettings;
    expect($settings->cmi_store_key)->toBe(CMI_TEST_KEY)->and($settings->cmi_mode)->toBe('test');

    Livewire::test(ManagePaymentSettings::class)->set('data.cmi_store_key', 'nouvelle-cle')->call('save')->assertHasNoFormErrors();
    expect((new PaymentSettings)->cmi_store_key)->toBe('nouvelle-cle');
});
