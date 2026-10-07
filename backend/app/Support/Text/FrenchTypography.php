<?php

namespace App\Support\Text;

/**
 * French typography for public text: no-break spaces where French requires them, so « 9 000 BTU »,
 * « Prix : » or « 70 % » never wrap badly, and one apostrophe (’) in prose.
 *
 * - U+202F (narrow no-break space) before ; ! ? %  — replaces an existing space only;
 * - U+00A0 (no-break space) before : and », after «, between a number and its unit, and as the
 *   thousands separator (« 18 000 »);
 * - ' between letters → ’.
 *
 * Only spaces already present are changed (nothing is inserted next to punctuation glued to a
 * word), so codes and URLs ("?v=", "https:", "9h", SKUs) are left alone. Phone numbers grouped
 * by two digits ("06 12 34 56 78") are not thousands groups and stay as they are.
 */
class FrenchTypography
{
    public const NBSP = "\u{00A0}";

    public const NNBSP = "\u{202F}";

    private const UNITS = 'BTU|Dhs|DH|m²|m³|m|mm|cm|kg|g|L|l|ml|°C|W|kW|V|Pa|bar';

    public static function apply(string $text): string
    {
        if ($text === '' || ! preg_match('/[ \'«»:;!?%\d]/u', $text)) {
            return $text;
        }

        $text = (string) preg_replace('/ +([;!?%])/u', self::NNBSP.'$1', $text);
        $text = (string) preg_replace('/ +(:)(?=\s|$)/u', self::NBSP.'$1', $text);
        $text = (string) preg_replace('/« +/u', '«'.self::NBSP, $text);
        $text = (string) preg_replace('/ +»/u', self::NBSP.'»', $text);
        // Thousands groups: "18 000", "1 500" (a 3-digit group not followed by another digit).
        $text = (string) preg_replace('/(?<=\d) (?=\d{3}(?!\d))/u', self::NBSP, $text);
        // Number and unit: "9 000 BTU", "15 m²", "11,3 kg", "5 700 Dhs".
        $text = (string) preg_replace('/(?<=\d) (?=(?:'.self::UNITS.')(?![\p{L}\d]))/u', self::NBSP, $text);
        // Apostrophe in words: l'appel → l’appel.
        $text = (string) preg_replace("/(?<=\\p{L})'(?=\\p{L})/u", '’', $text);

        return $text;
    }
}
