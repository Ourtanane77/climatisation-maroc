<?php

namespace App\Http\Controllers\Api\Commerce;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Order;
use App\Rules\MoroccanPhone;
use App\Support\Api\Audience;
use App\Support\Commerce\CartPricer;
use App\Support\Commerce\OrderPlacer;
use App\Support\Commerce\OrderPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Checkout (cash on delivery), confirmation page data and public order tracking.
 */
class OrderController extends Controller
{
    /** POST /orders */
    public function store(Request $request, OrderPlacer $placer): JsonResponse
    {
        $this->guardAgainstBots($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30', new MoroccanPhone],
            'email' => ['nullable', 'email', 'max:190'],
            'city' => ['required', 'string', Rule::in(City::query()->pluck('slug')->merge(City::query()->pluck('name'))->all())],
            'address' => ['required', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
            'technical_visit' => ['sometimes', 'boolean'],
            'installation_quote' => ['sometimes', 'boolean'],
            'cgv' => ['accepted'],
            'lines' => ['required', 'array', 'min:1', 'max:100'],
            'lines.*.sku' => ['required', 'string', 'max:64'],
            'lines.*.qty' => ['required', 'integer', 'min:1', 'max:'.CartPricer::MAX_QTY],
        ], [
            'name.required' => 'Indiquez votre nom complet.',
            'phone.required' => 'Numéro incomplet : saisissez 10 chiffres, par exemple 06 12 34 56 78.',
            'email.email' => 'Adresse e-mail invalide.',
            'city.required' => 'Choisissez votre ville.',
            'city.in' => 'Choisissez votre ville dans la liste.',
            'address.required' => 'Indiquez votre adresse de livraison.',
            'cgv.accepted' => 'Cochez cette case pour confirmer la commande.',
            'lines.required' => 'Votre panier est vide.',
            'lines.min' => 'Votre panier est vide.',
        ]);

        $order = $placer->place($data, Audience::user(), Audience::isReseller(), $request->ip());

        return response()->json([
            'reference' => $order->reference,
            'accessToken' => $order->access_token,
        ], 201);
    }

    /** GET /orders/{reference}?t= : confirmation page, readable with the order's access token. */
    public function show(Request $request, string $reference): JsonResponse
    {
        $order = Order::query()->where('reference', strtoupper($reference))->first();
        $token = (string) $request->query('t', '');
        if (! $order || $token === '' || ! hash_equals($order->access_token, $token)) {
            return response()->json(['message' => 'Commande introuvable.'], 404);
        }

        return response()->json(OrderPresenter::present($order))->header('Cache-Control', 'private, no-store');
    }

    /** POST /orders/track {reference, phone} */
    public function track(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reference' => ['required', 'string', 'max:20'],
            'phone' => ['required', 'string', 'max:30', new MoroccanPhone('Saisissez 10 chiffres, par exemple 06 12 34 56 78.')],
        ], [
            'reference.required' => 'Saisissez la référence de votre commande.',
            'phone.required' => 'Saisissez 10 chiffres, par exemple 06 12 34 56 78.',
        ]);

        $reference = strtoupper(trim($data['reference']));
        $order = Order::query()
            ->where('reference', $reference)
            ->where('phone', MoroccanPhone::normalize($data['phone']))
            ->first();

        if (! $order) {
            throw ValidationException::withMessages([
                'reference' => 'Aucune commande ne correspond à cette référence et à ce numéro.',
            ]);
        }

        return response()->json(OrderPresenter::present($order))->header('Cache-Control', 'private, no-store');
    }

    /**
     * Honeypot `website` must stay empty, and `_t` (milliseconds the form was open, sent by the
     * page, same unit as App\Support\Leads\FormGuard) must reach the minimum: bots post instantly.
     * Unlike leads, a refused order gets a visible error: a customer must never believe it went through.
     */
    private function guardAgainstBots(Request $request): void
    {
        $tooFast = (int) $request->input('_t', 0) < (int) config('commerce.min_form_milliseconds', 3000);
        if (filled($request->input('website')) || $tooFast) {
            throw ValidationException::withMessages(['form' => 'Envoi refusé. Réessayez dans quelques secondes.']);
        }
    }
}
