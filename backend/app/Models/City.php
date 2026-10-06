<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** City of the delivery select list ("Autre ville" has is_other). */
class City extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_other' => 'boolean'];
    }

    /** @return HasOne<CityPage, $this> */
    public function page(): HasOne
    {
        return $this->hasOne(CityPage::class);
    }
}
