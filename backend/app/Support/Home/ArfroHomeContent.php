<?php

namespace App\Support\Home;

use App\Http\Resources\ProductCardResource;
use App\Models\Article;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\SectorPage;
use App\Models\ServicePage;
use App\Settings\ArfroHomeSettings;
use App\Settings\GeneralSettings;
use App\Support\Api\ImageUrl;
use App\Support\Blog\ArticlePresenter;
use App\Support\Catalog\SiteCatalog;
use App\Support\Payments\Cmi;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * `arfro` block of GET /home for arfro.com: the editorial home of the owner's brief
 * (docs/arfro-creative-brief.md), from ArfroHomeSettings. A section is null when it is switched
 * off, has no title, or has nothing real to show (no published project or testimonial, no article,
 * no product in a collection…), so the frontend simply leaves it out.
 *
 * Links are kept only when they are site paths, anchors, http(s), tel: or mailto: (or the
 * {telephone} / {whatsapp} placeholders), and a link to an editorial page or hub with nothing
 * published on the site (/solutions, /services, /blog, an unpublished page) is dropped. Images are
 * `{src}` (back-office upload) or `{design}` (one of DESIGN_IMAGES, resolved by the frontend from
 * public/design), else null. Texts may hold {horaires}, {visite}, {carte} and {telephone},
 * replaced with Réglages values.
 */
final class ArfroHomeContent
{
    /** Site photos a section can use while no image is uploaded (frontend/public/design/manifest.json). */
    public const DESIGN_IMAGES = [
        'cover-ariha.png' => 'Salon à Marrakech',
        'solutions-category.png' => 'Hall d’hôtel',
    ];

    /** Icons of the technology list (drawn by the frontend). */
    public const TECHNOLOGY_ICONS = [
        'inverter' => 'Inverter',
        'energy' => 'Économies d’énergie',
        'regulation' => 'Régulation intelligente',
        'quiet' => 'Silence',
        'filtration' => 'Filtration de l’air',
        'connected' => 'Pilotage connecté',
        'refrigerant' => 'Fluide frigorigène',
        'climate' => 'Fortes chaleurs',
    ];

    /** Icons of the services and trust lists. */
    public const SERVICE_ICONS = [
        'installation' => 'Installation',
        'visit' => 'Visite technique',
        'advice' => 'Conseil',
        'quote' => 'Devis',
        'delivery' => 'Livraison',
        'payment' => 'Paiement',
        'support' => 'Assistance',
    ];

    /** Environment keys (the frontend may pick a layout or art per key). */
    public const ENVIRONMENTS = [
        'maison' => 'Maison',
        'bureaux' => 'Bureaux',
        'hotellerie' => 'Hôtellerie',
        'restauration' => 'Restauration',
        'commerce' => 'Commerce',
        'autre' => 'Autre',
    ];

    /** Placeholders allowed in texts, as shown in the back office. */
    public const PLACEHOLDERS = 'Dans les textes : {horaires} (horaires de Réglages), {visite} (prix de la visite technique), {telephone} (numéro « Conseil »), {carte} (« ou en ligne par carte bancaire » quand le paiement CMI est actif). Dans les liens : {telephone} (appel) et {whatsapp} (WhatsApp de Réglages).';

    /** Accepted link targets (also the back-office validation rule). */
    public const URL_PATTERN = '~^(/(?![/\\\\])|#|https?://|tel:|mailto:|\{(telephone|whatsapp)\}$)~i';

    private const MAX_PRODUCTS = 8;

    private const MAX_ARTICLES = 4;

    /** @var array<string, bool> reachability of the internal links, per path */
    private array $reachable = [];

    /**
     * @param  array<string, string>  $tokens  text placeholders
     * @param  array<string, string>  $linkTokens  link placeholders (empty value: link dropped)
     */
    private function __construct(private readonly array $tokens, private readonly array $linkTokens, private readonly Request $request) {}

    /**
     * @param  list<array<string, mixed>>  $brands  the home brand logos (already scoped to the site)
     * @return array{sections: array<string, array<string, mixed>|null>, facts: array<string, mixed>}
     */
    public static function payload(ArfroHomeSettings $home, GeneralSettings $general, Request $request, array $brands): array
    {
        $facts = self::facts($general);
        $whatsapp = (string) preg_replace('/\D/', '', (string) $facts['whatsapp']);
        $self = new self(self::tokens($facts), [
            '{telephone}' => (string) ($facts['advicePhone']['href'] ?? ''),
            '{whatsapp}' => $whatsapp !== '' ? "https://wa.me/{$whatsapp}" : '',
        ], $request);

        return ['sections' => $self->sections($home, $brands), 'facts' => $facts];
    }

    /**
     * Real figures the sections may quote (Réglages and Paiement of the site). The advice phone is
     * the « Conseil » number, else the sales number.
     *
     * @return array{hours: string|null, cardPayment: bool, technicalVisitPrice: int|null, advicePhone: array{label: string, display: string, href: string}|null, whatsapp: string|null}
     */
    public static function facts(GeneralSettings $general): array
    {
        $advice = collect($general->phones)->firstWhere('label', 'Conseil');
        if (! $advice && trim($general->sales_phone) !== '') {
            $advice = ['label' => 'Ventes', 'display' => trim($general->sales_phone)];
        }

        return [
            'hours' => trim($general->hours) ?: null,
            'cardPayment' => Cmi::available(),
            'technicalVisitPrice' => $general->technical_visit_price > 0 ? $general->technical_visit_price : null,
            'advicePhone' => $advice ? [
                'label' => (string) $advice['label'],
                'display' => (string) $advice['display'],
                'href' => 'tel:+212'.ltrim((string) preg_replace('/\D/', '', (string) $advice['display']), '0'),
            ] : null,
            'whatsapp' => trim($general->whatsapp_number) ?: null,
        ];
    }

    /** A safe link target: site path, anchor, http(s), tel: or mailto:; else null. */
    public static function url(mixed $url): ?string
    {
        $url = is_string($url) ? trim($url) : '';
        if ($url === '' || str_starts_with($url, '{')) {
            return null;
        }

        return preg_match(self::URL_PATTERN, $url) === 1 ? $url : null;
    }

    /**
     * @param  list<array<string, mixed>>  $brands
     * @return array<string, array<string, mixed>|null>
     */
    private function sections(ArfroHomeSettings $home, array $brands): array
    {
        return [
            'hero' => $this->section($home->section_hero, fn (array $s) => [
                'cta' => $this->link($s, 'cta'),
                'secondary' => $this->link($s, 'secondary'),
                'image' => self::image($s),
            ]),
            'manifesto' => $this->section($home->section_manifesto, fn (array $s) => [
                'cta' => $this->link($s, 'cta'),
                'image' => self::image($s),
            ]),
            'environments' => $this->section($home->section_environments, function (array $s) {
                $items = self::items($s['items'] ?? [], fn (array $i) => $this->text($i['title'] ?? null) === null ? null : [
                    'key' => array_key_exists((string) ($i['key'] ?? ''), self::ENVIRONMENTS) ? $i['key'] : null,
                    'title' => $this->text($i['title']),
                    'text' => $this->text($i['text'] ?? null),
                    'href' => $this->href($i['cta_url'] ?? null),
                    'ctaLabel' => $this->text($i['cta_label'] ?? null),
                    'image' => self::image($i),
                ]);

                return $items ? ['items' => $items] : null;
            }),
            'technology' => $this->section($home->section_technology, function (array $s) {
                $items = self::items($s['items'] ?? [], fn (array $i) => $this->text($i['title'] ?? null) === null ? null : [
                    'icon' => array_key_exists((string) ($i['icon'] ?? ''), self::TECHNOLOGY_ICONS) ? $i['icon'] : null,
                    'title' => $this->text($i['title']),
                    'text' => $this->text($i['text'] ?? null),
                    'href' => $this->href($i['url'] ?? null),
                ]);

                return $items ? ['image' => self::image($s), 'items' => $items] : null;
            }),
            'products' => $this->section($home->section_products, function (array $s) {
                $collections = self::items($s['collections'] ?? [], fn (array $c) => $this->collection($c));

                return $collections ? ['cta' => $this->link($s, 'cta'), 'collections' => $collections] : null;
            }),
            'care' => $this->section($home->section_care, function (array $s) {
                $items = $this->serviceItems($s['items'] ?? []);

                return $items ? ['cta' => $this->link($s, 'cta'), 'image' => self::image($s), 'items' => $items] : null;
            }),
            'advisor' => $this->section($home->section_advisor, fn () => []),
            'projects' => $this->section($home->section_projects, function (array $s) {
                $items = self::items($s['items'] ?? [], fn (array $i) => empty($i['published']) || $this->text($i['title'] ?? null) === null ? null : [
                    'title' => $this->text($i['title']),
                    'location' => $this->text($i['location'] ?? null),
                    'type' => $this->text($i['type'] ?? null),
                    'products' => $this->text($i['products'] ?? null),
                    'description' => $this->text($i['description'] ?? null),
                    'image' => self::image($i),
                ]);

                return $items ? ['items' => $items] : null;
            }),
            'business' => $this->section($home->section_business, fn (array $s) => [
                'cta' => $this->link($s, 'cta'),
                'secondary' => $this->link($s, 'secondary'),
                'image' => self::image($s),
                'items' => self::items($s['items'] ?? [], fn (array $i) => $this->text($i['title'] ?? null) === null ? null : [
                    'title' => $this->text($i['title']),
                    'text' => $this->text($i['text'] ?? null),
                ]),
            ]),
            // Logos: the top-level `brands` of GET /home (official logos, back-office order).
            'brands' => $brands ? $this->section($home->section_brands, fn () => []) : null,
            'trust' => $this->section($home->section_trust, function (array $s) {
                $items = $this->serviceItems($s['items'] ?? []);

                return $items ? ['items' => $items] : null;
            }),
            'testimonials' => $this->section($home->section_testimonials, function (array $s) {
                $items = self::items($s['items'] ?? [], fn (array $i) => empty($i['published']) || $this->text($i['quote'] ?? null) === null || $this->text($i['author'] ?? null) === null ? null : [
                    'author' => $this->text($i['author']),
                    'location' => $this->text($i['location'] ?? null),
                    'type' => $this->text($i['type'] ?? null),
                    'products' => $this->text($i['products'] ?? null),
                    'quote' => $this->text($i['quote']),
                    'image' => self::image($i),
                ]);

                return $items ? ['items' => $items] : null;
            }, titleRequired: false),
            'journal' => $this->section($home->section_journal, function (array $s) {
                $articles = Article::query()->where(SiteCatalog::published(...))->with('category')
                    ->orderBy('position')->orderByDesc('published_at')->limit(self::MAX_ARTICLES)->get()
                    ->map(fn (Article $a) => ArticlePresenter::card($a))->values()->all();

                return $articles ? ['cta' => $this->link($s, 'cta'), 'articles' => $articles] : null;
            }),
            'final' => $this->section($home->section_final, fn (array $s) => [
                'cta' => $this->link($s, 'cta'),
                'secondary' => $this->link($s, 'secondary'),
                'image' => self::image($s),
            ]),
        ];
    }

    /**
     * Common header (eyebrow, title, text) plus the section's own fields; null when switched off,
     * untitled, or when `$extra` returns null (nothing real to show).
     *
     * @param  array<string, mixed>  $s
     * @param  callable(array<string, mixed>): ?array<string, mixed>  $extra
     * @return array<string, mixed>|null
     */
    private function section(array $s, callable $extra, bool $titleRequired = true): ?array
    {
        $title = $this->text($s['title'] ?? null);
        if (empty($s['enabled']) || ($titleRequired && $title === null)) {
            return null;
        }
        $fields = $extra($s);
        if ($fields === null) {
            return null;
        }

        return ['eyebrow' => $this->text($s['eyebrow'] ?? null), 'title' => $title, 'text' => $this->text($s['text'] ?? null)] + $fields;
    }

    /**
     * @param  mixed  $list
     * @param  callable(array<string, mixed>): ?array<string, mixed>  $map
     * @return list<array<string, mixed>>
     */
    private static function items($list, callable $map): array
    {
        return collect(is_array($list) ? $list : [])->filter(fn ($i) => is_array($i))
            ->map(fn (array $i) => $map($i))->filter()->values()->all();
    }

    /**
     * @param  mixed  $list
     * @return list<array<string, mixed>>
     */
    private function serviceItems($list): array
    {
        return self::items($list, fn (array $i) => $this->text($i['title'] ?? null) === null ? null : [
            'icon' => array_key_exists((string) ($i['icon'] ?? ''), self::SERVICE_ICONS) ? $i['icon'] : null,
            'title' => $this->text($i['title']),
            'text' => $this->text($i['text'] ?? null),
            'cta' => $this->link($i, 'cta'),
        ]);
    }

    /**
     * One « Des équipements sélectionnés » collection: picked families first, completed from its
     * ranges (published, visible on the site), as product cards. `category` is one category path
     * or a list of them; `href` is the range's page when there is exactly one. Null when it has no
     * product.
     *
     * @param  array<string, mixed>  $c
     * @return array{label: string, href: string|null, products: list<array<string, mixed>>}|null
     */
    private function collection(array $c): ?array
    {
        $label = $this->text($c['label'] ?? null);
        if ($label === null) {
            return null;
        }
        $ids = array_values(array_filter(array_map('intval', is_array($c['product_ids'] ?? null) ? $c['product_ids'] : [])));
        $paths = collect(is_array($c['category'] ?? null) ? $c['category'] : [$c['category'] ?? null])
            ->filter(fn ($p) => is_string($p) && trim($p) !== '')->map(fn (string $p) => trim($p))->unique()->values();
        $categories = $paths->isEmpty() ? collect() : Category::query()->where(SiteCatalog::publicCategories(...))
            ->whereIn('path', $paths->all())->get()->sortBy(fn (Category $cat) => $paths->search($cat->path))->values();

        $with = ['variants', 'images', 'brand'];
        $picked = $ids ? Product::query()->where(SiteCatalog::products(...))->whereIn('id', $ids)->whereHas('variants')
            ->with($with)->get()->keyBy('id') : collect();
        $products = collect($ids)->map(fn (int $id) => $picked->get($id))->filter()->values();
        if ($categories->isNotEmpty() && $products->count() < self::MAX_PRODUCTS) {
            $products = $products->concat(
                Product::query()->where(SiteCatalog::products(...))
                    ->whereIn('category_id', $categories->flatMap(fn (Category $cat) => $cat->descendantIds())->unique()->values()->all())
                    ->whereNotIn('id', $products->pluck('id'))->whereHas('variants')
                    ->with($with)->orderByDesc('is_featured')->orderBy('position')
                    ->limit(self::MAX_PRODUCTS - $products->count())->get()
            );
        }
        if ($products->isEmpty()) {
            return null;
        }

        return [
            'label' => $label,
            'href' => $categories->count() === 1 ? $categories->first()->url() : null,
            'products' => $products->take(self::MAX_PRODUCTS)
                ->map(fn (Product $p) => (new ProductCardResource($p))->toArray($this->request))->values()->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $s
     * @return array{label: string, href: string}|null
     */
    private function link(array $s, string $prefix): ?array
    {
        $label = $this->text($s["{$prefix}_label"] ?? null);
        $href = $this->href($s["{$prefix}_url"] ?? null);

        return $label !== null && $href !== null ? ['label' => $label, 'href' => $href] : null;
    }

    /** A safe, reachable link target, with its placeholder resolved; else null. */
    private function href(mixed $url): ?string
    {
        if (is_string($url) && array_key_exists(trim($url), $this->linkTokens)) {
            return $this->linkTokens[trim($url)] ?: null;
        }
        $url = self::url($url);

        return $url !== null && $this->reachable($url) ? $url : null;
    }

    /**
     * Whether an internal link leads to published content on the site: the sector, service and
     * blog hubs need a published entry, a sector / service / article / page needs to be published.
     * Other paths (catalogue, tools, forms) and external links are kept as they are.
     */
    private function reachable(string $url): bool
    {
        if (! str_starts_with($url, '/')) {
            return true;
        }
        $path = rtrim((string) strtok($url, '?#'), '/');

        return $this->reachable[$path] ??= (function () use ($path): bool {
            $published = fn (string $model, ?string $slug = null): bool => $model::query()
                ->when($slug !== null, fn ($q) => $q->where('slug', $slug))->where(SiteCatalog::published(...))->exists();
            $exists = fn (string $model, string $slug): bool => $model::query()->where('slug', $slug)->exists();
            $segments = explode('/', ltrim($path, '/'));
            /** @var array<string, class-string<Model>> $hubs */
            $hubs = ['solutions' => SectorPage::class, 'services' => ServicePage::class, 'blog' => Article::class];

            if (isset($hubs[$segments[0]]) && count($segments) <= 2) {
                $model = $hubs[$segments[0]];
                if (count($segments) === 1) {
                    return $published($model);
                }

                // /blog/{article category} and other sub-paths are left to the frontend.
                return ! $exists($model, $segments[1]) || $published($model, $segments[1]);
            }
            if (count($segments) === 1 && $segments[0] !== '' && $exists(Page::class, $segments[0])) {
                return $published(Page::class, $segments[0]);
            }

            return true;
        })();
    }

    /**
     * @param  array<string, mixed>  $s
     * @return array{src: string}|array{design: string}|null
     */
    private static function image(array $s): ?array
    {
        $upload = $s['image'] ?? null;
        // Filament may keep a single upload as a one-item array.
        if (is_array($upload)) {
            $upload = reset($upload) ?: null;
        }
        if (is_string($upload) && trim($upload) !== '' && ($src = ImageUrl::path(trim($upload)))) {
            return ['src' => $src];
        }
        $design = $s['design_image'] ?? null;

        return is_string($design) && array_key_exists($design, self::DESIGN_IMAGES) ? ['design' => $design] : null;
    }

    /** Trimmed text with its placeholders replaced, null when empty. */
    private function text(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        $value = trim(strtr($value, $this->tokens));
        // A placeholder ending with a full stop, followed by the text's own one.
        $value = (string) preg_replace('/\.\.(?!\.)/u', '.', $value);

        return $value === '' ? null : $value;
    }

    /**
     * @param  array{hours: string|null, cardPayment: bool, technicalVisitPrice: int|null, advicePhone: array{display: string}|null}  $facts
     * @return array<string, string>
     */
    private static function tokens(array $facts): array
    {
        return [
            '{horaires}' => (string) $facts['hours'],
            '{visite}' => $facts['technicalVisitPrice'] !== null
                ? number_format(intdiv($facts['technicalVisitPrice'], 100), 0, ',', "\u{00A0}")."\u{00A0}Dhs"
                : 'tarif sur demande',
            '{telephone}' => (string) ($facts['advicePhone']['display'] ?? ''),
            '{carte}' => $facts['cardPayment'] ? ' ou en ligne par carte bancaire' : '',
        ];
    }
}
