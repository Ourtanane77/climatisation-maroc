<?php

namespace App\Http\Controllers\Api\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Support\Blog\ArticlePresenter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET /blog?category=&page=: the blog index (featured guide + grid) or one category's listing.
 * Unpublished articles never appear, and categories without a published article are not listed
 * (their page answers 404).
 */
class BlogController extends Controller
{
    private const PER_PAGE = 12;

    public function __invoke(Request $request): JsonResponse
    {
        $slug = $request->query('category');
        $categories = ArticleCategory::query()
            ->whereHas('articles', fn (Builder $q) => $q->where('is_published', true))
            ->withCount(['articles' => fn (Builder $q) => $q->where('is_published', true)])
            ->orderBy('position')->get();

        $category = null;
        if (is_string($slug) && $slug !== '') {
            $category = $categories->firstWhere('slug', $slug);
            if (! $category) {
                return response()->json(['message' => 'Catégorie introuvable.'], 404);
            }
        }

        $query = Article::query()->published()->with('category')
            ->when($category, fn (Builder $q) => $q->where('article_category_id', $category?->id))
            ->orderBy('position')->orderByDesc('published_at');

        // The index features the first guide above the grid (design: "puissance").
        $featured = null;
        if (! $category) {
            $featured = (clone $query)->first();
            if ($featured) {
                $query->whereKeyNot($featured->id);
            }
        }

        $page = $query->paginate(self::PER_PAGE)->withQueryString();

        return response()->json([
            'categories' => $categories->map(fn (ArticleCategory $c) => ArticlePresenter::category($c) + ['count' => $c->articles_count])->values(),
            'category' => $category ? ArticlePresenter::category($category) + ['count' => $category->articles_count] : null,
            'featured' => $featured && $page->currentPage() === 1 ? ArticlePresenter::card($featured) : null,
            'data' => collect($page->items())->map(fn (Article $a) => ArticlePresenter::card($a))->values(),
            'meta' => ['page' => $page->currentPage(), 'lastPage' => $page->lastPage(), 'total' => $page->total() + ($featured ? 1 : 0)],
        ]);
    }
}
