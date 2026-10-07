<?php

namespace App\Http\Controllers\Api\Content;

use App\Http\Controllers\Api\Content\Concerns\PresentsContent;
use App\Http\Controllers\Controller;
use App\Models\SectorPage;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Solutions professionnelles: the sector hub and the sector pages (design/Restaurants.dc.html). */
class SectorController extends Controller
{
    use PresentsContent;

    public function index(): JsonResponse
    {
        $sectors = SectorPage::query()->published()->orderBy('position')->get();

        return response()->json([
            'data' => $sectors->map(fn (SectorPage $s) => $this->sectorCard($s))->values(),
            'contact' => $this->contact(),
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $sector = SectorPage::query()->published()->where('slug', $slug)->with(['seo', 'faqItems'])->firstOrFail();
        $others = SectorPage::query()->published()->whereKeyNot($sector->id)->orderBy('position')->limit(4)->get();

        return response()->json([
            ...$this->sectorCard($sector),
            'heroText' => $sector->hero_text,
            'intro' => $sector->intro,
            'problems' => $this->rows($sector->problems),
            'solutions' => collect($this->rows($sector->solutions))->map(fn (array $s) => [
                'title' => $s['title'] ?? '',
                'text' => $s['text'] ?? null,
                'art' => $s['art'] ?? null,
                'image' => ImageUrl::path($s['image'] ?? null),
                'bg' => $s['bg'] ?? null,
                'cta' => $s['cta'] ?? null,
                'href' => $this->categoryHref($s['category_path'] ?? null),
            ])->values(),
            'products' => $this->productCards($sector->products(), $request),
            'rangeTiles' => collect($this->rows($sector->range_tiles))->map(fn (array $t) => [
                'title' => $t['title'] ?? '',
                'text' => $t['text'] ?? null,
                'cta' => $t['cta'] ?? null,
                'bg' => $t['bg'] ?? null,
                'art' => $t['art'] ?? null,
                'image' => ImageUrl::path($t['image'] ?? null),
                'href' => $this->categoryHref($t['category_path'] ?? null),
            ])->filter(fn (array $t) => $t['href'] !== null)->values(),
            'imageBand' => collect($this->rows($sector->image_band))->map(fn (array $i) => [
                'caption' => $i['caption'] ?? '',
                'bg' => $i['bg'] ?? null,
                'scene' => $i['scene'] ?? null,
                'image' => ImageUrl::path($i['image'] ?? null),
                'alt' => $i['alt'] ?? null,
            ])->values(),
            'quoteTitle' => $sector->quote_title,
            'whatsappText' => $sector->whatsapp_text,
            'faq' => $this->faq($sector),
            'seo' => $this->seo($sector, $sector->name),
            'others' => $others->map(fn (SectorPage $s) => $this->sectorCard($s))->values(),
            'contact' => $this->contact(),
        ]);
    }
}
