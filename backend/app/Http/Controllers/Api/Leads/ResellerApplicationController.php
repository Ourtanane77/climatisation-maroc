<?php

namespace App\Http\Controllers\Api\Leads;

use App\Enums\LeadType;
use App\Enums\ResellerStatus;
use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\ResellerAccount;
use App\Models\User;
use App\Rules\MoroccanPhone;
use App\Support\Leads\FormGuard;
use App\Support\Leads\LeadRecorder;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * "Devenir revendeur": creates the user (role revendeur), the reseller account awaiting validation
 * and a lead of type revendeur. The account can log in once validated in the back office.
 */
class ResellerApplicationController extends Controller
{
    public function __construct(private LeadRecorder $recorder) {}

    public function __invoke(Request $request): JsonResponse
    {
        $request->merge([
            'ice' => preg_replace('/\D/', '', (string) $request->input('ice')),
            'email' => mb_strtolower(trim((string) $request->input('email'))),
        ]);

        $data = $request->validate([
            'company' => ['required', 'string', 'max:160'],
            'ice' => ['required', function (string $attribute, mixed $value, Closure $fail) {
                $n = strlen((string) $value);
                if ($n !== 15) {
                    $fail("L’ICE comporte 15 chiffres. Vous en avez saisi {$n}.");
                }
            }],
            'city' => ['nullable', 'string', 'exists:cities,name'],
            'activity' => ['required', Rule::in(array_keys(ResellerAccount::ACTIVITIES))],
            'contact_name' => ['nullable', 'string', 'max:120'],
            'phone' => ['required', new MoroccanPhone('Saisissez 10 chiffres, par exemple 06 12 34 56 78.'), function (string $attribute, mixed $value, Closure $fail) {
                if (User::query()->where('phone', MoroccanPhone::normalize((string) $value))->exists()) {
                    $fail('Un compte existe déjà avec ce numéro de téléphone.');
                }
            }],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'max:120'],
            'message' => ['nullable', 'string', 'max:5000'],
            'cgv' => ['accepted'],
        ], [
            'company.required' => 'Indiquez le nom de la société.',
            'ice.required' => 'L’ICE comporte 15 chiffres. Vous en avez saisi 0.',
            'email.required' => 'Indiquez votre adresse e-mail.',
            'email.email' => 'Indiquez une adresse e-mail valide.',
            'email.unique' => 'Un compte existe déjà avec cette adresse e-mail.',
            'password.required' => '8 caractères minimum.',
            'password.min' => '8 caractères minimum.',
            'cgv.accepted' => 'Cochez cette case pour envoyer la demande.',
        ]);

        if (FormGuard::isSpam($request)) {
            return response()->json(['ok' => true]);
        }

        $city = isset($data['city']) ? City::query()->where('name', $data['city'])->first() : null;

        DB::transaction(function () use ($data, $city, $request) {
            $user = User::query()->create([
                'name' => ($data['contact_name'] ?? null) ?: $data['company'],
                'email' => $data['email'],
                'phone' => MoroccanPhone::normalize($data['phone']),
                'password' => $data['password'],
            ]);
            $user->assignRole(User::ROLE_RESELLER);

            ResellerAccount::query()->create([
                'user_id' => $user->id,
                'company' => $data['company'],
                'ice' => $data['ice'],
                'city_id' => $city?->id,
                'activity' => $data['activity'],
                'contact_name' => $data['contact_name'] ?? null,
                'phone' => MoroccanPhone::normalize($data['phone']),
                'message' => $data['message'] ?? null,
                'status' => ResellerStatus::EnAttente,
            ]);

            $this->recorder->record(LeadType::Revendeur, [
                'customer_kind' => 'professionnel',
                'name' => $data['contact_name'] ?? null,
                'company' => $data['company'],
                'phone' => MoroccanPhone::normalize($data['phone']),
                'email' => $data['email'],
                'city_name' => $city?->name,
                'message' => $data['message'] ?? null,
                'payload' => [
                    'ice' => $data['ice'],
                    'activite' => ResellerAccount::ACTIVITIES[$data['activity']],
                ],
            ], $request, $user);
        });

        return response()->json(['ok' => true]);
    }
}
