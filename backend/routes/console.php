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
