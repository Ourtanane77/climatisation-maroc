<?php

/*
| Daily backups (php artisan app:backup, scheduled in routes/console.php). See docs/deployment.md.
*/

return [

    // Off by default: turned on in production (.env.prod), where the scheduler container runs it.
    'enabled' => (bool) env('BACKUP_ENABLED', false),

    // On the persistent private-storage volume by default. Copy it off the server regularly.
    'path' => env('BACKUP_PATH', storage_path('app/private/backups')),

    // Number of dated backups kept, and the time of day (server time zone) they run.
    'keep' => (int) env('BACKUP_KEEP', 14),
    'at' => env('BACKUP_AT', '03:15'),

];
