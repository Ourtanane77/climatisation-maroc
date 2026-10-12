<?php

namespace App\Filament\Concerns;

use App\Filament\Support\SiteScope;
use Illuminate\Database\Eloquent\Builder;

/**
 * Orders, leads, reseller accounts: a user restricted to some sites only lists and opens the
 * records of those sites (another site's record answers 404).
 */
trait ScopesRecordsToManagedSites
{
    public static function getEloquentQuery(): Builder
    {
        return SiteScope::records(parent::getEloquentQuery());
    }
}
