<?php

namespace App\Http\Controllers\Api\Content\Concerns;

use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\FaqItem;
use App\Models\Product;
use App\Models\SectorPage;
use App\Models\SeoMeta;
use App\Settings\GeneralSettings;
use App\Support\Api\ImageUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Http\Request;

/** Shared shapes of the content endpoints (sectors, services, pages, city pages). */
trait PresentsContent
{
    /** @var array<string, int>|null active category paths (lookup) */
    private ?array $activePaths = null;

    /**
     * A JSON list column (problems, solutions, included…) as a list of rows.
     *
     * @return list<array<string, mixed>>
     */
    protected function rows(mixed $value): array
    {
        return is_array($value) ? array_values(array_filter($value, 'is_array')) : [];
    }

    /** @return list<array{question: string, answer: string}> */
    protected function faq(Model $model): array
    {
        /** @var iterable<FaqItem> $items */
        $items = $model->faqItems; // @phpstan-ignore property.notFound

        return collect($items)->map(fn (FaqItem $f) => ['question' => $f->question, 'answer' => $f->answer])->values()->all();
    }

    /** @return array{title: ?string, description: ?string, h1: ?string, noindex: bool} */
    protected function seo(Model $model, ?string $fallbackTitle = null): array
    {
        /** @var SeoMeta|null $seo */
        $seo = $model->seo; // @phpstan-ignore property.notFound

        return [
            'title' => $seo?->title ?: $fallbackTitle,
            'description' => $seo?->description,
            'h1' => $seo?->h1 ?: $fallbackTitle,
            'noindex' => (bool) $seo?->noindex,
        ];
    }

    /**
     * Product cards of a "recommended products" relation, published families only.
     *
     * @param  BelongsToMany<Product, covariant Model>  $relation
     * @return array<int, mixed>
     */
    protected function productCards(BelongsToMany $relation, Request $request): array
    {
        $products = $relation->where('products.is_published', true)->with(['variants', 'images', 'brand'])->get();

        return ProductCardResource::collection($products)->resolve($request);
    }

    /** URL of an active category, or null when it is missing or inactive (never link to a 404). */
    protected function categoryHref(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        $this->activePaths ??= Category::query()->public()->pluck('path')->flip()->all();

        return isset($this->activePaths[$path]) ? '/'.$path : null;
    }

    /** @return array{slug: string, name: string, tagline: ?string, scene: ?string, bg: ?string, image: ?string, href: string} */
    protected function sectorCard(SectorPage $sector): array
    {
        return [
            'slug' => $sector->slug,
            'name' => $sector->name,
            'tagline' => $sector->tagline,
            'scene' => $sector->scene_key,
            'bg' => $sector->tile_bg,
            'image' => ImageUrl::path($sector->image),
            'href' => $sector->url(),
        ];
    }

    /**
     * Shop contact details from Réglages, for CTA bands and asides.
     *
     * @return array{phones: list<array{label: string, display: string}>, salesPhone: string, whatsapp: string, hours: string, stores: list<array{name: string, address: string}>, email: string}
     */
    protected function contact(): array
    {
        $settings = app(GeneralSettings::class);

        return [
            'phones' => array_values($settings->phones),
            'salesPhone' => $settings->sales_phone,
            'whatsapp' => $settings->whatsapp_number,
            'hours' => $settings->hours,
            'stores' => array_values($settings->stores),
            'email' => $settings->email,
        ];
    }
}
