<?php

namespace App\Support\Leads;

use App\Enums\LeadType;
use App\Mail\LeadReceivedCustomer;
use App\Mail\NewLeadShop;
use App\Models\City;
use App\Models\Lead;
use App\Rules\MoroccanPhone;
use App\Settings\GeneralSettings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/** Stores a form submission as a lead and queues the e-mails (shop inbox, customer copy). */
class LeadRecorder
{
    public function __construct(private GeneralSettings $settings) {}

    /** @param array<string, mixed> $attributes */
    public function record(LeadType $type, array $attributes, Request $request, ?Model $source = null): Lead
    {
        $cityName = $attributes['city_name'] ?? null;
        unset($attributes['city_name']);
        $city = $cityName ? City::query()->where('name', $cityName)->first() : null;

        $lead = new Lead([
            ...$attributes,
            'type' => $type,
            'phone' => isset($attributes['phone']) ? MoroccanPhone::normalize($attributes['phone']) : null,
            'city_id' => $city?->id,
            'city_name' => $cityName,
            'source_url' => self::sourceUrl($request),
            'ip' => $request->ip(),
        ]);
        if ($source) {
            $lead->source()->associate($source);
        }
        $lead->save();

        $shopEmail = $this->settings->email ?: config('shop.notification_email');
        if ($shopEmail) {
            Mail::to($shopEmail)->queue(new NewLeadShop($lead));
        }
        if ($lead->email && $type !== LeadType::AlerteStock) {
            Mail::to($lead->email)->queue(new LeadReceivedCustomer($lead));
        }

        return $lead;
    }

    /** Page the form was sent from, forwarded by the front office (`source_url`), else the referer. */
    private static function sourceUrl(Request $request): ?string
    {
        $url = (string) ($request->input('source_url') ?: $request->headers->get('referer', ''));

        return $url !== '' ? mb_substr($url, 0, 255) : null;
    }
}
