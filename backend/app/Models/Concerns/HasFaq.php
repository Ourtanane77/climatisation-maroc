<?php

namespace App\Models\Concerns;

use App\Models\FaqItem;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/** FAQ items attachable to any page type, ordered by position. */
trait HasFaq
{
    /** @return MorphMany<FaqItem, $this> */
    public function faqItems(): MorphMany
    {
        return $this->morphMany(FaqItem::class, 'faqable')->orderBy('position');
    }
}
