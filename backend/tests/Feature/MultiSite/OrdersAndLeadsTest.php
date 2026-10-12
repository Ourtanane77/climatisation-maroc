<?php

use App\Enums\StockStatus;
use App\Mail\NewLeadShop;
use App\Mail\NewOrderShop;
use App\Mail\OrderConfirmationCustomer;
use App\Mail\ResellerValidated;
use App\Models\Category;
use App\Models\City;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Product;
use App\Models\ResellerAccount;
use App\Models\User;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Routing\Middleware\ThrottleRequestsWithRedis;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

/*
| Orders, leads and reseller applications record the site they came from; order references are
| numbered per site prefix (CM-, AR-); e-mails speak for that site.
*/

beforeEach(function () {
    $this->withoutMiddleware([ThrottleRequests::class, ThrottleRequestsWithRedis::class]);
    config(['sites.sites.arfro.url' => 'https://arfro.com']);
    City::query()->create(['name' => 'Marrakech', 'slug' => 'marrakech', 'position' => 1]);
    $category = Category::query()->create(['name' => 'Climatiseurs muraux', 'slug' => 'mural']);
    $product = Product::query()->create(['category_id' => $category->id, 'name' => 'LG Dual Inverter', 'slug' => 'lg-dual-inverter', 'is_published' => true]);
    $product->variants()->create(['sku' => 'D13AJH.N', 'price' => 650000, 'stock_status' => StockStatus::EnStock, 'is_default' => true]);
});

function msOrder(array $headers = []): array
{
    return test()->postJson('/api/v1/orders', [
        'name' => 'Yassine El Amrani', 'phone' => '06 12 34 56 78', 'email' => 'client@example.com',
        'city' => 'marrakech', 'address' => '24 rue Ibn Sina', 'cgv' => true,
        'lines' => [['sku' => 'D13AJH.N', 'qty' => 1]], 'website' => '', '_t' => 12000,
    ], $headers)->assertCreated()->json();
}

it('numbers orders per site and records the site', function () {
    Mail::fake();
    $year = now()->format('Y');

    $ar = msOrder(['X-Site' => 'arfro']);
    $cm = msOrder();
    $ar2 = msOrder(['X-Site' => 'arfro']);

    expect($ar['reference'])->toBe("AR-{$year}-00001")
        ->and($cm['reference'])->toBe("CM-{$year}-00001")
        ->and($ar2['reference'])->toBe("AR-{$year}-00002")
        ->and(Order::query()->where('reference', $ar['reference'])->value('site'))->toBe('arfro')
        ->and(Order::query()->where('reference', $cm['reference'])->value('site'))->toBe('cm');

    Mail::assertQueued(NewOrderShop::class, fn (NewOrderShop $m) => $m->order->site === 'arfro'
        && str_starts_with($m->envelope()->subject, '[Arfro] Nouvelle commande AR-')
        && $m->envelope()->from?->name === 'Arfro');
    Mail::assertQueued(NewOrderShop::class, fn (NewOrderShop $m) => str_starts_with($m->envelope()->subject, '[Climatisation Maroc] Nouvelle commande CM-'));
});

it('shows and tracks an order only on its own site', function () {
    Mail::fake();
    $ar = msOrder(['X-Site' => 'arfro']);
    $url = "/api/v1/orders/{$ar['reference']}?t={$ar['accessToken']}";

    $this->getJson($url, ['X-Site' => 'arfro'])->assertOk()->assertJsonPath('reference', $ar['reference']);
    $this->getJson($url)->assertNotFound();

    $track = ['reference' => $ar['reference'], 'phone' => '0612345678'];
    $this->postJson('/api/v1/orders/track', $track, ['X-Site' => 'arfro'])->assertOk();
    $this->postJson('/api/v1/orders/track', $track)->assertUnprocessable();
});

it('renders the customer e-mail for the order\'s site', function () {
    Mail::fake();
    $ar = msOrder(['X-Site' => 'arfro']);
    $order = Order::query()->where('reference', $ar['reference'])->firstOrFail();

    $html = (new OrderConfirmationCustomer($order))->render();

    expect($html)->toContain('https://arfro.com/suivi-commande?ref='.$ar['reference'])
        ->and($html)->toContain('Arfro')
        ->and(config('app.name'))->not->toBe('Arfro'); // restored after rendering
});

it('records the site of a lead and a reseller application', function () {
    Mail::fake();

    $this->postJson('/api/v1/leads/contact', ['phone' => '06 61 23 45 67', 'message' => 'Bonjour', 'website' => '', '_t' => 5000], ['X-Site' => 'arfro'])->assertOk();
    $lead = Lead::query()->latest('id')->firstOrFail();
    expect($lead->site)->toBe('arfro');
    Mail::assertQueued(NewLeadShop::class, fn (NewLeadShop $m) => str_starts_with($m->envelope()->subject, '[Arfro] Nouvelle demande'));

    $this->postJson('/api/v1/leads/contact', ['phone' => '06 61 23 45 68', 'website' => '', '_t' => 5000])->assertOk();
    expect(Lead::query()->latest('id')->value('site'))->toBe('cm');

    Role::findOrCreate(User::ROLE_RESELLER, 'web');
    $this->postJson('/api/v1/resellers/apply', [
        'company' => 'Froid Atlas', 'ice' => '001528749000012', 'activity' => 'installateur', 'phone' => '06 12 34 56 70',
        'email' => 'pro@froid-atlas.ma', 'password' => 'secret-123', 'cgv' => true, 'website' => '', '_t' => 5000,
    ], ['X-Site' => 'arfro'])->assertOk();

    $account = ResellerAccount::query()->firstOrFail();
    expect($account->site)->toBe('arfro')
        ->and(Lead::query()->latest('id')->value('site'))->toBe('arfro')
        ->and((new ResellerValidated($account))->render())->toContain('https://arfro.com/connexion');
});
