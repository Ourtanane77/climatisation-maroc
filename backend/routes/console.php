<?php

use Illuminate\Support\Facades\Schedule;

// Daily database + storage backup (production: BACKUP_ENABLED=true; the scheduler container runs
// `php artisan schedule:work`). See config/backup.php and docs/deployment.md.
if (config('backup.enabled')) {
    Schedule::command('app:backup', ['--keep' => config('backup.keep')])
        ->dailyAt((string) config('backup.at'))
        ->withoutOverlapping()
        ->onOneServer();
}

// The API cache is tagged (App\Support\Api\ApiCache): Redis keeps an index of every entry per tag,
// which only shrinks when stale entries are pruned. Without this the index grows until Redis is
// full (maxmemory) and every write fails, sessions included (back office down).
Schedule::command('cache:prune-stale-tags')->hourly()->withoutOverlapping()->onOneServer();
