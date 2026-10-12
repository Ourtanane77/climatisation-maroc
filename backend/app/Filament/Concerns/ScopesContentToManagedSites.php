<?php

namespace App\Filament\Concerns;

use App\Filament\Support\SiteScope;
use Illuminate\Database\Eloquent\Builder;

/** Content and catalogue resources (HasSites): a user restricted to some sites sees their records only. */
trait ScopesContentToManagedSites
{
    public static function getEloquentQuery(): Builder
    {
        return SiteScope::content(parent::getEloquentQuery());
    }
}
