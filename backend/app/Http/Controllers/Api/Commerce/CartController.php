<?php

namespace App\Http\Controllers\Api\Commerce;

use App\Http\Controllers\Controller;
use App\Support\Api\Audience;
use App\Support\Commerce\CartPricer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** POST /cart/quote: prices the basket held in the visitor's cookie (never trusts client prices). */
class CartController extends Controller
{
    public function quote(Request $request, CartPricer $pricer): JsonResponse
    {
        $data = $request->validate([
            'lines' => ['present', 'array', 'max:100'],
            'lines.*.sku' => ['required', 'string', 'max:64'],
            // Quantities below 1 are dropped and above the maximum clamped by the pricer.
            'lines.*.qty' => ['required', 'integer'],
            'options.technical_visit' => ['sometimes', 'boolean'],
        ]);

        $reseller = Audience::isReseller();
        $quote = $pricer->quote($data['lines'], $reseller, (bool) ($data['options']['technical_visit'] ?? false));
        $quote['suggestions'] = $pricer->suggestions(array_column($quote['lines'], 'sku'), $reseller);

        return response()->json($quote)->header('Cache-Control', 'private, no-store');
    }
}
