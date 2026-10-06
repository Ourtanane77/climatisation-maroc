<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** "Mot de passe oublié": link to choose a new password on the front office. */
class ResellerPasswordReset extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $token) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Choisir un nouveau mot de passe');
    }

    public function content(): Content
    {
        $front = rtrim((string) config('shop.frontend_url'), '/');
        $query = http_build_query(['token' => $this->token, 'email' => $this->user->email]);

        return new Content(markdown: 'mail.resellers.password-reset', with: [
            'resetUrl' => $front.'/connexion/nouveau-mot-de-passe?'.$query,
            'minutes' => (int) config('auth.passwords.users.expire', 60),
        ]);
    }
}
