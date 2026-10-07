<?php

namespace App\Http\Controllers\Api\Content;

use App\Http\Controllers\Api\Content\Concerns\PresentsContent;
use App\Http\Controllers\Controller;
use App\Models\ServicePage;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Service pages: installation, visite technique, service après-vente (design/Service.dc.html). */
class ServiceController extends Controller
{
    use PresentsContent;

    public function index(): JsonResponse
    {
        $services = ServicePage::query()->published()->with('seo')->orderBy('position')->get();

        return response()->json([
            'data' => $services->map(fn (ServicePage $s) => [
                'slug' => $s->slug,
                'name' => $s->name,
                'h1' => $this->seo($s, $s->name)['h1'],
                'heroText' => $s->hero_text,
                'href' => $s->url(),
            ])->values(),
            'contact' => $this->contact(),
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $service = ServicePage::query()->published()->where('slug', $slug)->with(['seo', 'faqItems'])->firstOrFail();

        return response()->json([
            'slug' => $service->slug,
            'name' => $service->name,
            'href' => $service->url(),
            'heroText' => $service->hero_text,
            'image' => ImageUrl::path($service->image),
            'whatsappText' => $service->whatsapp_text,
            'included' => $this->rows($service->included),
            'steps' => $this->rows($service->steps),
            'prices' => $this->rows($service->prices),
            'showSupplies' => $service->show_supplies,
            'products' => $service->show_supplies ? $this->productCards($service->products(), $request) : [],
            'faq' => $this->faq($service),
            'seo' => $this->seo($service, $service->name),
            'contact' => $this->contact(),
        ]);
    }
}
