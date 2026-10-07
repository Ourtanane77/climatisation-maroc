<?php

use App\Models\Article;
use App\Models\Page;
use App\Models\SectorPage;

/*
| Every public page is reachable from the navigation (owner's request of 2026-10-07): drawer links
| (Structure et navigation board) and the footer's "Conseils et services" column, published only.
*/

beforeEach(fn () => $this->seed());

it('links solutions and the blog in the mobile drawer when they have published content', function () {
    expect($this->getJson('/api/v1/navigation')->json('drawerLinks'))->toBe([
        ['label' => 'Solutions professionnelles', 'href' => '/solutions'],
        ['label' => 'Blog', 'href' => '/blog'],
    ]);

    // Saved like the back office does (model events flush the API cache).
    Article::query()->where('is_published', true)->get()->each->update(['is_published' => false]);
    SectorPage::query()->where('is_published', true)->get()->each->update(['is_published' => false]);

    expect($this->getJson('/api/v1/navigation')->json('drawerLinks'))->toBe([]);
});

it('links every public page from the footer', function () {
    $columns = collect($this->getJson('/api/v1/navigation')->json('footer.columns'))->keyBy('title');
    $hrefs = fn (string $title) => array_column($columns[$title]['links'], 'href');

    expect($hrefs('Informations'))->toBe(['/a-propos', '/contact', '/espace-professionnel', '/demander-un-devis', '/livraison-et-paiement', '/suivi-commande', '/plan-du-site'])
        ->and($hrefs('Conseils et services'))->toBe(['/blog', '/calculateur-puissance', '/solutions', '/services', '/marques', '/promotions', '/comparer']);
});

it('drops footer links to pages that are not published', function () {
    Page::query()->where('slug', 'livraison-et-paiement')->firstOrFail()->update(['is_published' => false]);
    Article::query()->where('is_published', true)->get()->each->update(['is_published' => false]);

    $columns = collect($this->getJson('/api/v1/navigation')->json('footer.columns'))->keyBy('title');

    expect(array_column($columns['Informations']['links'], 'href'))->not->toContain('/livraison-et-paiement')
        ->and(array_column($columns['Conseils et services']['links'], 'href'))->not->toContain('/blog');
});
