<?php

namespace App\Mail;

use App\Models\ResellerAccount;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent when the back office validates a reseller account. */
class ResellerValidated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public ResellerAccount $account)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre compte revendeur est validé');
    }

    public function content(): Content
    {
        $front = rtrim((string) config('shop.frontend_url'), '/');

        return new Content(markdown: 'mail.resellers.validated', with: [
            'account' => $this->account,
            'loginUrl' => $front.'/connexion',
        ]);
    }
}
