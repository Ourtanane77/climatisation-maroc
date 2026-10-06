@php($dh = fn (int $c) => \App\Mail\NewOrderShop::money($c))
<x-mail::message>
# Merci, votre commande est enregistrée

Référence de commande : **{{ $order->reference }}**

<x-mail::table>
| Article | Qté | Total |
|:--------|:---:|------:|
@foreach ($order->lines as $line)
| {{ trim($line->name.' '.$line->variant_label) }}<br>Réf. {{ $line->sku }} | {{ $line->qty }} | {{ $dh($line->line_total) }} |
@endforeach
@if ($order->option_technical_visit)
| Visite technique | | {{ $dh($order->technical_visit_price) }} |
@endif
| Livraison | | Gratuite |
| **Total** | | **{{ $dh($order->total) }}** |
</x-mail::table>

**Adresse de livraison**<br>
{{ $order->customer_name }}<br>
{{ \App\Rules\MoroccanPhone::format($order->phone) }}<br>
{{ $order->address }}<br>
{{ $order->city_name }}

## Et maintenant ?

1. Nous vous appelons pour confirmer
2. Livraison gratuite
3. Paiement à la réception

<x-mail::button :url="$trackUrl" color="primary">
Suivre ma commande
</x-mail::button>

Paiement à la livraison : vous réglez à la réception de votre commande.<br>
{{ $phone }}

{{ config('app.name') }}
</x-mail::message>
