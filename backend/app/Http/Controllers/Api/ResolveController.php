<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CityPage;
use App\Models\Page;
use App\Models\Redirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * What a free-form path is, for the Next.js catch-all routes (docs/plan.md §2, routing mechanics):
 * a category, a published static page, a published city page, a redirect, or nothing (404).
 */
class ResolveController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $path = Redirect::normalize((string) $request->query('path', '/'));
        $trimmed = ltrim($path, '/');

        $category = Category::query()->active()->where('path', $trimmed)->first();
        if ($category) {
            return response()->json([
                'type' => 'category',
                'path' => $category->path,
                'template' => $category->template->value,
                'isRoot' => $category->parent_id === null,
            ]);
        }

        if (! str_contains($trimmed, '/')) {
            $page = Page::query()->published()->where('slug', $trimmed)->first();
            if ($page) {
                return response()->json(['type' => 'page', 'slug' => $page->slug, 'kind' => $page->kind->value]);
            }

            $city = str_starts_with($trimmed, 'climatisation-')
                ? CityPage::query()->published()->where('slug', substr($trimmed, strlen('climatisation-')))->first()
                : null;
            if ($city) {
                return response()->json(['type' => 'city', 'slug' => $city->slug]);
            }
        }

        $redirect = Redirect::query()->where('from_path', $path)->first();
        if ($redirect) {
            $redirect->increment('hits', 1, ['last_hit_at' => now()]);

            return response()->json(['type' => 'redirect', 'to' => $redirect->to_path, 'status' => (int) $redirect->status_code]);
        }

        return response()->json(['type' => 'none'], 404);
    }
}
