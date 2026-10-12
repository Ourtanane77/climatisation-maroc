<?php

namespace App\Mail;

use App\Mail\Concerns\ForSite;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Shop notification for a new order (sent to the e-mail set in the site's Réglages). */
class NewOrderShop extends Mailable implements ShouldQueue
{
    use ForSite, Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->afterCommit();
    }

    protected function siteKey(): ?string
    {
        return $this->order->site;
    }

    public function envelope(): Envelope
    {
        // « [Arfro] Nouvelle commande AR-2026-00001 · … »: one inbox can receive both sites' orders.
        return new Envelope(
            from: $this->siteFrom(),
            subject: '['.$this->site()->name."] Nouvelle commande {$this->order->reference} · ".self::money($this->order->total),
            replyTo: $this->order->email ? [$this->order->email] : [],
        );
    }

    public function content(): Content
    {
        $this->order->loadMissing('lines');

        return new Content(markdown: 'mail.orders.shop', with: [
            'order' => $this->order,
            'siteName' => $this->site()->name,
            'adminUrl' => url('/admin/orders/'.$this->order->id),
        ]);
    }

    /** Centimes → "5 700 Dhs". */
    public static function money(int $centimes): string
    {
        $decimals = $centimes % 100 === 0 ? 0 : 2;

        return number_format($centimes / 100, $decimals, ',', "\u{00A0}")."\u{00A0}Dhs";
    }
}
