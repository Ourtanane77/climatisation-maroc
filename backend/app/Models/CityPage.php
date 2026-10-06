<?php

namespace App\Models;

use App\Models\Concerns\HasFaq;
use App\Models\Concerns\HasSeo;
use App\Models\Contracts\HasPublicUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** City landing page, served at /climatisation-<slug>. */
class CityPage extends Model implements HasPublicUrl
{
    use HasFaq, HasSeo;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_published' => 'boolean'];
    }

    /** @return BelongsTo<City, $this> */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /** @param Builder<CityPage> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    public function url(): string
    {
        return '/climatisation-'.$this->slug;
    }
}
