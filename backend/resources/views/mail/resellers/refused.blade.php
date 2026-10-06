<x-mail::message>
# Votre demande de compte revendeur

Bonjour{{ $account->contact_name ? ' '.$account->contact_name : '' }},

Nous ne pouvons pas ouvrir de compte revendeur pour **{{ $account->company }}**.
@if ($account->refusal_reason)

Motif : {{ $account->refusal_reason }}
@endif

Pour toute question : Projets et revendeurs, {{ $phone }} ({{ $hours }}).

{{ config('app.name') }}
</x-mail::message>
