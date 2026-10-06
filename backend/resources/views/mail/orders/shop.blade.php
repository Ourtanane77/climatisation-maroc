@php($dh = fn (int $c) => \App\Mail\NewOrderShop::money($c))
<x-mail::message>
# Nouvelle commande {{ $order->reference }}

**{{ $order->customer_name }}** · {{ \App\Rules\MoroccanPhone::format($order->phone) }}@if ($order->email) · {{ $order->email }}@endif<br>
{{ $order->address }}, {{ $order->city_name }}
@if ($order->note)

Note pour le livreur : {{ $order->note }}
@endif

Tarif : {{ $order->pricing === 'pro' ? 'Revendeur' : 'Public' }}

<x-mail::table>
| Article | Réf. | Qté | Prix | Total |
|:--------|:-----|:---:|-----:|------:|
@foreach ($order->lines as $line)
| {{ trim($line->name.' '.$line->variant_label) }} | {{ $line->sku }} | {{ $line->qty }} | {{ $dh($line->unit_price) }} | {{ $dh($line->line_total) }} |
@endforeach
| Sous-total | | | | {{ $dh($order->subtotal) }} |
@if ($order->option_technical_visit)
| Visite technique | | | | {{ $dh($order->technical_visit_price) }} |
@endif
| **Total** | | | | **{{ $dh($order->total) }}** |
</x-mail::table>

Visite technique : {{ $order->option_technical_visit ? 'Oui' : 'Non' }}<br>
Devis de pose : {{ $order->option_installation_quote ? 'Oui' : 'Non' }}

<x-mail::button :url="$adminUrl" color="primary">
Voir la commande
</x-mail::button>
</x-mail::message>
