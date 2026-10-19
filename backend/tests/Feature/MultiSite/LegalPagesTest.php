<?php

use App\Enums\PageKind;
use App\Models\Page;
use App\Support\Sites\Sites;
use Database\Seeders\Data\LegalPages;

/*
| Legal pages (Database\Seeders\Data\LegalPages, 2026-10-19): one set per site naming that site
| only; pages with an « [À compléter : …] » marker stay unpublished; text edited in the back
| office is never replaced, by the seeder or by the data migration.
*/

const PUBLISHED_LEGAL = ['cgu', 'cgv', 'securite'];
const WAITING_LEGAL = ['informations-legales', 'confidentialite'];

/** Everything a visitor can read on the page: title, intro, articles, SEO. */
function legalText(Page $page): string
{
    $seo = $page->seo()->first();

    return implode(' ', [$page->title, $page->intro, json_encode($page->body, JSON_UNESCAPED_UNICODE), $seo?->title, $seo?->description]);
}

/** Legal pages as the design seeded them before 2026-10-19. */
function designPlaceholderPage(string $slug, array $sites = ['cm']): Page
{
    return Page::query()->create([
        'slug' => $slug, 'title' => 'Titre '.$slug, 'kind' => PageKind::Legal, 'sites' => $sites, 'is_published' => false,
        'body' => [['type' => 'article', 'data' => ['title' => 'Objet', 'text' => LegalPages::DESIGN_PLACEHOLDER]]],
    ]);
}

function runLegalMigration(): void
{
    (require database_path('migrations/2026_10_19_100000_write_legal_pages.php'))->up();
}

it('gives each site its own legal pages, naming that site only', function () {
    foreach (Sites::keys() as $site) {
        LegalPages::write($site);
    }

    foreach (Sites::keys() as $site) {
        $pages = Page::query()->visibleOn($site)->where('kind', PageKind::Legal)->get();
        expect($pages->pluck('slug')->sort()->values()->all())->toBe(collect(LegalPages::SLUGS)->sort()->values()->all());

        foreach ($pages as $page) {
            $text = legalText($page);
            expect($page->sites)->toBe([$site])
                ->and($text)->toContain(Sites::get($site)->name)
                ->and($text)->toContain('Ariha Froid')
                ->and($text)->not->toContain(LegalPages::DESIGN_PLACEHOLDER)
                ->and($page->updated_label)->toBe(LegalPages::UPDATED_LABEL);
            foreach (array_diff(Sites::keys(), [$site]) as $other) {
                expect($text)->not->toContain(Sites::get($other)->name);
            }
        }
    }
});

it('publishes only the pages without « À compléter » markers', function () {
    LegalPages::write('cm');

    $pages = Page::query()->where('kind', PageKind::Legal)->get()->keyBy('slug');
    foreach (PUBLISHED_LEGAL as $slug) {
        expect($pages[$slug]->is_published)->toBeTrue()
            ->and(legalText($pages[$slug]))->not->toContain(LegalPages::TODO);
    }
    foreach (WAITING_LEGAL as $slug) {
        expect($pages[$slug]->is_published)->toBeFalse()
            ->and(legalText($pages[$slug]))->toContain(LegalPages::TODO);
    }
});

it('never replaces a legal text edited in the back office', function () {
    LegalPages::write('cm');
    $cgv = Page::query()->where('slug', 'cgv')->firstOrFail();
    $edited = [['type' => 'article', 'data' => ['title' => 'Objet', 'text' => 'Texte rédigé par le propriétaire.']]];
    $cgv->update(['body' => $edited, 'intro' => 'Intro du propriétaire.', 'is_published' => false]);

    expect(LegalPages::write('cm')['cgv'])->toBe('kept');

    $cgv->refresh();
    expect($cgv->body)->toEqual($edited)
        ->and($cgv->intro)->toBe('Intro du propriétaire.')
        ->and($cgv->is_published)->toBeFalse();
});

it('writes the existing design pages on migration, keeps edited ones and creates the Arfro set', function () {
    foreach (LegalPages::SLUGS as $slug) {
        designPlaceholderPage($slug);
    }
    $edited = [['type' => 'article', 'data' => ['title' => 'Objet', 'text' => 'CGU rédigées par le propriétaire.']]];
    Page::query()->where('slug', 'cgu')->update(['body' => json_encode($edited)]);

    runLegalMigration();

    $cm = Page::query()->visibleOn('cm')->where('kind', PageKind::Legal)->get()->keyBy('slug');
    expect($cm)->toHaveCount(5)
        ->and($cm['cgu']->body)->toEqual($edited)
        ->and($cm['cgu']->is_published)->toBeFalse()
        // Existing rows are updated in place (same id, the owner's title kept).
        ->and($cm['cgv']->title)->toBe('Titre cgv')
        ->and($cm['cgv']->is_published)->toBeTrue()
        ->and(legalText($cm['cgv']))->toContain('Climatisation Maroc')
        ->and($cm['confidentialite']->is_published)->toBeFalse();

    $arfro = Page::query()->visibleOn('arfro')->where('kind', PageKind::Legal)->get()->keyBy('slug');
    expect($arfro)->toHaveCount(5)
        ->and($arfro['cgu']->is_published)->toBeTrue()
        ->and(legalText($arfro['cgu']))->toContain('Arfro')->not->toContain('Climatisation Maroc');

    // Idempotent: a second run changes nothing.
    $before = Page::query()->orderBy('id')->get(['id', 'slug', 'sites', 'body', 'is_published'])->toArray();
    runLegalMigration();
    expect(Page::query()->orderBy('id')->get(['id', 'slug', 'sites', 'body', 'is_published'])->toArray())->toBe($before);
});

it('gives a placeholder page shared by both sites to one site and writes the other its own', function () {
    designPlaceholderPage('cgv', ['cm', 'arfro']);
    designPlaceholderPage('a-propos-test', ['cm']); // any page: the database is not empty

    runLegalMigration();

    $cgv = Page::query()->where('slug', 'cgv')->get();
    expect($cgv)->toHaveCount(2)
        ->and($cgv->pluck('sites')->all())->toEqualCanonicalizing([['cm'], ['arfro']]);
});

it('leaves an empty database to the seeders', function () {
    runLegalMigration();

    expect(Page::query()->count())->toBe(0);
});

it('lists each site’s published legal pages in its footer only', function () {
    foreach (Sites::keys() as $site) {
        LegalPages::write($site);
    }
    // An Arfro-only page must not reach the Climatisation Maroc footer, and the reverse.
    Page::query()->visibleOn('arfro')->where('slug', 'cgu')->update(['title' => 'CGU Arfro']);

    $legal = fn (string $site) => collect($this->getJson('/api/v1/navigation', ['X-Site' => $site])->assertOk()->json('footer.legal'))
        ->pluck('label', 'href')->all();

    expect($legal('cm'))->toBe([
        '/cgu' => 'Conditions générales d’utilisation',
        '/cgv' => 'Conditions générales de vente',
        '/securite' => 'Sécurité',
    ])->and($legal('arfro'))->toBe([
        '/cgu' => 'CGU Arfro',
        '/cgv' => 'Conditions générales de vente',
        '/securite' => 'Sécurité',
    ]);

    $this->getJson('/api/v1/pages/cgv', ['X-Site' => 'arfro'])->assertOk()
        ->assertJsonPath('updatedLabel', LegalPages::UPDATED_LABEL)
        ->assertJsonCount(12, 'body');
    $this->getJson('/api/v1/pages/confidentialite', ['X-Site' => 'arfro'])->assertNotFound();
});
