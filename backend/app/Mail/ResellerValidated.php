<?php

namespace App\Mail;

use App\Mail\Concerns\ForSite;
use App\Models\ResellerAccount;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent when the back office validates a reseller account (links to the site the reseller applied on). */
class ResellerValidated extends Mailable implements ShouldQueue
{
    use ForSite, Queueable, SerializesModels;

    public function __construct(public ResellerAccount $account)
    {
        $this->afterCommit();
    }

    protected function siteKey(): ?string
    {
        return $this->account->site;
    }

    public function envelope(): Envelope
    {
        return new Envelope(from: $this->siteFrom(), subject: 'Votre compte revendeur est validé');
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.resellers.validated', with: [
            'account' => $this->account,
            'loginUrl' => $this->site()->url('/connexion'),
        ]);
    }
}
