<?php

namespace App\Support\Images;

use Illuminate\Contracts\Filesystem\Filesystem;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

/**
 * Stores an image and its responsive WebP renditions on the public disk (local or S3), so the
 * front office can serve pre-sized files with srcset (Next.js does not optimise private-host images).
 */
class ImageRenditions
{
    /** Rendition widths (px). Cards use ~300, product page ~640, zoom ~1200. */
    public const WIDTHS = [320, 640, 1200];

    private ImageManager $manager;

    public function __construct(private Filesystem $disk)
    {
        $this->manager = new ImageManager(new Driver);
    }

    /**
     * @return array{path: string, width: int, height: int, renditions: array<int, string>}
     */
    public function store(string $binary, string $directory, string $basename): array
    {
        $image = $this->manager->read($binary);
        $width = $image->width();
        $height = $image->height();

        $path = "{$directory}/{$basename}.{$this->extension($binary)}";
        $this->disk->put($path, $binary);
        $renditions = $this->renditionsFor($path);

        return ['path' => $path, 'width' => $width, 'height' => $height, 'renditions' => $renditions];
    }

    /**
     * Builds renditions for a file already on the disk (back-office upload).
     *
     * @return array<int, string>
     */
    public function renditionsFor(string $path): array
    {
        $binary = (string) $this->disk->get($path);
        $directory = pathinfo($path, PATHINFO_DIRNAME);
        $basename = pathinfo($path, PATHINFO_FILENAME);
        $width = $this->manager->read($binary)->width();

        $renditions = [];
        foreach (self::WIDTHS as $target) {
            $resized = $this->manager->read($binary);
            if ($width > $target) {
                $resized->scaleDown(width: $target);
            }
            $renditionPath = "{$directory}/{$basename}-{$target}.webp";
            $this->disk->put($renditionPath, (string) $resized->toWebp(82));
            $renditions[$target] = $renditionPath;
            if ($width <= $target) {
                break;
            }
        }

        return $renditions;
    }

    private function extension(string $binary): string
    {
        return match (true) {
            str_starts_with($binary, "\x89PNG") => 'png',
            str_starts_with($binary, "\xFF\xD8") => 'jpg',
            str_starts_with($binary, 'RIFF') => 'webp',
            str_starts_with($binary, 'GIF') => 'gif',
            default => 'bin',
        };
    }
}
