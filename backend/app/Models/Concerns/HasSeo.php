<?php

namespace App\Models\Concerns;

use App\Models\SeoMeta;
use Illuminate\Database\Eloquent\Relations\MorphOne;

/** Per-page editable title, meta description, H1, canonical, Open Graph image, noindex. */
trait HasSeo
{
    /** @return MorphOne<SeoMeta, $this> */
    public function seo(): MorphOne
    {
        return $this->morphOne(SeoMeta::class, 'seoable');
    }
}
