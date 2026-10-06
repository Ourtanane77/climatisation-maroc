<?php

namespace App\Mail;

use App\Models\Order;
use App\Settings\GeneralSettings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Order summary sent to the customer, only when an e-mail was given at checkout. */
class OrderConfirmationCustomer extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Votre commande {$this->order->reference} est enregistrée");
    }

    public function content(): Content
    {
        $this->order->loadMissing('lines');
        $settings = app(GeneralSettings::class);
        $front = rtrim((string) config('shop.frontend_url'), '/');

        return new Content(markdown: 'mail.orders.customer', with: [
            'order' => $this->order,
            'trackUrl' => $front.'/suivi-commande?ref='.rawurlencode($this->order->reference),
            'phone' => $settings->sales_phone,
        ]);
    }
}
