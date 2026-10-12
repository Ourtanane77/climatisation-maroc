<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Enums\PageKind;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Article;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\SectorPage;
use App\Models\ServicePage;
use App\Settings\GeneralSettings;
use App\Settings\HomeSettings;
use App\Support\Api\Audience;
use App\Support\Api\ImageUrl;
use App\Support\Catalog\SiteCatalog;
use App\Support\Sites\Sites;
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
        // Public categories of the site only: an empty sub-category (no visible product) is not linked.
        $roots = Category::query()->where(SiteCatalog::publicCategories(...))->roots()->orderBy('position')->with(['children' => fn ($q) => $q->where(SiteCatalog::publicCategories(...))])->get();
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
                    'subs' => $c->children->map(fn (Category $s) => ['label' => $s->short_name ?? $s->siteText('name'), 'href' => $s->url()])->values(),
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
            // Mobile drawer, between Promotions and the right-hand links (Structure et navigation board).
            'drawerLinks' => $this->drawerLinks(),
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
                'copyright' => "\u{00A9} ".now()->year." Ariha Froid \u{00B7} ".Sites::current()->name,
            ],
        ]);
    }

    private function label(Category $c): string
    {
        return $c->short_name ?? (string) $c->siteText('name');
    }

    /** "0666-854184" → "tel:+212666854184". */
    public static function tel(string $display): string
    {
        return 'tel:+212'.ltrim((string) preg_replace('/\D/', '', $display), '0');
    }

    /** @return list<array{label: string, href: string}> */
    private function brandsIn(Category $range): array
    {
        return Brand::query()->where(SiteCatalog::brands(...))
            ->whereHas('products', fn ($q) => $q->where(SiteCatalog::products(...))->whereIn('category_id', $range->descendantIds()))
            ->orderBy('position')
            ->get()
            ->map(fn (Brand $b) => ['label' => $b->name, 'href' => $b->url()])
            ->all();
    }

    /** @return array<string, mixed>|null */
    private function featured(?int $productId): ?array
    {
        $product = $productId ? Product::query()->where(SiteCatalog::products(...))->with(['variants', 'images'])->find($productId) : null;
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
     * Solutions professionnelles and Blog, linked only when they have published content.
     *
     * @return list<array{label: string, href: string}>
     */
    private function drawerLinks(): array
    {
        return array_values(array_filter([
            SectorPage::query()->where(SiteCatalog::published(...))->exists() ? ['label' => 'Solutions professionnelles', 'href' => '/solutions'] : null,
            Article::query()->where(SiteCatalog::published(...))->exists() ? ['label' => 'Blog', 'href' => '/blog'] : null,
        ]));
    }

    /**
     * Footer columns of the design: Informations, Climatisation, Chauffe-eau, Autres produits, plus
     * "Conseils et services" (blog, calculator, solutions, services, brands, compare): owner's
     * request of 2026-10-07, every public page must be reachable from the footer.
     *
     * @param  Collection<int, Category>  $roots
     * @return list<array{title: string, links: list<array{label: string, href: string}>}>
     */
    private function footerColumns(Collection $roots): array
    {
        $pages = Page::query()->where(SiteCatalog::published(...))->whereIn('slug', ['a-propos', 'livraison-et-paiement'])->pluck('slug')->all();
        $informations = array_values(array_filter([
            in_array('a-propos', $pages, true) ? ['label' => "\u{00C0} propos", 'href' => '/a-propos'] : null,
            ['label' => 'Contact', 'href' => '/contact'],
            ['label' => 'Espace revendeur', 'href' => '/espace-professionnel'],
            ['label' => 'Demander un devis', 'href' => '/demander-un-devis'],
            in_array('livraison-et-paiement', $pages, true) ? ['label' => 'Livraison et paiement', 'href' => '/livraison-et-paiement'] : null,
            ['label' => 'Suivre ma commande', 'href' => '/suivi-commande'],
            ['label' => 'Plan du site', 'href' => '/plan-du-site'],
        ]));

        $columns = [['title' => 'Informations', 'links' => $informations]];
        $others = [];
        foreach ($roots as $root) {
            if (in_array($root->slug, ['climatisation', 'chauffe-eau'], true) && $root->children->isNotEmpty()) {
                $columns[] = [
                    'title' => $this->label($root),
                    'links' => $root->children->map(fn (Category $c) => ['label' => $c->short_name ?? $c->siteText('name'), 'href' => $c->url()])->values()->all(),
                ];
            } else {
                // Design labels: "Gaines circulaires" (full name) but "Froid" (short name of a long one).
                $name = (string) $root->siteText('name');
                $others[] = ['label' => mb_strlen($name) > 20 ? $this->label($root) : $name, 'href' => $root->url()];
            }
        }
        if ($others !== []) {
            $columns[] = ['title' => 'Autres produits', 'links' => $others];
        }

        $columns[] = ['title' => 'Conseils et services', 'links' => array_values(array_filter([
            Article::query()->where(SiteCatalog::published(...))->exists() ? ['label' => 'Blog', 'href' => '/blog'] : null,
            ['label' => 'Calculateur de puissance', 'href' => '/calculateur-puissance'],
            SectorPage::query()->where(SiteCatalog::published(...))->exists() ? ['label' => 'Solutions professionnelles', 'href' => '/solutions'] : null,
            ServicePage::query()->where(SiteCatalog::published(...))->exists() ? ['label' => 'Services', 'href' => '/services'] : null,
            ['label' => 'Marques', 'href' => '/marques'],
            ['label' => 'Promotions', 'href' => '/promotions'],
            ['label' => 'Comparer des produits', 'href' => '/comparer'],
        ]))];

        return $columns;
    }

    /** @return list<array{label: string, href: string}> */
    private function legal(): array
    {
        $links = Page::query()->where(SiteCatalog::published(...))->where('kind', PageKind::Legal->value)->get()
            ->sortBy(fn (Page $p) => array_search($p->slug, self::LEGAL_ORDER, true) === false ? 99 : array_search($p->slug, self::LEGAL_ORDER, true))
            ->map(fn (Page $p) => ['label' => $p->title, 'href' => $p->url()])
            ->values()->all();

        $aftersales = ServicePage::query()->where(SiteCatalog::published(...))->where('slug', 'service-apres-vente')->first();
        if ($aftersales) {
            $links[] = ['label' => "Service apr\u{00E8}s-vente", 'href' => $aftersales->url()];
        }

        return $links;
    }
}
