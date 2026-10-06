<?php

namespace App\Http\Controllers\Api\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Support\Blog\ArticlePresenter;
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
        $article = Article::query()->published()->where('slug', $slug)->with(['category', 'seo'])->first();
        if (! $article) {
            return response()->json(['message' => 'Article introuvable.'], 404);
        }

        $blocks = ArticlePresenter::blocks($article);
        $related = Article::query()->published()->with('category')
            ->where('article_category_id', $article->article_category_id)
            ->whereKeyNot($article->id)
            ->orderBy('position')->limit(self::RELATED)->get();

        return response()->json([
            'article' => ArticlePresenter::card($article) + [
                'h1' => $article->seo?->h1 ?: $article->title,
                'author' => $article->author,
                'publishedAt' => $article->published_at?->toIso8601String(),
                'updatedAt' => $article->updated_at?->toIso8601String(),
                'blocks' => $blocks,
                'toc' => ArticlePresenter::toc($blocks),
            ],
            'seo' => [
                'title' => $article->seo?->title ?: $article->title,
                'description' => $article->seo?->description ?: $article->excerpt,
                'canonical' => $article->seo?->canonical,
                'noindex' => (bool) $article->seo?->noindex,
            ],
            'related' => $related->map(fn (Article $a) => ArticlePresenter::card($a))->values(),
        ]);
    }
}
