<?php

use App\Models\Article;
use App\Models\SectorPage;
use App\Models\ServicePage;

/*
| Arfro's navigation (docs/arfro-creative-brief.md « Navigation »): the `arfro` key of the navigation
| API lists the published service and sector pages, the blog and the quote-only ranges of Arfro only.
| Climatisation Maroc's output has no such key.
*/

beforeEach(fn () => $this->seed());

it('leaves the Climatisation Maroc navigation without the arfro key', function () {
    expect($this->getJson('/api/v1/navigation')->json())->not->toHaveKey('arfro')
        ->and($this->getJson('/api/v1/navigation', ['X-Site' => 'cm'])->json())->not->toHaveKey('arfro');
});

it('lists only what is published on Arfro', function () {
    // Seeded editorial content belongs to Climatisation Maroc only.
    $arfro = $this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->json('arfro');

    expect($arfro['services'])->toBe([])
        ->and($arfro['solutions'])->toBe([])
        ->and($arfro['blog'])->toBeNull()
        ->and($arfro['quoteRanges'])->toBe([['label' => 'Froid et chambres froides', 'href' => '/froid']]);
});

it('links Arfro service pages, sector pages and the blog once published there', function () {
    // Saved like the back office does (model events flush the API cache).
    ServicePage::query()->where('slug', 'installation')->firstOrFail()->update(['sites' => ['cm', 'arfro']]);
    $sector = SectorPage::query()->where('is_published', true)->orderBy('position')->firstOrFail();
    $sector->update(['sites' => ['cm', 'arfro']]);
    Article::query()->where('is_published', true)->firstOrFail()->update(['sites' => ['cm', 'arfro']]);
    ServicePage::query()->where('slug', 'visite-technique')->firstOrFail()->update(['sites' => ['cm', 'arfro'], 'is_published' => false]);

    $arfro = $this->getJson('/api/v1/navigation', ['X-Site' => 'arfro'])->json('arfro');

    expect($arfro['services'])->toBe([['label' => ServicePage::query()->where('slug', 'installation')->value('name'), 'href' => '/services/installation']])
        ->and($arfro['solutions'])->toBe([['label' => $sector->name, 'href' => '/solutions/'.$sector->slug]])
        ->and($arfro['blog'])->toBe(['label' => 'Conseils', 'href' => '/blog']);
});
