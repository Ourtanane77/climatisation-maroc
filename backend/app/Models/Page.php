<?php

namespace App\Models;

use App\Enums\PageKind;
use App\Models\Concerns\HasFaq;
use App\Models\Concerns\HasSeo;
use App\Models\Contracts\HasPublicUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Static page (legal pages, À propos, Livraison et paiement). `body` holds Filament Builder blocks
 * ([{type, data}]); legal pages use numbered "article" blocks ({title, text}).
 *
 * @property PageKind $kind
 * @property array<int, array{type: string, data: array<string, mixed>}>|null $body
 */
class Page extends Model implements HasPublicUrl
{
    use HasFaq, HasSeo;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'kind' => PageKind::class,
            'body' => 'array',
            'is_published' => 'boolean',
        ];
    }

    /** @param Builder<Page> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    public function url(): string
    {
        return '/'.$this->slug;
    }
}
