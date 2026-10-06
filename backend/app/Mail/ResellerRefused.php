<?php

namespace App\Mail;

use App\Models\ResellerAccount;
use App\Settings\GeneralSettings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent when the back office refuses a reseller application (with the reason, when given). */
class ResellerRefused extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public ResellerAccount $account)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre demande de compte revendeur');
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.resellers.refused', with: [
            'account' => $this->account,
            'phone' => '0666-602599',
            'hours' => app(GeneralSettings::class)->hours,
        ]);
    }
}
