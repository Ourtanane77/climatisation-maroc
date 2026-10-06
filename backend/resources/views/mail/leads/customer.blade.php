<x-mail::message>
@switch($lead->type)
@case(\App\Enums\LeadType::Contact)
# Message envoyé

Nous vous répondons du lundi au samedi, de 9h à 19h.
@break
@case(\App\Enums\LeadType::Revendeur)
# Votre demande est enregistrée.

Nous vous contactons pour valider votre compte.
@break
@default
# Demande envoyée

Merci{{ $lead->name ? ' '.$lead->name : '' }}. Nous vous rappelons au {{ \App\Rules\MoroccanPhone::format($lead->phone) }} pour parler de votre projet et, si besoin, organiser la visite technique.
@endswitch

{{ $hours }} · {{ $phone }}

{{ config('app.name') }}
</x-mail::message>
