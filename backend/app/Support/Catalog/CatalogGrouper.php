<?php

namespace App\Support\Catalog;

/**
 * Groups catalogue rows (one per SKU) into product families with variants, using the rules in
 * config/catalog.php ("LG Dual Inverter 12 000 BTU" → family "LG Dual Inverter", variant "12 000 BTU").
 * Pure: no database access, so the grouping can be tested and reported before seeding.
 */
class CatalogGrouper
{
    /** @param array<string, mixed> $config config('catalog') */
    public function __construct(private array $config) {}

    /**
     * @param  list<array<string, mixed>>  $rows
     * @return list<array{name: string, brand: string|null, category_path: string, rows: list<array<string, mixed>>, labels: list<string|null>, colours: list<string|null>}>
     */
    public function group(array $rows): array
    {
        $families = [];
        foreach ($rows as $row) {
            $categoryPath = $this->categoryPath($row);
            [$name, $label, $colour] = $this->split((string) $row['name'], $categoryPath);
            $key = mb_strtolower($name).'|'.($row['brand_slug'] ?? '');
            $families[$key] ??= ['name' => $name, 'brand' => $row['brand_slug'] ?? null, 'category_path' => $categoryPath, 'rows' => [], 'labels' => [], 'colours' => []];
            $families[$key]['rows'][] = $row;
            $families[$key]['labels'][] = $label;
            $families[$key]['colours'][] = $colour;
        }

        return array_map($this->sortVariants(...), array_values($families));
    }

    /**
     * Orders a family's variants by power, then colour (Blanc before Noir), then the number in
     * the label (capacity, diameter): the selector reads 9 000 / 12 000 / 18 000 / 24 000.
     *
     * @param  array{name: string, brand: string|null, category_path: string, rows: list<array<string, mixed>>, labels: list<string|null>, colours: list<string|null>}  $family
     * @return array{name: string, brand: string|null, category_path: string, rows: list<array<string, mixed>>, labels: list<string|null>, colours: list<string|null>}
     */
    private function sortVariants(array $family): array
    {
        $order = array_keys($family['rows']);
        usort($order, function (int $a, int $b) use ($family) {
            $key = fn (int $i) => [
                (int) ($family['rows'][$i]['btu'] ?? 0),
                ['Blanc' => 0, 'Noir' => 1][$family['colours'][$i] ?? ''] ?? 2,
                preg_match('/\d+/', (string) $family['labels'][$i], $m) ? (int) $m[0] : 0,
            ];

            return $key($a) <=> $key($b);
        });

        foreach (['rows', 'labels', 'colours'] as $field) {
            $family[$field] = array_map(fn (int $i) => $family[$field][$i], $order);
        }

        return $family;
    }

    /**
     * New category path for a row: mapped old category, then name rules within the range.
     *
     * @param  array<string, mixed>  $row
     */
    public function categoryPath(array $row): string
    {
        $path = $this->config['category_map'][$row['category_slug']] ?? $row['category_slug'];
        foreach ($this->config['subcategory_rules'][$path] ?? [] as $pattern => $target) {
            if (preg_match($pattern, (string) $row['name'])) {
                return $target;
            }
        }

        return $path;
    }

    /**
     * Splits a row name into [family name, variant label, colour].
     *
     * @return array{0: string, 1: string|null, 2: string|null}
     */
    public function split(string $name, string $categoryPath): array
    {
        $g = $this->config['grouping'];
        $parts = [];
        $colour = null;

        if (preg_match($g['power_pattern'], $name, $m)) {
            $parts[] = $m[1]."\u{00A0}000 BTU";
            $name = str_replace($m[0], '', $name);
        }

        $colourable = in_array($categoryPath, $g['colour_categories'], true)
            && ! $this->matchesAny($g['colour_exceptions'], $name);
        if ($colourable && preg_match('/\s(Blanc|Noir)\b/u', $name, $m)) {
            $colour = $m[1];
            $parts[] = $m[1];
            $name = str_replace($m[0], '', $name);
        }

        if (preg_match($g['capacity_pattern'], $name, $m)) {
            $parts[] = $m[1].' L';
            $name = str_replace($m[0], '', $name);
        }

        if ($this->matchesAny($g['diameter_families'], $name) && preg_match($g['diameter_pattern'], $name, $m)) {
            $parts[] = 'Ø '.$m[1];
            $name = str_replace($m[0], '', $name);
            foreach ($g['strip_after_diameter'] as $strip) {
                $name = (string) preg_replace($strip, '', $name);
            }
        }

        $name = trim((string) preg_replace('/\s+/u', ' ', $name));

        return [$name, $parts ? implode(' · ', $parts) : null, $colour];
    }

    /** @param list<string> $patterns */
    private function matchesAny(array $patterns, string $subject): bool
    {
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $subject)) {
                return true;
            }
        }

        return false;
    }
}
