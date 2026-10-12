<?php

namespace App\Http\Controllers\Api\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Support\Api\SeoData;
use App\Support\Blog\ArticlePresenter;
use App\Support\Catalog\SiteCatalog;
use Illuminate\Http\JsonResponse;

/**
 * GET /blog/{slug}: a published article with its blocks, table of contents, SEO and
 * "À lire aussi" (other published articles of the same category).
 */
class ArticleController extends Controller
{
    private const RELATED = 3;

    public function __invoke(string $slug): JsonResponse
    {
        $article = Article::query()->where(SiteCatalog::published(...))->where('slug', $slug)->with(['category', 'seo'])->first();
        if (! $article) {
            return response()->json(['message' => 'Article introuvable.'], 404);
        }

        $blocks = ArticlePresenter::blocks($article);
        $related = Article::query()->where(SiteCatalog::published(...))->with('category')
            ->where('article_category_id', $article->article_category_id)
            ->whereKeyNot($article->id)
            ->orderBy('position')->limit(self::RELATED)->get();

        return response()->json([
            'article' => ArticlePresenter::card($article) + [
                'h1' => SeoData::h1($article) ?: $article->title,
                'author' => $article->author,
                'publishedAt' => $article->published_at?->toIso8601String(),
                'updatedAt' => $article->updated_at?->toIso8601String(),
                'blocks' => $blocks,
                'toc' => ArticlePresenter::toc($blocks),
            ],
            'seo' => [
                'title' => SeoData::title($article) ?: $article->title,
                'description' => SeoData::description($article) ?: $article->excerpt,
                'canonical' => SeoData::canonical($article),
                'noindex' => SeoData::noindex($article),
            ],
            'related' => $related->map(fn (Article $a) => ArticlePresenter::card($a))->values(),
        ]);
    }
}
