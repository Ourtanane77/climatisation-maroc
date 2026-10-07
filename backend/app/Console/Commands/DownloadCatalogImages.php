<?php

namespace App\Console\Commands;

use App\Models\ProductImage;
use App\Support\Images\ImageRenditions;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Downloads product images still pointing at the old site into local storage (or S3) and builds
 * their WebP renditions, so the new site never hotlinks. Safe to re-run: done images are skipped.
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

        $failed = [];
        $this->withProgressBar($images, function (ProductImage $image) use ($renditions, &$failed) {
            try {
                $response = Http::timeout(30)->retry(2, 500)->get((string) $image->source_url);
                $response->throw();
                // Decoded and made URL-safe: a "%20" kept in a file name would 404 once served.
                $basename = pathinfo(rawurldecode((string) parse_url((string) $image->source_url, PHP_URL_PATH)), PATHINFO_FILENAME);
                $basename = trim((string) preg_replace('/[^A-Za-z0-9._-]+/', '-', $basename), '-');
                $stored = $renditions->store($response->body(), 'products/'.$image->product->slug, $basename);
                $image->update($stored);
            } catch (Throwable $e) {
                $failed[] = [$image->id, $image->source_url, $e->getMessage()];
            }
        });
        $this->newLine(2);

        $this->components->info(($images->count() - count($failed)).' image(s) téléchargée(s).');
        if ($failed) {
            $this->components->warn(count($failed).' échec(s) :');
            $this->table(['Image', 'URL', 'Erreur'], $failed);

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
