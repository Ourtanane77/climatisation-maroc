<?php

namespace App\Support\Commerce;

use App\Enums\OrderStatus;
use App\Mail\NewOrderShop;
use App\Mail\OrderConfirmationCustomer;
use App\Models\City;
use App\Models\Order;
use App\Models\User;
use App\Rules\MoroccanPhone;
use App\Settings\GeneralSettings;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Creates a cash-on-delivery order from validated checkout data: prices are recomputed on the
 * server, lines are snapshotted, the reference is allocated, and the e-mails are queued.
 */
class OrderPlacer
{
    public function __construct(private CartPricer $pricer, private GeneralSettings $settings) {}

    /**
     * @param  array{name: string, phone: string, email?: string|null, city: string, address: string, note?: string|null, technical_visit?: bool, installation_quote?: bool, lines: array<int, array{sku: string, qty: int}>}  $data
     */
    public function place(array $data, ?User $user, bool $reseller, ?string $ip): Order
    {
        $technicalVisit = (bool) ($data['technical_visit'] ?? false);
        $quote = $this->pricer->quote($data['lines'], $reseller, $technicalVisit);

        $onRequest = array_values(array_filter($quote['lines'], fn (array $l) => $l['onRequest']));
        if ($onRequest !== []) {
            throw ValidationException::withMessages([
                'lines' => 'Prix sur demande : '.implode(', ', array_column($onRequest, 'name')).'. Retirez cet article du panier et demandez-nous un devis.',
            ]);
        }
        $unavailable = array_values(array_filter($quote['lines'], fn (array $l) => ! $l['available']));
        if ($quote['lines'] === [] || $quote['invalid'] !== [] || $unavailable !== []) {
            $names = array_merge(array_column($unavailable, 'name'), array_column($quote['invalid'], 'sku'));
            throw ValidationException::withMessages([
                'lines' => $names
                    ? 'Article indisponible : '.implode(', ', $names).'. Retirez-le du panier pour continuer.'
                    : 'Votre panier est vide.',
            ]);
        }

        $city = City::query()->where('slug', $data['city'])->orWhere('name', $data['city'])->first();

        $order = DB::transaction(function () use ($data, $user, $reseller, $ip, $quote, $technicalVisit, $city) {
            $order = Order::query()->create([
                'reference' => Order::nextReference(),
                'access_token' => Str::random(48),
                'user_id' => $user?->id,
                'pricing' => $reseller ? 'pro' : 'public',
                'customer_name' => trim($data['name']),
                'phone' => MoroccanPhone::normalize($data['phone']),
                'email' => $data['email'] ?? null ?: null,
                'city_id' => $city?->id,
                'city_name' => $city->name ?? $data['city'],
                'address' => trim($data['address']),
                'note' => $data['note'] ?? null ?: null,
                'status' => OrderStatus::Nouvelle,
                'status_changed_at' => now(),
                'option_technical_visit' => $technicalVisit,
                'technical_visit_price' => $technicalVisit ? $quote['technicalVisit']['price'] : 0,
                'option_installation_quote' => (bool) ($data['installation_quote'] ?? false),
                'subtotal' => $quote['subtotal'],
                'delivery_fee' => 0,
                'total' => $quote['total'],
                'ip' => $ip,
            ]);

            foreach ($quote['lines'] as $line) {
                $order->lines()->create([
                    'product_variant_id' => $line['variantId'],
                    'sku' => $line['sku'],
                    'name' => $line['productName'],
                    'variant_label' => $line['variantLabel'],
                    'unit_price' => $line['unitPrice'],
                    'qty' => $line['qty'],
                    'line_total' => $line['lineTotal'],
                ]);
            }
            $order->history()->create(['status' => OrderStatus::Nouvelle->value]);

            return $order;
        });

        $shopEmail = $this->settings->email ?: config('shop.notification_email');
        if ($shopEmail) {
            Mail::to($shopEmail)->queue(new NewOrderShop($order));
        }
        if ($order->email) {
            Mail::to($order->email)->queue(new OrderConfirmationCustomer($order));
        }

        return $order;
    }
}
