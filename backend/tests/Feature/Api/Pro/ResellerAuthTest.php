<?php

use App\Enums\LeadType;
use App\Enums\ResellerStatus;
use App\Filament\Resources\Resellers\Pages\ListResellerAccounts;
use App\Mail\NewLeadShop;
use App\Mail\ResellerPasswordReset;
use App\Mail\ResellerRefused;
use App\Mail\ResellerValidated;
use App\Models\Lead;
use App\Models\ResellerAccount;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Routing\Middleware\ThrottleRequestsWithRedis;
use Illuminate\Support\Facades\Mail;
use Livewire\Livewire;

beforeEach(function () {
    $this->seed();
    // Rate limits are covered by the limiter itself; here they would only couple the tests.
    $this->withoutMiddleware([ThrottleRequests::class, ThrottleRequestsWithRedis::class]);
    Mail::fake();
});

function application(array $overrides = []): array
{
    return [
        'company' => 'Froid Sud SARL', 'ice' => '001528749000099', 'city' => 'Agadir', 'activity' => 'revendeur',
        'contact_name' => 'Youssef Amrani', 'phone' => '0677889900', 'email' => 'Youssef@FroidSud.ma',
        'password' => 'secret-pass', 'message' => 'LG et Carrier', 'cgv' => true,
        'website' => '', '_t' => 6000, ...$overrides,
    ];
}

it('registers a reseller application awaiting validation', function () {
    $this->postJson('/api/v1/resellers/apply', application())->assertOk();

    $user = User::query()->where('email', 'youssef@froidsud.ma')->firstOrFail();
    expect($user->hasRole(User::ROLE_RESELLER))->toBeTrue()
        ->and($user->phone)->toBe('0677889900')
        ->and($user->resellerAccount->status)->toBe(ResellerStatus::EnAttente)
        ->and($user->resellerAccount->city?->name)->toBe('Agadir')
        ->and($user->isValidatedReseller())->toBeFalse();

    $lead = Lead::query()->latest('id')->firstOrFail();
    expect($lead->type)->toBe(LeadType::Revendeur)->and($lead->payload['ice'])->toBe('001528749000099');
    Mail::assertQueued(NewLeadShop::class);
});

it('validates the application with the design messages', function () {
    $this->postJson('/api/v1/resellers/apply', application(['company' => '', 'ice' => '00152874900', 'phone' => '06', 'cgv' => false]))
        ->assertUnprocessable()
        ->assertJsonPath('errors.company.0', 'Indiquez le nom de la société.')
        ->assertJsonPath('errors.ice.0', 'L’ICE comporte 15 chiffres. Vous en avez saisi 11.')
        ->assertJsonPath('errors.phone.0', 'Saisissez 10 chiffres, par exemple 06 12 34 56 78.')
        ->assertJsonPath('errors.cgv.0', 'Cochez cette case pour envoyer la demande.');

    $this->postJson('/api/v1/resellers/apply', application(['email' => 'contact@froid-atlas.ma', 'phone' => '0661234567']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'phone']);
});

it('logs in a validated reseller by e-mail or phone and returns its company', function () {
    $password = config('shop.seed.reseller_password');

    $byMail = $this->postJson('/api/v1/auth/login', ['login' => 'CONTACT@froid-atlas.ma', 'password' => $password])
        ->assertOk()->assertJsonPath('user.company', 'Froid Atlas SARL');
    $this->postJson('/api/v1/auth/login', ['login' => '06 61 23 45 67', 'password' => $password])->assertOk();

    $token = $byMail->json('token');
    $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('user.company', 'Froid Atlas SARL');

    $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();
    expect(User::query()->where('email', 'contact@froid-atlas.ma')->first()->tokens()->count())->toBe(1);
});

it('refuses wrong passwords, pending accounts and staff accounts with the same message', function () {
    $message = 'Identifiants incorrects. Vérifiez votre e-mail ou téléphone et votre mot de passe.';
    $this->postJson('/api/v1/auth/login', ['login' => 'contact@froid-atlas.ma', 'password' => 'motdepase'])
        ->assertUnprocessable()->assertJsonPath('message', $message);

    $this->postJson('/api/v1/resellers/apply', application())->assertOk();
    $this->postJson('/api/v1/auth/login', ['login' => 'youssef@froidsud.ma', 'password' => 'secret-pass'])
        ->assertUnprocessable()->assertJsonPath('message', $message);

    $this->postJson('/api/v1/auth/login', ['login' => config('shop.seed.admin_email'), 'password' => config('shop.seed.admin_password')])
        ->assertUnprocessable();
});

it('protects pro routes', function () {
    $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    $this->getJson('/api/v1/pro/frequent-refs')->assertUnauthorized();

    $this->postJson('/api/v1/resellers/apply', application())->assertOk();
    $pending = User::query()->where('email', 'youssef@froidsud.ma')->firstOrFail();
    $token = $pending->createToken('test')->plainTextToken;
    $this->withToken($token)->getJson('/api/v1/auth/me')->assertForbidden();
});

it('resets a forgotten password through the e-mailed link', function () {
    $this->postJson('/api/v1/auth/forgot', ['login' => '0661234567'])->assertOk();
    $this->postJson('/api/v1/auth/forgot', ['login' => 'inconnu@example.ma'])->assertOk();

    $token = null;
    Mail::assertQueued(ResellerPasswordReset::class, function (ResellerPasswordReset $mail) use (&$token) {
        $token = $mail->token;

        return $mail->hasTo('contact@froid-atlas.ma');
    });
    Mail::assertQueuedCount(1);

    $this->postJson('/api/v1/auth/reset', ['token' => 'faux', 'email' => 'contact@froid-atlas.ma', 'password' => 'nouveau-mdp'])
        ->assertUnprocessable()->assertJsonValidationErrors('token');
    $this->postJson('/api/v1/auth/reset', ['token' => $token, 'email' => 'contact@froid-atlas.ma', 'password' => 'nouveau-mdp'])
        ->assertOk();
    $this->postJson('/api/v1/auth/login', ['login' => 'contact@froid-atlas.ma', 'password' => 'nouveau-mdp'])->assertOk();
});

it('e-mails the applicant when the back office validates or refuses the account', function () {
    $this->postJson('/api/v1/resellers/apply', application())->assertOk();
    $account = ResellerAccount::query()->where('company', 'Froid Sud SARL')->firstOrFail();
    $admin = User::factory()->create();
    $admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($admin);

    $list = Livewire::test(ListResellerAccounts::class);
    runAction($list, TestAction::make('validate')->table($account));
    Mail::assertQueued(ResellerValidated::class, fn ($m) => $m->hasTo('youssef@froidsud.ma'));

    runAction(Livewire::test(ListResellerAccounts::class, ['activeTab' => 'valide']), TestAction::make('refuse')->table($account), ['reason' => 'ICE introuvable']);
    Mail::assertQueued(ResellerRefused::class, fn ($m) => $m->account->refusal_reason === 'ICE introuvable');
});
