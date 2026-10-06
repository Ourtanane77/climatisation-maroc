<x-mail::message>
# Mot de passe oublié

Pour choisir un nouveau mot de passe pour votre compte professionnel, utilisez ce lien. Il est valable {{ $minutes }} minutes.

<x-mail::button :url="$resetUrl" color="primary">
Choisir un nouveau mot de passe
</x-mail::button>

Si vous n’avez rien demandé, ignorez cet e-mail : votre mot de passe ne change pas.

{{ config('app.name') }}
</x-mail::message>
