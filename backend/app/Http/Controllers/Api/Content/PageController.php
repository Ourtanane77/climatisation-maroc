<?php

namespace App\Http\Controllers\Api\Content;

use App\Enums\PageKind;
use App\Http\Controllers\Api\Content\Concerns\PresentsContent;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Page;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;

/**
 * Static pages: À propos, Livraison et paiement, legal pages (design: A propos, Livraison et
 * paiement, CGV). Unpublished pages are 404 and never listed in "Autres pages légales".
 */
class PageController extends Controller
{
    use PresentsContent;

    public function show(string $slug): JsonResponse
    {
        $page = Page::query()->published()->where('slug', $slug)->with(['seo', 'faqItems'])->firstOrFail();

        $data = [
            'slug' => $page->slug,
            'title' => $page->title,
            'kind' => $page->kind->value,
            'href' => $page->url(),
            'intro' => $page->intro,
            'body' => array_values($page->body ?? []),
            'updatedLabel' => $page->updated_label,
            'faq' => $this->faq($page),
            'seo' => $this->seo($page, $page->title),
            'contact' => $this->contact(),
        ];

        if ($page->kind === PageKind::Legal) {
            $data['legalPages'] = $this->otherLegalPages($page);
        }

        if ($page->kind === PageKind::About) {
            $data['brands'] = Brand::query()->active()->whereNotNull('logo')->orderBy('position')->get()
                ->map(fn (Brand $b) => [
                    'name' => $b->name,
                    'href' => $b->url(),
                    'logo' => ImageUrl::logo($b->logo),
                    'aspect' => $b->logo_aspect ? (float) $b->logo_aspect : null,
                    'official' => (bool) $b->is_official_distributor,
                ])->values();
        }

        return response()->json($data);
    }

    /**
     * The other published legal pages. As drawn: on the CGV, the others in order; elsewhere the
     * non-CGV pages first and the CGV last.
     *
     * @return list<array{title: string, href: string}>
     */
    private function otherLegalPages(Page $current): array
    {
        return Page::query()->published()->where('kind', PageKind::Legal)->whereKeyNot($current->id)
            ->orderBy('position')->get()
            ->sortBy(fn (Page $p) => $p->slug === 'cgv' ? PHP_INT_MAX : $p->position)
            ->map(fn (Page $p) => ['title' => $p->title, 'href' => $p->url()])
            ->values()->all();
    }
}
