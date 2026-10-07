<?php

namespace App\Support\Catalog;

use App\Models\Brand;

/**
 * Old-site product names are upper case without accents ("KIT DUO 5/8_3/8 20M"). This writes them
 * in the catalogue's style ("Kit Duo 5/8-3/8 20 m"): words capitalised, brands and refrigerants as
 * written by the makers, units in lower case, missing accents restored for a short list of words.
 */
class LegacyNames
{
    /** Words written with their accents (old site names are upper case without them). */
    private const WORDS = [
        'carre' => 'Carré', 'galvaniser' => 'Galvanisé', 'galvanise' => 'Galvanisé', 'tactille' => 'Tactile',
        'isole' => 'Isolé', 'isolé' => 'Isolé', 'calorifuge' => 'Calorifugé', 'telecommande' => 'Télécommande',
        'electrique' => 'Électrique', 'thermique' => 'Thermique',
    ];

    /** Kept upper case. */
    private const UPPER = ['lg', 'gs', 'ciat', 'btu', 'pvc', 'r32', 'r410', 'r410a', 'r407', 'r404', 'r134', 'r22', 'rs70'];

    /** Small words kept lower case inside a name. */
    private const LOWER = ['de', 'du', 'des', 'en', 'et', 'à', 'a', 'pour', 'avec'];

    public static function normalize(string $raw): string
    {
        $name = html_entity_decode($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $name = preg_replace('/\s+-\s+/u', ' ', $name);                       // "CUIVRE 1/4 - LAFARGA"
        $name = preg_replace('#(\d/\d)_(\d/\d)#u', '$1-$2', (string) $name);   // "5/8_3/8"
        $name = preg_replace('/\bQ\s+(\d{2,3})\b/iu', 'Q$1', (string) $name);  // "Q 125"
        $name = preg_replace_callback('/\b(\d{1,2})\s?000\s?(BTU|Btu)(\/h)?\b/u', fn ($m) => "{$m[1]} 000 BTU", (string) $name);
        $name = preg_replace_callback('/(\d+)[.,](\d+)\s?KG\b/iu', fn ($m) => rtrim(rtrim($m[1].','.$m[2], '0'), ',').' kg', (string) $name);
        $name = preg_replace('/(\d)\s?(KG)\b/iu', '$1 kg', (string) $name);
        $name = preg_replace_callback('/(\d+)\.(\d+)\s?M2\b/iu', fn ($m) => "{$m[1]},{$m[2]} m²", (string) $name);
        $name = preg_replace('/(\d+)\.(\d+)\s?M\b/u', '$1,$2 m', (string) $name);
        $name = preg_replace('/(\d)\s?M\b/u', '$1 m', (string) $name);         // "15M", "3m"
        $name = preg_replace('/(\d)\s?m\b/u', '$1 m', (string) $name);

        $words = preg_split('/\s+/u', trim((string) $name)) ?: [];
        foreach ($words as $i => $word) {
            $lower = mb_strtolower($word);
            $words[$i] = match (true) {
                isset(self::WORDS[$lower]) => self::WORDS[$lower],
                in_array($lower, self::UPPER, true) => mb_strtoupper($word),
                in_array($lower, ['m', 'kg', 'm²'], true) => $lower,
                $i > 0 && in_array($lower, self::LOWER, true) => $lower,
                (bool) preg_match('/^q\d/u', $lower) => 'Q'.mb_substr($word, 1),
                (bool) preg_match('/\d/u', $word) => mb_strtoupper($word),
                default => mb_convert_case($lower, MB_CASE_TITLE, 'UTF-8'),
            };
        }

        return self::clean(implode(' ', $words));
    }

    /**
     * Old-site wording fixed the same way as data/catalog.json (content audit, 2026-10-07):
     * non-inverter units are « On/Off R410A », full refrigerant names, no « Spain », × for sizes.
     */
    public static function clean(string $name): string
    {
        $rules = [
            '/\bNormal (?:ON\/OFF|On\/Off) (?:R?410A?)\b/u' => 'On/Off R410A',
            '/\bNormal R410\b/u' => 'On/Off R410A',
            '/^(Fitco Gainable) R410A? (\d+ 000 BTU) On(?:-|\/)Off$/u' => '$1 On/Off R410A $2',
            '/\bR410\b(?!A)/u' => 'R410A',
            '/\bR404\b(?!A)/u' => 'R404A',
            '/\bR134\b(?!a)/u' => 'R134a',
            '/^Gaz GS (R134a)/u' => 'Gaz $1 GS',
            '/ Spain\b/u' => '',
            '/(\d)X(\d)/u' => '$1×$2',
            '/°c\b/u' => '°C',
            '/\bx50 PCS\b/iu' => '(lot de 50)',
            '/^Venteuse (Q\d+) Galvanisé$/u' => 'Ventouse $1 Galvanisée',
            '/^Venteuse\b/u' => 'Ventouse',
            '/\bCarrer\b/u' => 'Carré',
            '/\bMotorise\b/u' => 'Motorisé',
        ];

        return trim((string) preg_replace(array_keys($rules), array_values($rules), $name));
    }

    /** Brand named in the product name, else the old page's logo when that category's logos are reliable. */
    public static function brand(string $name, ?string $logoBrand, bool $logoTrusted): ?string
    {
        foreach (Brand::query()->get(['slug', 'name']) as $brand) {
            if (preg_match('/\b'.preg_quote($brand->name, '/').'\b/iu', $name)) {
                return $brand->slug;
            }
        }
        if ($logoTrusted && $logoBrand) {
            return Brand::query()->whereRaw('LOWER(name) = ?', [mb_strtolower($logoBrand)])->value('slug');
        }

        return null;
    }

    public static function btu(string $name): ?int
    {
        return preg_match('/\b(\d{1,2}) 000 BTU\b/u', $name, $m) ? (int) $m[1] * 1000 : null;
    }
}
