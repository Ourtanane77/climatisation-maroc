@php
    $dh = fn (?int $c) => $c === null ? '—' : number_format($c / 100, 2, ',', ' ').' Dhs';
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Bon de commande {{ $order->reference }}</title>
    <style>
        @page { size: A4; margin: 16mm; }
        * { box-sizing: border-box; }
        body { font-family: Figtree, Arial, sans-serif; color: #1A1A1A; font-size: 13px; margin: 0; }
        header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0B5CAD; padding-bottom: 12px; }
        h1 { font-size: 22px; margin: 0 0 4px; }
        .muted { color: #5F6368; }
        .ref { font-size: 18px; font-weight: 800; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 18px 0; }
        .box { border: 1px solid #E3E8EE; border-radius: 8px; padding: 12px; }
        .box h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #5F6368; margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { padding: 8px; border-bottom: 1px solid #EEF1F4; text-align: left; vertical-align: top; }
        th { background: #F4F6F8; font-size: 12px; }
        td.num, th.num { text-align: right; white-space: nowrap; }
        .totals td { border: 0; }
        .total { font-size: 16px; font-weight: 800; }
        .cod { margin-top: 16px; padding: 10px 12px; background: #E8EFF8; border-radius: 8px; font-weight: 600; }
        .sign { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .sign div { border-top: 1px solid #9AA3AD; padding-top: 6px; }
        @media screen { body { max-width: 820px; margin: 24px auto; } .print { margin-bottom: 16px; } }
        @media print { .print { display: none; } }
    </style>
</head>
<body>
    <button class="print" onclick="window.print()">Imprimer</button>
    <header>
        <div>
            <h1>Ariha Froid · Climatisation Maroc</h1>
            <div class="muted">
                @foreach ($settings->stores as $store)
                    {{ $store['address'] }}<br>
                @endforeach
                Ventes {{ $settings->sales_phone }} · {{ $settings->email }}
            </div>
        </div>
        <div style="text-align:right">
            <div class="muted">Bon de commande</div>
            <div class="ref">{{ $order->reference }}</div>
            <div class="muted">{{ $order->created_at->format('d/m/Y H:i') }} · {{ $order->status->getLabel() }}</div>
        </div>
    </header>

    <div class="grid">
        <div class="box">
            <h2>Client</h2>
            <strong>{{ $order->customer_name }}</strong><br>
            {{ $order->phone }}<br>
            {{ $order->email }}
            @if ($order->user?->resellerAccount)
                <br>Revendeur : {{ $order->user->resellerAccount->company }} (ICE {{ $order->user->resellerAccount->ice }})
            @endif
        </div>
        <div class="box">
            <h2>Livraison</h2>
            {{ $order->address }}<br>
            {{ $order->city_name }}
            @if ($order->note)
                <br><span class="muted">Note : {{ $order->note }}</span>
            @endif
        </div>
    </div>

    <table>
        <thead>
            <tr><th>Produit</th><th>Référence</th><th class="num">Prix unitaire</th><th class="num">Qté</th><th class="num">Total</th></tr>
        </thead>
        <tbody>
            @foreach ($order->lines as $line)
                <tr>
                    <td>{{ $line->name }} {{ $line->variant_label }}</td>
                    <td>{{ $line->sku }}</td>
                    <td class="num">{{ $dh($line->unit_price) }}</td>
                    <td class="num">{{ $line->qty }}</td>
                    <td class="num">{{ $dh($line->line_total) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals" style="width:50%;margin-left:auto">
        <tr><td>Sous-total</td><td class="num">{{ $dh($order->subtotal) }}</td></tr>
        @if ($order->option_technical_visit)
            <tr><td>Visite technique</td><td class="num">{{ $dh($order->technical_visit_price) }}</td></tr>
        @endif
        <tr><td>Livraison</td><td class="num">{{ $order->delivery_fee ? $dh($order->delivery_fee) : 'Gratuite' }}</td></tr>
        <tr class="total"><td>Total</td><td class="num">{{ $dh($order->total) }}</td></tr>
    </table>

    @if ($order->option_installation_quote)
        <p><strong>Le client souhaite un devis de pose.</strong></p>
    @endif
    <div class="cod">Paiement à la livraison : {{ $dh($order->total) }} à encaisser.</div>

    <div class="sign">
        <div>Signature du livreur</div>
        <div>Signature du client</div>
    </div>
</body>
</html>
