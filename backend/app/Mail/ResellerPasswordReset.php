<?php

namespace App\Mail;

use App\Mail\Concerns\ForSite;
use App\Models\User;
use App\Support\Sites\Sites;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * "Mot de passe oublié": link to choose a new password on the front office. Reseller accounts are
 * shared by both sites: the link goes to the site the request came from (default: the current one).
 */
class ResellerPasswordReset extends Mailable implements ShouldQueue
{
    use ForSite, Queueable, SerializesModels;

    public string $siteKey;

    public function __construct(public User $user, public string $token, ?string $site = null)
    {
        $this->siteKey = $site ?? Sites::currentKey();
    }

    protected function siteKey(): ?string
    {
        return $this->siteKey;
    }

    public function envelope(): Envelope
    {
        return new Envelope(from: $this->siteFrom(), subject: 'Choisir un nouveau mot de passe');
    }

    public function content(): Content
    {
        $query = http_build_query(['token' => $this->token, 'email' => $this->user->email]);

        return new Content(markdown: 'mail.resellers.password-reset', with: [
            'resetUrl' => $this->site()->url('/connexion/nouveau-mot-de-passe?'.$query),
            'minutes' => (int) config('auth.passwords.users.expire', 60),
        ]);
    }
}
