<?php

namespace App\Support\Catalog;

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\Api\Audience;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Product families for the listing pages (category, promotions, search), with filters and
 * disjunctive facet counts computed in memory. A category holds at most a few dozen families, so
 * this stays cheap and keeps every rule in one readable place.
 *
 * Filters (front-end query names → keys here): marque → brand, puissance → power, techno → tech,
 * fluide → fluid, couleur → colour, prix → price, promo. A family matches a variant-level filter
 * (power, colour, price band, promo) when at least one of its variants matches.
 */
class Listing
{
    /** Facets in display order (labels from design/Categorie Climatiseurs muraux.dc.html). */
    public const FACETS = [
        'power' => 'Puissance',
        'brand' => 'Marque',
        'tech' => 'Technologie',
        'fluid' => 'Fluide',
        'colour' => 'Couleur',
        'price' => 'Prix',
        'promo' => 'En promotion',
    ];

    /** Price bands, centimes (design: "Moins de 4 000 Dhs", "4 000 à 6 000 Dhs", "Plus de 6 000 Dhs"). */
    public const PRICE_BANDS = [
        'moins-4000' => ['Moins de 4 000 Dhs', 0, 400000],
        '4000-6000' => ['4 000 à 6 000 Dhs', 400000, 600000],
        'plus-6000' => ['Plus de 6 000 Dhs', 600000, PHP_INT_MAX],
    ];

    public const SORTS = ['price_asc', 'price_desc', 'name', 'relevance'];

    /**
     * Published families with what cards and filters need.
     *
     * @param  list<int>|null  $categoryIds
     * @return Builder<Product>
     */
    public static function query(?array $categoryIds = null): Builder
    {
        return Product::query()
            ->published()
            ->when($categoryIds !== null, fn (Builder $q) => $q->whereIn('category_id', $categoryIds))
            ->whereHas('variants')
            ->with(['variants', 'images', 'brand', 'category'])
            ->orderBy('position')
            ->orderBy('id');
    }

    /**
     * @param  Collection<int, Product>  $families
     * @param  array<string, list<string>>  $filters
     * @return Collection<int, Product>
     */
    public static function filter(Collection $families, array $filters, ?string $except = null): Collection
    {
        $reseller = Audience::isReseller();

        return $families->filter(function (Product $p) use ($filters, $except, $reseller) {
            foreach ($filters as $key => $values) {
                if ($key === $except || $values === []) {
                    continue;
                }
                if (! self::matches($p, $key, $values, $reseller)) {
                    return false;
                }
            }

            return true;
        })->values();
    }

    /** @param list<string> $values */
    private static function matches(Product $p, string $key, array $values, bool $reseller): bool
    {
        return match ($key) {
            'brand' => in_array((string) $p->brand?->slug, $values, true),
            'tech' => in_array((string) $p->technology, $values, true),
            'fluid' => in_array((string) $p->refrigerant, $values, true),
            default => $p->variants->contains(fn (ProductVariant $v) => in_array(self::variantValue($v, $key, $reseller), $values, true)),
        };
    }

    /** The facet value a variant carries for a variant-level facet. */
    private static function variantValue(ProductVariant $v, string $key, bool $reseller): ?string
    {
        return match ($key) {
            'power' => $v->power_btu ? (string) $v->power_btu : null,
            'colour' => $v->colour,
            'promo' => $v->isDiscounted() ? '1' : null,
            'price' => self::band($v->priceFor($reseller)),
            default => null,
        };
    }

    private static function band(int $price): ?string
    {
        foreach (self::PRICE_BANDS as $key => [, $min, $max]) {
            if ($price >= $min && $price < $max) {
                return $key;
            }
        }

        return null;
    }

    /**
     * Facets present in the unfiltered set, with disjunctive counts (each facet counted with the
     * other facets applied). Empty facets are dropped; the price facet needs two bands to be useful.
     *
     * @param  Collection<int, Product>  $all
     * @param  array<string, list<string>>  $filters
     * @return list<array{key: string, label: string, values: list<array{value: string, label: string, count: int|null, selected: bool}>}>
     */
    public static function facets(Collection $all, array $filters): array
    {
        $reseller = Audience::isReseller();
        $facets = [];
        foreach (self::FACETS as $key => $label) {
            $available = self::valuesOf($all, $key, $reseller);
            // A selected value absent from this listing (e.g. a brand from another range) stays
            // visible with a zero count, so it can be removed (design: `?empty=1`, "Simsek 0").
            foreach ($filters[$key] ?? [] as $selected) {
                if (! array_key_exists($selected, $available)) {
                    $available[$selected] = self::labelFor($key, $selected);
                }
            }
            if ($available === [] || ($key === 'price' && count($available) < 2)) {
                continue;
            }
            $scope = self::filter($all, $filters, $key);
            $values = [];
            foreach ($available as $value => $valueLabel) {
                $values[] = [
                    'value' => (string) $value,
                    'label' => $valueLabel,
                    'count' => $scope->filter(fn (Product $p) => self::matches($p, $key, [(string) $value], $reseller))->count(),
                    'selected' => in_array((string) $value, $filters[$key] ?? [], true),
                ];
            }
            $facets[] = ['key' => $key, 'label' => $label, 'values' => $values];
        }

        return $facets;
    }

    /**
     * @param  Collection<int, Product>  $all
     * @return array<string, string> value => label, in display order
     */
    private static function valuesOf(Collection $all, string $key, bool $reseller): array
    {
        $variants = $all->flatMap(fn (Product $p) => $p->variants);

        $values = match ($key) {
            'power' => $variants->pluck('power_btu')->filter()->unique()->sort()
                ->mapWithKeys(fn ($btu) => [(string) $btu => self::powerLabel((int) $btu)])->all(),
            'brand' => $all->pluck('brand')->filter()->unique('id')->sortBy('position')
                ->mapWithKeys(fn ($b) => [$b->slug => $b->name])->all(),
            'tech' => $all->pluck('technology')->filter()->unique()
                ->sortBy(fn ($t) => $t === 'Inverter' ? 0 : 1)->mapWithKeys(fn ($t) => [$t => $t])->all(),
            'fluid' => $all->pluck('refrigerant')->filter()->unique()->sort()->mapWithKeys(fn ($f) => [$f => $f])->all(),
            'colour' => $variants->pluck('colour')->filter()->unique()
                ->sortBy(fn ($c) => $c === 'Blanc' ? 0 : 1)->mapWithKeys(fn ($c) => [$c => $c])->all(),
            'price' => collect(self::PRICE_BANDS)
                ->filter(fn ($band, $k) => $variants->contains(fn (ProductVariant $v) => self::band($v->priceFor($reseller)) === $k))
                ->map(fn ($band) => $band[0])->all(),
            'promo' => $variants->contains(fn (ProductVariant $v) => $v->isDiscounted()) ? ['1' => 'Oui'] : [],
            default => [],
        };

        return $values;
    }

    private static function labelFor(string $key, string $value): string
    {
        return match ($key) {
            'brand' => Brand::query()->where('slug', $value)->value('name') ?? $value,
            'power' => ctype_digit($value) ? self::powerLabel((int) $value) : $value,
            'price' => self::PRICE_BANDS[$value][0] ?? $value,
            'promo' => 'Oui',
            default => $value,
        };
    }

    /** 12000 → "12 000 BTU" (non-breaking space as in the design). */
    public static function powerLabel(int $btu): string
    {
        return number_format($btu, 0, ',', "\u{00A0}")."\u{00A0}BTU";
    }

    /**
     * @param  Collection<int, Product>  $families
     * @return Collection<int, Product>
     */
    public static function sort(Collection $families, string $sort): Collection
    {
        $reseller = Audience::isReseller();
        $price = fn (Product $p) => $p->variants->map(fn (ProductVariant $v) => $v->priceFor($reseller))->min();

        return match ($sort) {
            'price_asc' => $families->sortBy($price)->values(),
            'price_desc' => $families->sortByDesc($price)->values(),
            'name' => $families->sortBy(fn (Product $p) => mb_strtolower($p->name))->values(),
            default => $families->values(),
        };
    }

    /**
     * Filter values from the request: `?brand[]=lg&brand[]=carrier` or `?brand=lg,carrier`.
     *
     * @param  array<string, mixed>  $query
     * @return array<string, list<string>>
     */
    public static function filtersFrom(array $query): array
    {
        $filters = [];
        foreach (array_keys(self::FACETS) as $key) {
            $raw = $query[$key] ?? [];
            $values = is_array($raw) ? $raw : explode(',', (string) $raw);
            $filters[$key] = array_values(array_filter(array_map(fn ($v) => trim((string) $v), $values), fn ($v) => $v !== ''));
        }

        return $filters;
    }
}
