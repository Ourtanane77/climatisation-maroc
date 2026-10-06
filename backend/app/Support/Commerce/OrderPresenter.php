<?php

namespace App\Support\Commerce;

use App\Enums\OrderStatus;
use App\Http\Resources\ProductCardResource;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\OrderStatusHistory;
use App\Rules\MoroccanPhone;
use App\Support\Api\ImageUrl;
use Illuminate\Support\Carbon;

/**
 * An order as the customer sees it on the confirmation and tracking pages (no internal fields).
 */
class OrderPresenter
{
    /** Tracking steps in order (design/Suivi commande.dc.html). */
    private const STEPS = [OrderStatus::Nouvelle, OrderStatus::Confirmee, OrderStatus::Expediee, OrderStatus::Livree];

    /** @return array<string, mixed> */
    public static function present(Order $order): array
    {
        $order->loadMissing(['lines.variant.product.images', 'history']);

        return [
            'reference' => $order->reference,
            'placedAt' => $order->created_at?->toIso8601String(),
            'placedOn' => self::longDate($order->created_at),
            'status' => $order->status->value,
            'statusLabel' => $order->status->trackingLabel(),
            'customer' => [
                'name' => $order->customer_name,
                'phone' => MoroccanPhone::format($order->phone),
                'email' => $order->email,
            ],
            'address' => $order->address,
            'city' => $order->city_name,
            'note' => $order->note,
            'options' => [
                'technicalVisit' => (bool) $order->option_technical_visit,
                'installationQuote' => (bool) $order->option_installation_quote,
            ],
            'lines' => $order->lines->map(fn (OrderLine $line) => self::line($line))->values()->all(),
            'subtotal' => (int) $order->subtotal,
            'technicalVisitPrice' => (int) $order->technical_visit_price,
            'deliveryFee' => (int) $order->delivery_fee,
            'total' => (int) $order->total,
            'timeline' => self::timeline($order),
        ];
    }

    /** @return array<string, mixed> */
    private static function line(OrderLine $line): array
    {
        $variant = $line->variant;
        $product = $variant?->product;

        return [
            'sku' => $line->sku,
            'name' => trim($line->name.' '.($line->variant_label ?? '')),
            'href' => $product?->is_published ? $product->url() : null,
            'image' => $product ? ImageUrl::for(ProductCardResource::imageFor($product, $variant), 320) : null,
            'art' => $product?->art_key,
            'dark' => $variant?->colour === 'Noir',
            'unitPrice' => (int) $line->unit_price,
            'qty' => (int) $line->qty,
            'lineTotal' => (int) $line->line_total,
        ];
    }

    /**
     * Reçue → Confirmée → Expédiée → Livrée, with the date each step was reached.
     * A cancelled order keeps the steps it reached and is flagged by its status.
     *
     * @return list<array{key: string, label: string, date: string|null, state: string}>
     */
    private static function timeline(Order $order): array
    {
        $reached = [];
        foreach ($order->history as $entry) {
            /** @var OrderStatusHistory $entry */
            $reached[(string) $entry->getRawOriginal('status')] ??= $entry->created_at;
        }
        $reached[OrderStatus::Nouvelle->value] ??= $order->created_at;

        $current = $order->status === OrderStatus::Annulee
            ? null
            : array_search($order->status, self::STEPS, true);

        $steps = [];
        foreach (self::STEPS as $i => $status) {
            $date = $reached[$status->value] ?? null;
            $state = match (true) {
                $current === false || $current === null => $date ? 'done' : 'pending',
                $i < $current => 'done',
                $i === $current => $status === OrderStatus::Livree ? 'done' : 'active',
                default => 'pending',
            };
            $steps[] = [
                'key' => $status->value,
                'label' => $status->trackingLabel(),
                'date' => $state === 'pending' ? null : self::shortDate($date),
                'state' => $state,
            ];
        }

        return $steps;
    }

    private static function longDate(mixed $date): ?string
    {
        return $date ? Carbon::parse($date)->locale('fr')->translatedFormat('j F Y') : null;
    }

    private static function shortDate(mixed $date): ?string
    {
        return $date ? Carbon::parse($date)->locale('fr')->translatedFormat('j M Y') : null;
    }
}
