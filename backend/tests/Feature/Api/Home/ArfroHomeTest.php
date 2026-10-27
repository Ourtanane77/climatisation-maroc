<?php

use App\Filament\Pages\ManageArfroHomeSettings;
use App\Filament\Pages\ManageHomeSettings;
use App\Models\Article;
use App\Models\Page;
use App\Models\SectorPage;
use App\Models\ServicePage;
use App\Models\User;
use App\Settings\ArfroGeneralSettings;
use App\Settings\ArfroHomeSettings;
use App\Settings\ArfroPaymentSettings;
use App\Settings\HomeSettings;
use Livewire\Livewire;

/*
| Editorial home of arfro.com (owner's brief of 2026-10-27, docs/arfro-creative-brief.md): settings
| migration values, the `arfro` block of GET /home (sections, images, placeholders, hidden sections),
| Climatisation Maroc unchanged, back-office form.
*/

beforeEach(fn () => $this->seed());

function arfroHome(): array
{
    return test()->getJson('/api/v1/home', ['X-Site' => 'arfro'])->assertOk()->json('arfro');
}

it('seeds the brief’s copy and photos in home_arfro only', function () {
    $home = new ArfroHomeSettings;

    expect($home->section_hero['title'])->toBe('Le confort qui change tout.')
        ->and($home->section_hero['design_image'])->toBe('cover-ariha.png')
        ->and($home->section_hero['image'])->toBeNull()
        ->and(array_column($home->section_environments['items'], 'key'))->toBe(['maison', 'bureaux', 'hotellerie', 'restauration'])
        ->and(array_column($home->section_environments['items'], 'design_image'))->toBe(['cover-ariha.png', null, 'solutions-category.png', null])
        ->and($home->section_business['design_image'])->toBe('solutions-category.png')
        ->and(array_column($home->section_care['items'], 'title'))->toBe(['Installation', 'Visite technique', 'Conseil'])
        ->and($home->section_projects['items'])->toBe([])
        ->and($home->section_testimonials['items'])->toBe([])
        // Climatisation Maroc keeps its settings group as it was.
        ->and(property_exists(new HomeSettings, 'section_hero'))->toBeFalse();
});

it('outputs the editorial sections for Arfro and leaves the Climatisation Maroc response unchanged', function () {
    $cm = $this->getJson('/api/v1/home')->assertOk()->json();
    expect($cm)->not->toHaveKey('arfro')
        ->and(array_keys($cm))->toBe(['hero', 'whatsapp', 'heroWhatsapp', 'bento', 'newProducts', 'promotions', 'ducts', 'supplies', 'brands', 'pro']);

    $arfro = arfroHome();
    $s = $arfro['sections'];

    expect(array_keys($s))->toBe(['hero', 'manifesto', 'environments', 'technology', 'products', 'care', 'advisor', 'projects', 'business', 'brands', 'trust', 'testimonials', 'journal', 'final'])
        ->and($s['hero'])->toMatchArray([
            'eyebrow' => 'ARFRO — Expert du confort climatique',
            'title' => 'Le confort qui change tout.',
            'cta' => ['label' => 'Découvrir nos solutions', 'href' => '/climatisation'],
            'secondary' => ['label' => 'Trouver ma climatisation', 'href' => '/calculateur-puissance'],
            'image' => ['design' => 'cover-ariha.png'],
        ])
        // No « À propos » page on Arfro yet: no button.
        ->and($s['manifesto']['cta'])->toBeNull()
        ->and($s['environments']['items'][0])->toMatchArray(['key' => 'maison', 'href' => '/climatisation/mural', 'ctaLabel' => 'Explorer les solutions maison'])
        ->and($s['environments']['items'][1]['image'])->toBeNull()
        // No service page published on Arfro yet: no link to /services.
        ->and($s['environments']['items'][1])->toMatchArray(['ctaLabel' => 'Demander un devis', 'href' => '/demander-un-devis'])
        ->and($s['care']['cta'])->toBeNull()
        ->and($s['products']['cta'])->toBe(['label' => 'Voir toute la climatisation', 'href' => '/climatisation'])
        ->and(array_column($s['care']['items'], 'title'))->toBe(['Installation', 'Visite technique', 'Conseil'])
        ->and(array_column($s['technology']['items'], 'icon'))->toBe(['inverter', 'refrigerant', 'connected', 'climate', 'quiet'])
        ->and($s['advisor']['title'])->toBe('Le bon climatiseur. Pour le bon espace.')
        ->and($s['brands']['title'])->toBe('Des marques reconnues. Une expertise de confiance.')
        ->and($s['final']['secondary'])->toBe(['label' => 'Contacter ARFRO', 'href' => '/contact'])
        // Nothing real yet: no project, no testimonial, no Arfro article.
        ->and($s['projects'])->toBeNull()
        ->and($s['testimonials'])->toBeNull()
        ->and($s['journal'])->toBeNull()
        ->and($arfro['facts'])->toMatchArray(['hours' => 'Lundi – Samedi, 9h – 19h', 'cardPayment' => false, 'technicalVisitPrice' => 30000]);

    // Collections: real product cards of their ranges; several ranges, no « Voir tout » link.
    $collections = collect($s['products']['collections']);
    $pro = $collections->firstWhere('label', 'Solutions professionnelles');
    expect($collections->pluck('label')->all())->toBe(['Climatisation', 'Chauffe-eau', 'Ventilation', 'Solutions professionnelles'])
        ->and($pro['href'])->toBeNull()
        ->and($pro['products'])->not->toBeEmpty()
        ->and(collect($pro['products'])->pluck('href')->every(fn (string $href) => preg_match('~(gainable|cassette|armoire|console)~', $href) === 1))->toBeTrue()
        ->and($collections->firstWhere('label', 'Climatisation')['href'])->toBe('/climatisation')
        ->and($collections->firstWhere('label', 'Climatisation')['products'])->not->toBeEmpty()
        ->and(count($collections->firstWhere('label', 'Climatisation')['products']))->toBeLessThanOrEqual(8)
        ->and($collections->firstWhere('label', 'Climatisation')['products'][0])->toHaveKeys(['name', 'href', 'price']);
});

it('replaces the Réglages placeholders in the texts', function () {
    $nb = "\u{00A0}";
    $care = collect(arfroHome()['sections']['care']['items'])->keyBy('icon');
    expect($care['visit']['text'])->toEndWith("300{$nb}Dhs.") // French typography may add a narrow space before « : »
        ->and($care['visit']['cta'])->toBe(['label' => 'Demander une visite', 'href' => 'https://wa.me/212666854184'])
        ->and($care['advice']['text'])->toBe('Un conseiller vous répond au 0666-088348, par téléphone ou WhatsApp. Lundi – Samedi, 9h – 19h.')
        ->and($care['advice']['cta'])->toBe(['label' => 'Appeler un conseiller', 'href' => 'tel:+212666088348']);

    // Without a « Conseil » number, the sales number is used.
    $general = new ArfroGeneralSettings;
    $general->phones = array_values(array_filter($general->phones, fn (array $p) => $p['label'] !== 'Conseil'));
    $general->save();
    $care = collect(arfroHome()['sections']['care']['items'])->keyBy('icon');
    expect($care['advice']['text'])->toContain('au '.$general->sales_phone.',')
        ->and(arfroHome()['facts']['advicePhone']['label'])->toBe('Ventes');

    $trust = collect(arfroHome()['sections']['trust']['items'])->keyBy('icon');
    expect($trust['payment']['text'])->toBe('Vous réglez à la réception de votre commande.');

    $payment = new ArfroPaymentSettings;
    $payment->cmi_enabled = true;
    $payment->cmi_client_id = '600000000';
    $payment->cmi_store_key = 'cle-de-test';
    $payment->save();

    $trust = collect(arfroHome()['sections']['trust']['items'])->keyBy('icon');
    expect($trust['payment']['text'])->toBe('Vous réglez à la réception de votre commande ou en ligne par carte bancaire.');
});

it('hides switched-off and empty sections, keeps only published projects and safe links', function () {
    $home = new ArfroHomeSettings;
    $home->section_manifesto = ['enabled' => false] + $home->section_manifesto;
    $home->section_final = ['cta_url' => 'javascript:alert(1)', 'secondary_url' => '//evil.example'] + $home->section_final;
    $home->section_hero = ['image' => 'accueil-arfro/salon.webp', 'design_image' => 'inconnu.png'] + $home->section_hero;
    $home->section_technology = ['items' => [['icon' => 'licorne', 'title' => 'Inverter', 'text' => null, 'url' => 'https://example.com/x']]] + $home->section_technology;
    $home->section_projects = ['items' => [
        ['title' => 'Riad à Marrakech', 'location' => 'Marrakech', 'type' => 'Hôtellerie', 'products' => 'LG Dual Inverter', 'description' => 'Projet réel.', 'image' => null, 'published' => true],
        ['title' => 'Brouillon', 'location' => null, 'type' => null, 'products' => null, 'description' => null, 'image' => null, 'published' => false],
    ]] + $home->section_projects;
    $home->section_testimonials = ['items' => [
        ['author' => 'Client', 'location' => null, 'type' => null, 'products' => null, 'quote' => 'Très bien.', 'image' => null, 'published' => false],
    ]] + $home->section_testimonials;
    $home->save();

    $s = arfroHome()['sections'];
    expect($s['manifesto'])->toBeNull()
        ->and($s['final']['cta'])->toBeNull()
        ->and($s['final']['secondary'])->toBeNull()
        ->and($s['hero']['image']['src'])->toEndWith('/accueil-arfro/salon.webp')
        ->and($s['technology']['items'][0])->toBe(['icon' => null, 'title' => 'Inverter', 'text' => null, 'href' => 'https://example.com/x'])
        ->and($s['projects']['items'])->toHaveCount(1)
        ->and($s['projects']['items'][0]['title'])->toBe('Riad à Marrakech')
        ->and($s['testimonials'])->toBeNull();
});

it('lists the published Arfro articles in the journal', function () {
    Article::query()->where('is_published', true)->firstOrFail()->update(['sites' => ['cm', 'arfro']]);

    $journal = arfroHome()['sections']['journal'];
    expect($journal['cta'])->toBe(['label' => 'Explorer nos conseils', 'href' => '/blog'])
        ->and($journal['articles'])->toHaveCount(1)
        ->and($journal['articles'][0])->toHaveKeys(['title', 'href', 'excerpt', 'cover']);
});

it('links to editorial pages and hubs only once they are published on Arfro', function () {
    $home = new ArfroHomeSettings;
    $environments = $home->section_environments;
    $environments['items'][3]['cta_url'] = '/solutions';
    $home->section_environments = $environments;
    $home->save();

    // « À propos » is published on Climatisation Maroc only.
    expect(arfroHome()['sections']['manifesto']['cta'])->toBeNull();

    Page::query()->where('slug', 'a-propos')->firstOrFail()->update(['sites' => ['cm', 'arfro']]);
    ServicePage::query()->where('slug', 'visite-technique')->firstOrFail()->update(['sites' => ['cm', 'arfro']]);
    SectorPage::query()->where('slug', 'restaurants')->firstOrFail()->update(['sites' => ['cm', 'arfro']]);

    $s = arfroHome()['sections'];
    expect($s['manifesto']['cta'])->toBe(['label' => 'Découvrir ARFRO', 'href' => '/a-propos'])
        ->and($s['care']['cta'])->toBe(['label' => 'Découvrir nos services', 'href' => '/services'])
        ->and($s['environments']['items'][3]['href'])->toBe('/solutions');
});

it('accepts a single category path saved as text', function () {
    $home = new ArfroHomeSettings;
    $home->section_products = ['collections' => [['label' => 'Muraux', 'category' => 'climatisation/mural', 'product_ids' => []]]] + $home->section_products;
    $home->save();

    $collections = arfroHome()['sections']['products']['collections'];
    expect($collections)->toHaveCount(1)
        ->and($collections[0]['href'])->toBe('/climatisation/mural')
        ->and($collections[0]['products'])->not->toBeEmpty();
});

it('drops the cached home as soon as the Arfro home settings are saved', function () {
    $this->getJson('/api/v1/home', ['X-Site' => 'arfro'])->assertHeader('X-Api-Cache', 'MISS');
    $this->getJson('/api/v1/home', ['X-Site' => 'arfro'])->assertHeader('X-Api-Cache', 'HIT');

    $home = new ArfroHomeSettings;
    $home->section_hero = ['title' => 'Le confort, notre signature.'] + $home->section_hero;
    $home->save();

    $this->getJson('/api/v1/home', ['X-Site' => 'arfro'])->assertHeader('X-Api-Cache', 'MISS')
        ->assertJsonPath('arfro.sections.hero.title', 'Le confort, notre signature.');
});

it('edits the sections in « Page d’accueil — Arfro » and keeps the Climatisation Maroc form', function () {
    $admin = User::factory()->create();
    $admin->assignRole(User::ROLE_ADMIN);
    $this->actingAs($admin);

    Livewire::test(ManageArfroHomeSettings::class)
        ->assertSee('ARFRO Care')
        ->set('data.section_hero.title', 'Le confort, notre signature.')
        ->set('data.section_hero.cta_url', 'javascript:alert(1)')
        ->call('save')
        ->assertHasFormErrors(['section_hero.cta_url']);

    Livewire::test(ManageArfroHomeSettings::class)
        ->set('data.section_hero.title', 'Le confort, notre signature.')
        ->set('data.section_advisor.enabled', false)
        ->set('data.section_final.cta_url', '{whatsapp}')
        ->call('save')
        ->assertHasNoFormErrors();

    $home = new ArfroHomeSettings;
    expect($home->section_hero['title'])->toBe('Le confort, notre signature.')
        ->and($home->section_hero['eyebrow'])->toBe('ARFRO — Expert du confort climatique')
        ->and(array_column($home->section_environments['items'], 'key'))->toBe(['maison', 'bureaux', 'hotellerie', 'restauration'])
        ->and($home->section_advisor['enabled'])->toBeFalse()
        ->and($home->section_final['cta_url'])->toBe('{whatsapp}')
        ->and(array_column($home->section_products['collections'], 'category'))->toBe([
            ['climatisation'], ['chauffe-eau'], ['ventilation'], ['climatisation/cassette', 'climatisation/gainable', 'climatisation/console-armoire'],
        ]);

    Livewire::test(ManageHomeSettings::class)->assertDontSee('ARFRO Care')->assertSee('Bandeau principal');
});
