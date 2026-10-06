<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FaqItem extends Model
{
    protected $guarded = ['id'];

    /** @return MorphTo<Model, $this> */
    public function faqable(): MorphTo
    {
        return $this->morphTo();
    }
}
