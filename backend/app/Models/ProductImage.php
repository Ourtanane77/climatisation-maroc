<?php

namespace App\Models;

use App\Support\Images\ImageRenditions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Product photo. `source_url` is the old-site URL until `catalog:download-images` stores the file
 * locally (`path`) and generates WebP renditions (`renditions`: width => path).
 *
 * @property string|null $path
 * @property string|null $source_url
 * @property array<int, string>|null $renditions
 */
class ProductImage extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['renditions' => 'array'];
    }

    protected static function booted(): void
    {
        // A file uploaded in the back office gets its WebP renditions and dimensions.
        static::saving(function (ProductImage $image) {
            if ($image->path && $image->isDirty('path') && ! $image->isDirty('renditions')) {
                $disk = Storage::disk(config('filesystems.default'));
                if ($disk->exists($image->path)) {
                    $image->renditions = (new ImageRenditions($disk))->renditionsFor($image->path);
                    $size = @getimagesizefromstring((string) $disk->get($image->path));
                    [$image->width, $image->height] = $size ? [$size[0], $size[1]] : [null, null];
                }
            }
        });
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<ProductVariant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /** Public URL of the original, or null while the image has not been downloaded. */
    public function url(): ?string
    {
        return $this->path ? Storage::disk(config('filesystems.default'))->url($this->path) : null;
    }
}
