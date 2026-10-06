<?php

use App\Enums\LeadStatus;
use App\Enums\LeadType;
use App\Mail\LeadReceivedCustomer;
use App\Mail\NewLeadShop;
use App\Models\Lead;
use App\Models\SectorPage;
use Illuminate\Http\UploadedFile;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Routing\Middleware\ThrottleRequestsWithRedis;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed();
    // Rate limits are covered by the limiter itself; here they would only couple the tests.
    $this->withoutMiddleware([ThrottleRequests::class, ThrottleRequestsWithRedis::class]);
    Mail::fake();
});

/** A human-looking submission: empty honeypot, form open for 5 s. */
function human(array $data): array
{
    return [...$data, 'website' => '', '_t' => 5000];
}

it('stores a quote request with its attachment and e-mails the shop and the customer', function () {
    Storage::fake('local');

    $this->post('/api/v1/leads/quote', human([
        'customer_kind' => 'professionnel',
        'name' => 'Karim Benali',
        'company' => 'Riad Atlas',
        'phone' => '06 61 23 45 67',
        'email' => 'karim@example.ma',
        'city' => 'Marrakech',
        'surface' => 40,
        'project_type' => 'Nouvelle installation',
        'space_type' => 'Appartement',
        'message' => '3 pièces',
        'attachment' => UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
    ]), ['Accept' => 'application/json'])->assertOk()->assertJson(['ok' => true]);

    $lead = Lead::query()->latest('id')->firstOrFail();
    expect($lead->type)->toBe(LeadType::Devis)
        ->and($lead->status)->toBe(LeadStatus::Nouveau)
        ->and($lead->phone)->toBe('0661234567')
        ->and($lead->company)->toBe('Riad Atlas')
        ->and($lead->city?->name)->toBe('Marrakech')
        ->and($lead->space_type)->toBe('Appartement');
    Storage::disk('local')->assertExists($lead->attachment_path);

    Mail::assertQueued(NewLeadShop::class, fn ($m) => $m->lead->is($lead));
    Mail::assertQueued(LeadReceivedCustomer::class, fn ($m) => $m->hasTo('karim@example.ma'));
});

it('validates the quote form with the design messages', function () {
    $this->postJson('/api/v1/leads/quote', human(['customer_kind' => 'particulier', 'name' => ' ', 'phone' => '06 61 2']))
        ->assertUnprocessable()
        ->assertJsonPath('errors.name.0', 'Indiquez votre nom.')
        ->assertJsonPath('errors.phone.0', 'Numéro incomplet : saisissez 10 chiffres, par exemple 06 12 34 56 78.');
});

it('drops the company of a private customer and sends no customer copy without e-mail', function () {
    $this->postJson('/api/v1/leads/quote', human(['customer_kind' => 'particulier', 'name' => 'Sara', 'company' => 'X', 'phone' => '0612345678']))
        ->assertOk();

    expect(Lead::query()->latest('id')->first()->company)->toBeNull();
    Mail::assertQueued(NewLeadShop::class);
    Mail::assertNotQueued(LeadReceivedCustomer::class);
});

it('silently drops bot submissions (honeypot or form sent too fast)', function () {
    $before = Lead::query()->count();

    $this->postJson('/api/v1/leads/contact', ['phone' => '0612345678', 'website' => 'http://spam', '_t' => 9000])->assertOk();
    $this->postJson('/api/v1/leads/contact', ['phone' => '0612345678', '_t' => 400])->assertOk();

    expect(Lead::query()->count())->toBe($before);
    Mail::assertNothingQueued();
});

it('stores a contact message', function () {
    $this->postJson('/api/v1/leads/contact', human([
        'name' => 'Nadia', 'phone' => '0712345678', 'subject' => 'Facturation', 'message' => 'Facture de mars',
    ]))->assertOk();

    $lead = Lead::query()->latest('id')->firstOrFail();
    expect($lead->type)->toBe(LeadType::Contact)->and($lead->subject)->toBe('Facturation');
});

it('rejects an invalid contact phone with the contact page message', function () {
    $this->postJson('/api/v1/leads/contact', human(['phone' => '12']))
        ->assertUnprocessable()
        ->assertJsonPath('errors.phone.0', 'Saisissez 10 chiffres, par exemple 06 12 34 56 78.');
});

it('links a sector quote to its published sector page', function () {
    $sector = SectorPage::query()->published()->firstOrFail();

    $this->postJson('/api/v1/leads/sector', human([
        'sector_slug' => $sector->slug, 'name' => 'Omar', 'company' => 'Le Jardin', 'phone' => '0612345678',
        'city' => 'Marrakech', 'project_type' => 'Remplacement',
    ]))->assertOk();

    $lead = Lead::query()->latest('id')->firstOrFail();
    expect($lead->type)->toBe(LeadType::Secteur)->and($lead->source?->is($sector))->toBeTrue();

    $unpublished = SectorPage::query()->where('is_published', false)->firstOrFail();
    $this->postJson('/api/v1/leads/sector', human(['sector_slug' => $unpublished->slug, 'phone' => '0612345678']))
        ->assertUnprocessable();
});

it('records a stock alert for a variant', function () {
    $this->postJson('/api/v1/leads/stock-alert', human(['sku' => 'D13AJH.N', 'phone' => '06 12 34 56 78']))->assertOk();

    $lead = Lead::query()->latest('id')->firstOrFail();
    expect($lead->type)->toBe(LeadType::AlerteStock)
        ->and($lead->variant?->sku)->toBe('D13AJH.N');

    $this->postJson('/api/v1/leads/stock-alert', human(['sku' => 'NOPE', 'phone' => '0612345678']))
        ->assertUnprocessable()->assertJsonValidationErrors('sku');
});
