<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Enums\PageKind;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\ServicePage;
use App\Settings\GeneralSettings;
use App\Settings\HomeSettings;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

/**
 * Header, mega menus, mobile drawer and footer (front-end `SiteNavigation`), built from the
 * category tree and the settings. Only published pages are linked.
 */
class NavigationController extends Controller
{
    /** Legal links in the order of the design footer. */
    private const LEGAL_ORDER = ['cgu', 'cgv', 'informations-legales', 'securite', 'confidentialite'];

    public function __invoke(GeneralSettings $settings, HomeSettings $home): JsonResponse
    {
        $roots = Category::query()->active()->roots()->orderBy('position')->with(['children' => fn ($q) => $q->where('is_active', true)])->get();
        $ranges = $roots->reject(fn (Category $c) => $c->is_quote_only);

        return response()->json([
            'promoBar' => $settings->promo_bar_text ? [
                'text' => $settings->promo_bar_text,
                'link' => $settings->promo_bar_link_url
                    ? ['label' => (string) $settings->promo_bar_link_label, 'href' => $settings->promo_bar_link_url]
                    : null,
            ] : null,
            'ranges' => $ranges->map(fn (Category $c) => [
                'key' => $c->slug,
                'label' => $this->label($c),
                'href' => $c->url(),
                'mega' => [
                    'title' => $this->label($c),
                    'href' => $c->url(),
                    'subs' => $c->children->map(fn (Category $s) => ['label' => $s->short_name ?? $s->name, 'href' => $s->url()])->values(),
                    'brands' => $this->brandsIn($c),
                    'featured' => $this->featured($home->mega_featured[$c->slug] ?? null),
                ],
            ])->values(),
            'promotions' => ['label' => 'Promotions', 'href' => '/promotions'],
            'rightLinks' => [
                ['label' => 'Demander un devis', 'href' => '/demander-un-devis'],
                ['label' => 'Contact', 'href' => '/contact'],
                ['label' => 'Devenir revendeur', 'href' => '/devenir-revendeur'],
            ],
            'searchScopes' => ['Toutes', ...$roots->map(fn (Category $c) => $this->label($c))->all()],
            'whatsapp' => ['number' => $settings->whatsapp_number, 'display' => $settings->sales_phone],
            'salesPhone' => ['label' => 'Ventes', 'display' => $settings->sales_phone, 'href' => self::tel($settings->sales_phone)],
            'footer' => [
                'about' => $settings->about_footer,
                'socials' => $this->socials($settings),
                'columns' => $this->footerColumns($roots),
                'phones' => [
                    ...collect($settings->phones)->map(fn (array $p) => [
                        'label' => $p['label'],
                        'display' => $p['display'],
                        'href' => self::tel($p['display']),
                    ])->all(),
                    ['label' => 'E-mail', 'display' => $settings->email, 'href' => 'mailto:'.$settings->email],
                ],
                'stores' => array_values($settings->stores),
                'hours' => $settings->hours,
                'legal' => $this->legal(),
                'copyright' => "\u{00A9} ".now()->year." Ariha Froid \u{00B7} Climatisation Maroc",
            ],
        ]);
    }

    private function label(Category $c): string
    {
        return $c->short_name ?? $c->name;
    }

    /** "0666-854184" → "tel:+212666854184". */
    public static function tel(string $display): string
    {
        return 'tel:+212'.ltrim((string) preg_replace('/\D/', '', $display), '0');
    }

    /** @return list<array{label: string, href: string}> */
    private function brandsIn(Category $range): array
    {
        return Brand::query()->active()
            ->whereHas('products', fn ($q) => $q->published()->whereIn('category_id', $range->descendantIds()))
            ->orderBy('position')
            ->get()
            ->map(fn (Brand $b) => ['label' => $b->name, 'href' => $b->url()])
            ->all();
    }

    /** @return array<string, mixed>|null */
    private function featured(?int $productId): ?array
    {
        $product = $productId ? Product::query()->published()->with(['variants', 'images'])->find($productId) : null;
        $variant = $product?->variants->firstWhere('is_default', true) ?? $product?->variants->first();
        if (! $product || ! $variant) {
            return null;
        }

        return [
            'name' => $variant->displayName(),
            'sku' => $variant->sku,
            'price' => $variant->priceFor(Audience::isReseller()),
            'image' => ImageUrl::for(ProductCardResource::imageFor($product, $variant)),
            'art' => $product->art_key,
            'href' => $product->url().($product->variants->count() > 1 ? '?v='.rawurlencode($variant->sku) : ''),
        ];
    }

    /** @return list<array{name: string, href: string}> */
    private function socials(GeneralSettings $settings): array
    {
        $names = ['facebook' => 'Facebook', 'instagram' => 'Instagram', 'tiktok' => 'TikTok'];
        $socials = [];
        foreach ($names as $key => $name) {
            if (! empty($settings->socials[$key])) {
                $socials[] = ['name' => $name, 'href' => $settings->socials[$key]];
            }
        }
        $socials[] = ['name' => 'WhatsApp', 'href' => 'https://wa.me/'.$settings->whatsapp_number];

        return $socials;
    }

    /**
     * Footer columns of the design: Informations, Climatisation, Chauffe-eau, Autres produits.
     *
     * @param  Collection<int, Category>  $roots
     * @return list<array{title: string, links: list<array{label: string, href: string}>}>
     */
    private function footerColumns(Collection $roots): array
    {
        $about = Page::query()->published()->where('slug', 'a-propos')->first();
        $informations = array_values(array_filter([
            $about ? ['label' => "\u{00C0} propos", 'href' => $about->url()] : null,
            ['label' => 'Contact', 'href' => '/contact'],
            ['label' => 'Espace revendeur', 'href' => '/devenir-revendeur'],
            ['label' => 'Demander un devis', 'href' => '/demander-un-devis'],
        ]));

        $columns = [['title' => 'Informations', 'links' => $informations]];
        $others = [];
        foreach ($roots as $root) {
            if (in_array($root->slug, ['climatisation', 'chauffe-eau'], true) && $root->children->isNotEmpty()) {
                $columns[] = [
                    'title' => $this->label($root),
                    'links' => $root->children->map(fn (Category $c) => ['label' => $c->short_name ?? $c->name, 'href' => $c->url()])->values()->all(),
                ];
            } else {
                // Design labels: "Gaines circulaires" (full name) but "Froid" (short name of a long one).
                $others[] = ['label' => mb_strlen($root->name) > 20 ? $this->label($root) : $root->name, 'href' => $root->url()];
            }
        }
        if ($others !== []) {
            $columns[] = ['title' => 'Autres produits', 'links' => $others];
        }

        return $columns;
    }

    /** @return list<array{label: string, href: string}> */
    private function legal(): array
    {
        $links = Page::query()->published()->where('kind', PageKind::Legal->value)->get()
            ->sortBy(fn (Page $p) => array_search($p->slug, self::LEGAL_ORDER, true) === false ? 99 : array_search($p->slug, self::LEGAL_ORDER, true))
            ->map(fn (Page $p) => ['label' => $p->title, 'href' => $p->url()])
            ->values()->all();

        $aftersales = ServicePage::query()->published()->where('slug', 'service-apres-vente')->first();
        if ($aftersales) {
            $links[] = ['label' => "Service apr\u{00E8}s-vente", 'href' => $aftersales->url()];
        }

        return $links;
    }
}
