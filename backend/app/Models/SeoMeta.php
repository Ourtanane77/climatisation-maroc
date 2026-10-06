<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SeoMeta extends Model
{
    protected $table = 'seo_meta';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['noindex' => 'boolean'];
    }

    /** @return MorphTo<Model, $this> */
    public function seoable(): MorphTo
    {
        return $this->morphTo();
    }
}
