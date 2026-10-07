<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

/**
 * Daily backup (scheduled in routes/console.php when BACKUP_ENABLED=true): a MySQL dump and the
 * public and private storage, in one dated folder under BACKUP_PATH (default
 * storage/app/private/backups, on the persistent private-storage volume). Older backups beyond
 * --keep are deleted. Copy the folder off the server (rsync, S3…): a backup on the same disk does
 * not survive the disk. Restore with scripts/restore.sh (docs/deployment.md).
 */
#[Signature('app:backup {--keep=14 : Number of backups to keep}')]
#[Description('Sauvegarde la base de données et les fichiers (photos, pièces jointes)')]
class Backup extends Command
{
    public function handle(): int
    {
        $root = rtrim((string) config('backup.path'), '/');
        $folder = $root.'/'.now()->format('Y-m-d_His');
        File::ensureDirectoryExists($folder, 0750);

        $db = config('database.connections.mysql');
        $dump = Process::fromShellCommandline(
            'mysqldump --single-transaction --quick --no-tablespaces --routines --default-character-set=utf8mb4 '
            .'-h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" | gzip -6 > "$TARGET"',
            null,
            ['DB_HOST' => $db['host'], 'DB_PORT' => (string) $db['port'], 'DB_USER' => $db['username'], 'MYSQL_PWD' => $db['password'],
                'DB_NAME' => $db['database'], 'TARGET' => "{$folder}/database.sql.gz"],
            null,
            3600,
        );
        $dump->run();
        if (! $dump->isSuccessful() || filesize("{$folder}/database.sql.gz") < 100) {
            $this->components->error('Échec de la sauvegarde de la base : '.trim($dump->getErrorOutput()));
            File::deleteDirectory($folder);

            return self::FAILURE;
        }

        // The backups live inside private storage: never archive them into themselves.
        $exclude = '--exclude=./'.ltrim(str_replace(storage_path('app/private'), '', $root), '/');
        foreach (['public' => storage_path('app/public'), 'private' => storage_path('app/private')] as $name => $path) {
            $tar = new Process(['tar', '-czf', "{$folder}/storage-{$name}.tar.gz", $exclude, '-C', $path, '.'], null, null, null, 3600);
            $tar->run();
            if (! $tar->isSuccessful()) {
                $this->components->error("Échec de l’archive storage-{$name} : ".trim($tar->getErrorOutput()));
                File::deleteDirectory($folder);

                return self::FAILURE;
            }
        }

        $this->rotate($root, max(1, (int) $this->option('keep')));
        $this->components->info("Sauvegarde : {$folder}");

        return self::SUCCESS;
    }

    /** Keeps the newest $keep dated folders. */
    private function rotate(string $root, int $keep): void
    {
        $folders = collect(File::directories($root))
            ->filter(fn (string $d) => preg_match('/\d{4}-\d{2}-\d{2}_\d{6}$/', $d))
            ->sort()->values();
        $folders->slice(0, max(0, $folders->count() - $keep))->each(fn (string $d) => File::deleteDirectory($d));
    }
}
