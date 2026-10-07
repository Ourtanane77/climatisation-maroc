<?php

namespace App\Console\Commands;

use App\Models\ProductImage;
use App\Support\Images\ImageRenditions;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Downloads product images still pointing at the old site into local storage (or S3) and builds
 * their WebP renditions, so the new site never hotlinks. Safe to re-run: done images are skipped.
 * A file already on the disk under its expected name (e.g. restored with scripts/storage-import.sh)
 * is reused without contacting the old site; --force downloads again anyway.
 */
#[Signature('catalog:download-images {--force : Download again images already stored} {--limit=0 : Stop after N images}')]
#[Description('Télécharge les images produits de l’ancien site et génère les versions WebP')]
class DownloadCatalogImages extends Command
{
    public function handle(): int
    {
        $renditions = new ImageRenditions(Storage::disk(config('filesystems.default')));

        $query = ProductImage::query()->whereNotNull('source_url')->with('product:id,slug');
        if (! $this->option('force')) {
            $query->whereNull('path');
        }
        if ($limit = (int) $this->option('limit')) {
            $query->limit($limit);
        }
        $images = $query->get();

        if ($images->isEmpty()) {
            $this->components->info('Aucune image à télécharger.');

            return self::SUCCESS;
        }

        $disk = Storage::disk(config('filesystems.default'));
        $failed = [];
        $reused = 0;
        $this->withProgressBar($images, function (ProductImage $image) use ($renditions, $disk, &$failed, &$reused) {
            try {
                // Decoded and made URL-safe: a "%20" kept in a file name would 404 once served.
                $basename = pathinfo(rawurldecode((string) parse_url((string) $image->source_url, PHP_URL_PATH)), PATHINFO_FILENAME);
                $basename = trim((string) preg_replace('/[^A-Za-z0-9._-]+/', '-', $basename), '-');
                $directory = 'products/'.$image->product->slug;

                $local = $this->option('force') ? null : $this->localFile($disk, $directory, $basename);
                if ($local) {
                    $size = @getimagesizefromstring((string) $disk->get($local));
                    $image->update([
                        'path' => $local,
                        'width' => $size[0] ?? null,
                        'height' => $size[1] ?? null,
                        'renditions' => $this->localRenditions($disk, $directory, $basename) ?: $renditions->renditionsFor($local),
                    ]);
                    $reused++;

                    return;
                }

                $response = Http::timeout(30)->retry(3, 1000)->get((string) $image->source_url);
                $response->throw();
                $stored = $renditions->store($response->body(), $directory, $basename);
                $image->update($stored);
            } catch (Throwable $e) {
                $failed[] = [$image->id, $image->source_url, $e->getMessage()];
            }
        });
        $this->newLine(2);

        $this->components->info(($images->count() - count($failed) - $reused).' image(s) téléchargée(s), '.$reused.' reprise(s) du disque.');
        if ($failed) {
            $this->components->warn(count($failed).' échec(s) :');
            $this->table(['Image', 'URL', 'Erreur'], $failed);

            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /** The original of an image already on the disk (any image extension), or null. */
    private function localFile(Filesystem $disk, string $directory, string $basename): ?string
    {
        foreach (['png', 'jpg', 'jpeg', 'webp', 'gif'] as $extension) {
            if ($disk->exists("{$directory}/{$basename}.{$extension}")) {
                return "{$directory}/{$basename}.{$extension}";
            }
        }

        return null;
    }

    /**
     * Existing WebP renditions ({basename}-{width}.webp), width => path; empty when none.
     *
     * @return array<int, string>
     */
    private function localRenditions(Filesystem $disk, string $directory, string $basename): array
    {
        $found = [];
        foreach (ImageRenditions::WIDTHS as $width) {
            $path = "{$directory}/{$basename}-{$width}.webp";
            if ($disk->exists($path)) {
                $found[$width] = $path;
            }
        }

        return $found;
    }
}
