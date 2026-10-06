<?php

namespace App\Support\Calculator;

/**
 * Air-conditioner sizing, the single model shared by the calculator page, the home power finder and
 * the article block (decision 4, docs/plan.md). Port of frontend/src/lib/power.ts: keep both in sync
 * (tests/Feature/Api/Home/CalculatorTest.php and src/lib/lib.test.ts check the same cases).
 *
 * need = surface × 600 BTU × ceiling × sun × top floor × room, rounded up to the next tier.
 */
final class PowerCalculator
{
    public const BTU_PER_M2 = 600;

    public const SURFACE_MIN = 8;

    public const SURFACE_MAX = 60;

    public const CEILINGS = ['standard', 'haute'];

    public const SUNS = ['faible', 'normale', 'forte'];

    public const ROOMS = ['chambre', 'salon', 'bureau', 'cuisine-ouverte'];

    /** [btu, label, coverage] (non-breaking spaces inside numbers and before m², as in power.ts) */
    public const TIERS = [
        [9000, "9\u{00A0}000 BTU", "Jusqu’à 15\u{00A0}m²"],
        [12000, "12\u{00A0}000 BTU", "Jusqu’à 20\u{00A0}m²"],
        [18000, "18\u{00A0}000 BTU", "Jusqu’à 30\u{00A0}m²"],
        [24000, "24\u{00A0}000 BTU", "Jusqu’à 40\u{00A0}m²"],
        [30000, "30\u{00A0}000 BTU et plus", "Au-delà de 40\u{00A0}m²"],
    ];

    public static function clampSurface(int|float $value): int
    {
        if (! is_finite((float) $value)) {
            return self::SURFACE_MIN;
        }

        return (int) max(self::SURFACE_MIN, min(self::SURFACE_MAX, round($value)));
    }

    /**
     * @return array{need: float, tierIndex: int, tier: array{btu: int, label: string, coverage: string}, reasons: list<string>, explanation: string}
     */
    public static function compute(int|float $surface, string $ceiling = 'standard', string $sun = 'normale', bool $topFloor = false, string $room = 'salon'): array
    {
        $surface = self::clampSurface($surface);

        // Same multiplication order as power.ts, so both give the same floating-point result.
        $factor = ($ceiling === 'haute' ? 1.2 : 1) * ($sun === 'forte' ? 1.15 : ($sun === 'faible' ? 0.9 : 1))
            * ($topFloor ? 1.15 : 1) * ($room === 'cuisine-ouverte' ? 1.2 : 1);
        $need = $surface * self::BTU_PER_M2 * $factor;

        $tierIndex = 4;
        foreach (array_slice(self::TIERS, 0, 4) as $i => [$btu]) {
            if ($need <= $btu) {
                $tierIndex = $i;
                break;
            }
        }

        $reasons = array_values(array_filter([
            $ceiling === 'haute' ? 'plafond haut' : null,
            $sun === 'forte' ? 'pièce très ensoleillée' : null,
            $topFloor ? 'dernier étage' : null,
            $room === 'cuisine-ouverte' ? 'cuisine ouverte' : null,
            $sun === 'faible' ? 'pièce peu exposée' : null,
        ]));

        $nbsp = "\u{00A0}";
        $rounded = number_format(round($need / 100) * 100, 0, ',', $nbsp);
        $explanation = "Pour {$surface}{$nbsp}m²".($reasons ? ', avec '.implode(', ', $reasons) : '')
            ." : besoin estimé d’environ {$rounded} BTU.";

        [$btu, $label, $coverage] = self::TIERS[$tierIndex];

        return [
            'need' => (float) $need,
            'tierIndex' => $tierIndex,
            'tier' => ['btu' => $btu, 'label' => $label, 'coverage' => $coverage],
            'reasons' => $reasons,
            'explanation' => $explanation,
        ];
    }
}
