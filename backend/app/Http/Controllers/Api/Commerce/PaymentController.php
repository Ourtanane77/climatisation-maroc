<?php

namespace App\Http\Controllers\Api\Commerce;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\Payments\Cmi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Online card payment through CMI (App\Support\Payments\Cmi). */
class PaymentController extends Controller
{
    /**
     * POST /orders/{reference}/payment {t} : the signed form the payment page posts to CMI.
     * POST, never cached nor rewritten by the typography middleware (the values are signed).
     */
    public function form(Request $request, string $reference): JsonResponse
    {
        $order = Order::query()->onSite()->where('reference', strtoupper($reference))->first();
        $token = (string) $request->input('t', '');
        if (! $order || $token === '' || ! hash_equals($order->access_token, $token)) {
            return response()->json(['message' => 'Commande introuvable.'], 404);
        }
        if (! Cmi::payable($order)) {
            return response()->json(['message' => 'Cette commande ne peut pas être payée en ligne.'], 409);
        }

        return response()->json([...Cmi::form($order), 'total' => (int) $order->total])
            ->header('Cache-Control', 'private, no-store');
    }

    /**
     * POST /payments/cmi/callback : server-to-server notification from CMI, answered in plain text.
     * The hash is checked on the body exactly as sent (Cmi::rawParams).
     */
    public function callback(Request $request): Response
    {
        return response(Cmi::handleCallback(Cmi::rawParams($request->getContent())), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    /** POST /payments/cmi/retour : the customer's browser coming back from CMI (okUrl, failUrl). */
    public function back(Request $request): RedirectResponse
    {
        return redirect()->away(Cmi::returnUrl(Cmi::rawParams($request->getContent())), 303);
    }
}
