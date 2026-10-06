<?php

namespace App\Mail;

use App\Enums\LeadType;
use App\Models\Lead;
use App\Rules\MoroccanPhone;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Shop notification for a new request (devis, contact, revendeur, secteur, alerte stock). */
class NewLeadShop extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Lead $lead)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        $who = $this->lead->company ?: ($this->lead->name ?: MoroccanPhone::format($this->lead->phone));

        return new Envelope(
            subject: 'Nouvelle demande · '.self::typeLabel($this->lead->type).' · '.$who,
            replyTo: $this->lead->email ? [$this->lead->email] : [],
        );
    }

    public function content(): Content
    {
        $this->lead->loadMissing(['source', 'variant.product']);

        return new Content(markdown: 'mail.leads.shop', with: [
            'lead' => $this->lead,
            'typeLabel' => self::typeLabel($this->lead->type),
            'adminUrl' => url('/admin/leads/'.$this->lead->id),
            'attachmentUrl' => $this->lead->attachment_path ? route('admin.leads.attachment', $this->lead) : null,
        ]);
    }

    public static function typeLabel(LeadType $type): string
    {
        return match ($type) {
            LeadType::Devis => 'Demande de devis',
            LeadType::Contact => 'Message',
            LeadType::Revendeur => 'Demande de compte revendeur',
            LeadType::Secteur => 'Devis secteur',
            LeadType::AlerteStock => 'Alerte stock',
        };
    }
}
