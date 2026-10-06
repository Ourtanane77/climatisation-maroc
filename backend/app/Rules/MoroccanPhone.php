<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Moroccan phone number, as in the design forms: digits only (spaces, dots, dashes ignored),
 * 10 digits starting 05, 06 or 07. Mirrors frontend/src/lib/phone.ts.
 */
class MoroccanPhone implements ValidationRule
{
    public function __construct(private string $message = 'Numéro incomplet : saisissez 10 chiffres, par exemple 06 12 34 56 78.') {}

    public static function normalize(?string $input): string
    {
        $digits = (string) preg_replace('/\D/', '', (string) $input);
        if (str_starts_with($digits, '00212')) {
            $digits = '0'.substr($digits, 5);
        } elseif (str_starts_with($digits, '212') && strlen($digits) === 12) {
            $digits = '0'.substr($digits, 3);
        }

        return $digits;
    }

    /** "0612345678" → "06 12 34 56 78". */
    public static function format(?string $input): string
    {
        $digits = self::normalize($input);

        return strlen($digits) === 10 ? implode(' ', str_split($digits, 2)) : (string) $input;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match('/^0[5-7]\d{8}$/', self::normalize($value))) {
            $fail($this->message);
        }
    }
}
