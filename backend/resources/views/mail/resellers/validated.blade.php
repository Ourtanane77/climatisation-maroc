<x-mail::message>
# Votre compte revendeur est validé

Bonjour{{ $account->contact_name ? ' '.$account->contact_name : '' }},

Le compte professionnel de **{{ $account->company }}** est actif : vos prix revendeur s’affichent dès la connexion, et la commande rapide par référence est disponible.

<x-mail::button :url="$loginUrl" color="primary">
Se connecter
</x-mail::button>

{{ config('app.name') }}
</x-mail::message>
