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
 * Filters (front-end query names → keys here): marque → brand, puissance → power, dimension → size,
 * techno → tech, fluide → fluid, couleur → colour, prix → price, promo. A family matches a
 * variant-level filter (power, size, colour, price band, promo) when at least one of its variants
 * matches. Only facets that split the listing are returned (see facets()).
 */
class Listing
{
    /** Facets in display order (labels from design/Categorie Climatiseurs muraux.dc.html). */
    public const FACETS = [
        'power' => 'Puissance',
        'size' => 'Dimension',
        'brand' => 'Marque',
        'tech' => 'Technologie',
        'fluid' => 'Fluide',
        'colour' => 'Couleur',
        'price' => 'Prix',
        'promo' => 'En promotion',
    ];

    /**
     * Price bands, centimes (design: "Moins de 4 000 Dhs", "4 000 à 6 000 Dhs", "Plus de 6 000 Dhs").
     * Keys read `moins-X`, `X-Y`, `plus-X` (Dhs), so bands computed for other listings parse alike.
     */
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
            'price' => $p->variants->contains(fn (ProductVariant $v) => collect($values)->contains(fn (string $band) => self::inBand($v->priceFor($reseller), $band))),
            'size' => $p->variants->contains(fn (ProductVariant $v) => in_array(self::sizeOf($v, $p), $values, true)),
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
            default => null,
        };
    }

    /**
     * `moins-4000` → [0, 400000), `4000-6000` → [400000, 600000), `plus-6000` → [600000, ∞), centimes.
     *
     * @return array{0: int, 1: int}|null
     */
    private static function bandRange(string $band): ?array
    {
        return match (true) {
            (bool) preg_match('/^moins-(\d+)$/', $band, $m) => [0, (int) $m[1] * 100],
            (bool) preg_match('/^plus-(\d+)$/', $band, $m) => [(int) $m[1] * 100, PHP_INT_MAX],
            (bool) preg_match('/^(\d+)-(\d+)$/', $band, $m) => [(int) $m[1] * 100, (int) $m[2] * 100],
            default => null,
        };
    }

    private static function inBand(int $price, string $band): bool
    {
        $range = self::bandRange($band);

        return $range !== null && $price >= $range[0] && $price < $range[1];
    }

    /**
     * Size of a variant for the "Dimension" facet: its label ("Ø 125", "300 L"), else the family
     * name ("… Q160 …" → Ø 160, "Diffuseur Carré 450/450" → 450 × 450). Value keys: d160, l300, 450x450.
     */
    public static function sizeOf(ProductVariant $v, Product $p): ?string
    {
        foreach ([(string) $v->label, $p->name] as $text) {
            if (preg_match('/Ø\s?(\d{2,3})\b/u', $text, $m) || preg_match('/\bQ\s?(\d{2,3})\b/u', $text, $m)) {
                return 'd'.$m[1];
            }
            if (preg_match('/\b(\d{3})\/(\d{3})\b/u', $text, $m)) {
                return "{$m[1]}x{$m[2]}";
            }
            if (preg_match('/\b(\d{2,3}) L\b/u', $text, $m)) {
                return 'l'.$m[1];
            }
        }

        return null;
    }

    private static function sizeLabel(string $value): string
    {
        return match (true) {
            str_starts_with($value, 'd') => "Ø\u{00A0}".substr($value, 1),
            str_starts_with($value, 'l') => substr($value, 1)."\u{00A0}L",
            default => str_replace('x', "\u{00A0}×\u{00A0}", $value),
        };
    }

    /** Order for sizes: diameters, then squares, then capacities, each by number. */
    private static function sizeRank(string $value): int
    {
        $group = match (true) {
            str_starts_with($value, 'd') => 0,
            str_starts_with($value, 'l') => 2,
            default => 1,
        };

        return $group * 10000 + (int) preg_replace('/\D.*$/', '', ltrim($value, 'dl'));
    }

    /**
     * Price bands for a listing: the design's bands when they split it, otherwise two or three bands
     * cut at round amounts between the families' prices (copper, ducts, accessories).
     *
     * @param  Collection<int, Product>  $all
     * @return array<string, string> key => label
     */
    private static function priceBands(Collection $all, bool $reseller): array
    {
        $variants = $all->flatMap(fn (Product $p) => $p->variants);
        $present = fn (string $band) => $variants->contains(fn (ProductVariant $v) => self::inBand($v->priceFor($reseller), $band));

        $fixed = collect(self::PRICE_BANDS)->filter(fn ($band, $k) => $present((string) $k))->map(fn ($band) => $band[0])->all();
        if (count($fixed) >= 2) {
            return $fixed;
        }

        // Each family's lowest price, whole Dhs.
        $prices = $all->map(fn (Product $p) => intdiv((int) $p->variants->map(fn (ProductVariant $v) => $v->priceFor($reseller))->min(), 100))
            ->sort()->values();
        if ($prices->unique()->count() < 2) {
            return [];
        }
        $cuts = $prices->unique()->count() >= 4 ? [1 / 3, 2 / 3] : [1 / 2];
        $edges = collect($cuts)
            ->map(fn (float $q) => self::roundAmount((int) $prices[(int) floor($q * ($prices->count() - 1))] + 1))
            ->unique()->filter(fn (int $e) => $e > $prices->first() && $e <= $prices->last())->values()->all();
        if ($edges === []) {
            return [];
        }

        $bands = ['moins-'.$edges[0] => 'Moins de '.self::dhs($edges[0])];
        for ($i = 1; $i < count($edges); $i++) {
            $bands[$edges[$i - 1].'-'.$edges[$i]] = self::amount($edges[$i - 1]).' à '.self::dhs($edges[$i]);
        }
        $last = $edges[count($edges) - 1];
        $bands['plus-'.$last] = 'Plus de '.self::dhs($last);

        return collect($bands)->filter(fn ($label, $k) => $present((string) $k))->all();
    }

    /** Rounds up to 1, 2 or 5 × 10^n (e.g. 260 → 500, 1130 → 2000, 85 → 100). */
    private static function roundAmount(int $dhs): int
    {
        $magnitude = 10 ** max(0, (int) floor(log10(max(1, $dhs))));
        foreach ([1, 2, 5] as $step) {
            if ($dhs <= $step * $magnitude) {
                return $step * $magnitude;
            }
        }

        return 10 * $magnitude;
    }

    private static function amount(int $dhs): string
    {
        return number_format($dhs, 0, ',', "\u{00A0}");
    }

    private static function dhs(int $dhs): string
    {
        return self::amount($dhs).' Dhs';
    }

    /**
     * Facets present in the unfiltered set, with disjunctive counts (each facet counted with the
     * other facets applied). A facet is returned only when it splits the listing (one of its values
     * leaves at least one family out) or one of its values is selected: a single brand or power
     * covering every product is not a filter.
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
            $splits = collect(array_keys($available))
                ->contains(fn ($value) => $all->filter(fn (Product $p) => self::matches($p, $key, [(string) $value], $reseller))->count() < $all->count());
            if ($available === [] || (! $splits && ($filters[$key] ?? []) === [])) {
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
            'size' => $all->flatMap(fn (Product $p) => $p->variants->map(fn (ProductVariant $v) => self::sizeOf($v, $p)))
                ->filter()->unique()->sortBy(fn (string $s) => self::sizeRank($s))
                ->mapWithKeys(fn (string $s) => [$s => self::sizeLabel($s)])->all(),
            'brand' => $all->pluck('brand')->filter()->unique('id')->sortBy('position')
                ->mapWithKeys(fn ($b) => [$b->slug => $b->name])->all(),
            'tech' => $all->pluck('technology')->filter()->unique()
                ->sortBy(fn ($t) => $t === 'Inverter' ? 0 : 1)->mapWithKeys(fn ($t) => [$t => $t])->all(),
            'fluid' => $all->pluck('refrigerant')->filter()->unique()->sort()->mapWithKeys(fn ($f) => [$f => $f])->all(),
            'colour' => $variants->pluck('colour')->filter()->unique()
                ->sortBy(fn ($c) => $c === 'Blanc' ? 0 : 1)->mapWithKeys(fn ($c) => [$c => $c])->all(),
            'price' => self::priceBands($all, $reseller),
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
            'price' => self::PRICE_BANDS[$value][0] ?? self::bandLabel($value),
            'size' => self::sizeLabel($value),
            'promo' => 'Oui',
            default => $value,
        };
    }

    /** Label of a computed band key, for a selected band this listing no longer offers. */
    private static function bandLabel(string $band): string
    {
        $range = self::bandRange($band);

        return match (true) {
            $range === null => $band,
            $range[0] === 0 => 'Moins de '.self::dhs(intdiv($range[1], 100)),
            $range[1] === PHP_INT_MAX => 'Plus de '.self::dhs(intdiv($range[0], 100)),
            default => self::amount(intdiv($range[0], 100)).' à '.self::dhs(intdiv($range[1], 100)),
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
        // Lowest real price; families « Prix sur demande » only (price 0) go last in both orders.
        $price = fn (Product $p) => $p->variants->reject(fn (ProductVariant $v) => $v->isOnRequest())
            ->map(fn (ProductVariant $v) => $v->priceFor($reseller))->min();

        return match ($sort) {
            'price_asc' => $families->sortBy(fn (Product $p) => [$price($p) === null ? 1 : 0, $price($p) ?? 0])->values(),
            'price_desc' => $families->sortBy(fn (Product $p) => [$price($p) === null ? 1 : 0, -($price($p) ?? 0)])->values(),
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
