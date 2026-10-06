<x-mail::message>
# {{ $typeLabel }}

@if ($lead->company)**{{ $lead->company }}**<br>@endif
@if ($lead->name){{ $lead->name }}<br>@endif
@if ($lead->phone){{ \App\Rules\MoroccanPhone::format($lead->phone) }}@endif
@if ($lead->email) · {{ $lead->email }}@endif

<x-mail::table>
| | |
|:--|:--|
@if ($lead->customer_kind)
| Vous êtes | {{ $lead->customer_kind === 'professionnel' ? 'Professionnel' : 'Particulier' }} |
@endif
@if ($lead->city_name)
| Ville | {{ $lead->city_name }} |
@endif
@if ($lead->subject)
| Sujet | {{ $lead->subject }} |
@endif
@if ($lead->project_type)
| Type de projet | {{ $lead->project_type }} |
@endif
@if ($lead->space_type)
| Type d'espace | {{ $lead->space_type }} |
@endif
@if ($lead->surface)
| Surface | {{ $lead->surface }} m² |
@endif
@foreach (($lead->payload ?? []) as $key => $value)
| {{ ['ice' => 'ICE', 'activite' => 'Activité'][$key] ?? $key }} | {{ is_scalar($value) ? $value : json_encode($value) }} |
@endforeach
@if ($lead->source && method_exists($lead->source, 'url'))
| Page | {{ $lead->source->name ?? $lead->source->title ?? $lead->source_url }} |
@endif
</x-mail::table>

@if ($lead->message)
**Message**

{{ $lead->message }}
@endif

@if ($attachmentUrl)
Pièce jointe : [télécharger]({{ $attachmentUrl }})
@endif

<x-mail::button :url="$adminUrl" color="primary">
Voir la demande
</x-mail::button>
</x-mail::message>
