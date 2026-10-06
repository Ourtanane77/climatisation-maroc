<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;

/** City list for the checkout and form selects ("Autre ville" last). */
class CityController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $cities = City::query()->orderBy('is_other')->orderBy('position')->get();

        return response()->json(['data' => $cities->map(fn (City $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'slug' => $c->slug,
            'isOther' => (bool) $c->is_other,
        ])->values()]);
    }
}
