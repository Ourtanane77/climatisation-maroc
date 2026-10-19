<?php

namespace App\Support\Sites;

/**
 * WhatsApp numbers of Réglages (home hero list, floating button): international format without "+",
 * digits only, 10 to 15 of them (e.g. 212666854184). Checked when the back office saves the fields
 * and again before the API outputs them: an invalid number is left out.
 */
final class WhatsAppNumbers
{
    public const PATTERN = '/^\d{10,15}$/';

    public static function isValid(?string $number): bool
    {
        return $number !== null && preg_match(self::PATTERN, $number) === 1;
    }

    /** The number when valid (spaces trimmed), null otherwise. */
    public static function sanitize(?string $number): ?string
    {
        $number = $number === null ? null : trim($number);

        return self::isValid($number) ? $number : null;
    }

    /**
     * Valid entries of the hero list, in order, without duplicates; an empty label becomes null.
     *
     * @param  array<int|string, mixed>  $entries
     * @return list<array{number: string, label: string|null}>
     */
    public static function list(array $entries): array
    {
        $numbers = [];
        foreach ($entries as $entry) {
            $entry = (array) $entry; // the settings payload may be decoded as objects
            $number = self::sanitize(is_scalar($entry['number'] ?? null) ? (string) $entry['number'] : null);
            if ($number === null || isset($numbers[$number])) {
                continue;
            }
            $label = is_scalar($entry['label'] ?? null) ? trim((string) $entry['label']) : '';
            $numbers[$number] = ['number' => $number, 'label' => $label === '' ? null : $label];
        }

        return array_values($numbers);
    }
}
