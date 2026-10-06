<?php

namespace App\Mail;

use App\Enums\LeadType;
use App\Models\Lead;
use App\Settings\GeneralSettings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Acknowledgement sent to the visitor, only when an e-mail was given in the form. */
class LeadReceivedCustomer extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Lead $lead)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: match ($this->lead->type) {
            LeadType::Contact => 'Message envoyé',
            LeadType::Revendeur => 'Votre demande est enregistrée.',
            default => 'Demande envoyée',
        });
    }

    public function content(): Content
    {
        $settings = app(GeneralSettings::class);

        return new Content(markdown: 'mail.leads.customer', with: [
            'lead' => $this->lead,
            'hours' => $settings->hours,
            'phone' => $settings->sales_phone,
        ]);
    }
}
