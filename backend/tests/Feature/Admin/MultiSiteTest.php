<?php

use App\Filament\Pages\ManageArfroGeneralSettings;
use App\Filament\Pages\ManageArfroHomeSettings;
use App\Filament\Pages\ManageGeneralSettings;
use App\Filament\Pages\ManageHomeSettings;
use App\Filament\Resources\Articles\Pages\EditArticle;
use App\Filament\Resources\Articles\Pages\ListArticles;
use App\Filament\Resources\Leads\LeadResource;
use App\Filament\Resources\Leads\Pages\ListLeads;
use App\Filament\Resources\Orders\OrderResource;
use App\Filament\Resources\Orders\Pages\ListOrders;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Resources\Users\Pages\ManageUsers;
use App\Models\Article;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Settings\ArfroGeneralSettings;
use App\Settings\GeneralSettings;
use Filament\Actions\Testing\TestAction;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;

/*
| Two storefronts in one back office (config/sites.php): records of each site, visibility per site,
| per-site texts and slugs, users restricted to a site, settings per site.
*/

beforeEach(function () {
    $this->seed();
    $this->admin = User::factory()->create();
    $this->admin->assignRole(User::ROLE_ADMIN);
});

function siteManager(array $sites): User
{
    $user = User::factory()->create(['sites' => $sites]);
    $user->assignRole(User::ROLE_MANAGER);

    return $user;
}

/** An Arfro copy of a seeded order. */
function arfroOrder(): Order
{
    $order = Order::query()->firstOrFail()->replicate();
    $order->site = 'arfro';
    $order->reference = 'AR-2026-00001';
    $order->save();

    return $order;
}

it('shows a site-restricted manager the orders and leads of their site only', function () {
    $cmOrder = Order::query()->firstOrFail();
    $arOrder = arfroOrder();
    $cmLead = Lead::query()->firstOrFail();
    $arLead = $cmLead->replicate();
    $arLead->site = 'arfro';
    $arLead->save();

    $this->actingAs(siteManager(['arfro']));

    Livewire::test(ListOrders::class)
        ->assertCanSeeTableRecords([$arOrder])
        ->assertCanNotSeeTableRecords([$cmOrder]);
    Livewire::test(ListLeads::class)
        ->assertCanSeeTableRecords([$arLead])
        ->assertCanNotSeeTableRecords([$cmLead]);

    $this->get(OrderResource::getUrl('view', ['record' => $arOrder]))->assertOk()->assertSee('Arfro');
    $this->get(OrderResource::getUrl('view', ['record' => $cmOrder]))->assertNotFound();
    $this->get(LeadResource::getUrl('view', ['record' => $cmLead]))->assertNotFound();

    // An admin sees both sites.
    $this->actingAs($this->admin);
    Livewire::test(ListOrders::class)->assertCanSeeTableRecords([$arOrder, $cmOrder]);
});

/** A product without photos (seeded photo files are not in the test storage, the form would refuse them). */
function productWithoutImages(): Product
{
    return Product::query()->doesntHave('images')->orderBy('id')->firstOrFail();
}

it('saves the sites and the Arfro texts of a product', function () {
    $product = productWithoutImages();
    $this->actingAs($this->admin);

    Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
        ->set('data.sites', ['arfro'])
        ->set('data.site_content.arfro.name', 'LG Dual Inverter (Arfro)')
        ->set('data.site_content.arfro.short_description', 'Texte court réécrit pour Arfro.')
        ->set('data.site_content.arfro.seo_title', 'Climatiseur LG chez Arfro')
        ->call('save')
        ->assertHasNoFormErrors();

    $product->refresh();
    expect($product->sites)->toBe(['arfro'])
        ->and($product->site_content['arfro']['name'])->toBe('LG Dual Inverter (Arfro)')
        ->and($product->siteText('short_description', 'arfro'))->toBe('Texte court réécrit pour Arfro.')
        ->and($product->siteOverride('seo_title', 'arfro'))->toBe('Climatiseur LG chez Arfro')
        ->and($product->siteOverride('description', 'arfro'))->toBeNull();

    Livewire::test(ListProducts::class)
        ->filterTable('site_text_missing_arfro', true)
        ->assertCanNotSeeTableRecords([$product]);
});

it('keeps the sites and texts a restricted manager does not manage', function () {
    $product = productWithoutImages();
    $product->update(['sites' => ['cm', 'arfro'], 'site_content' => ['arfro' => ['name' => 'Nom Arfro']]]);
    $this->actingAs(siteManager(['cm']));

    // Unticks every site and tampers with the Arfro text: only Climatisation Maroc changes.
    Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
        ->set('data.sites', [])
        ->set('data.site_content.arfro.name', 'Modifié')
        ->call('save')
        ->assertHasNoFormErrors();

    $product->refresh();
    expect($product->sites)->toBe(['arfro'])
        ->and($product->site_content['arfro']['name'])->toBe('Nom Arfro');
});

it('hides products from one site in bulk', function () {
    $product = Product::query()->where('slug', 'lg-dual-inverter')->firstOrFail();
    $this->actingAs($this->admin);

    Livewire::test(ListProducts::class)
        ->selectTableRecords([$product->getKey()])
        ->callAction(TestAction::make('hide_from_arfro')->table()->bulk());

    expect($product->fresh()->sites)->toBe(['cm']);
});

it('checks editorial slugs per site', function () {
    [$first, $second] = Article::query()->orderBy('id')->take(2)->get()->all();
    $this->actingAs($this->admin);

    Livewire::test(EditArticle::class, ['record' => $second->getRouteKey()])
        ->set('data.slug', $first->slug)
        ->call('save')
        ->assertHasFormErrors(['slug']);

    // Same address on the other site only: accepted.
    Livewire::test(EditArticle::class, ['record' => $second->getRouteKey()])
        ->set('data.slug', $first->slug)
        ->set('data.sites', ['arfro'])
        ->call('save')
        ->assertHasNoFormErrors();
    expect($second->fresh()->slug)->toBe($first->slug);
});

it('duplicates an article for Arfro, unpublished, with its SEO and FAQ', function () {
    $article = Article::query()->where('is_published', true)->firstOrFail();
    $article->seo()->updateOrCreate([], ['title' => 'Titre SEO']);
    $article->faqItems()->create(['question' => 'Question ?', 'answer' => 'Réponse.', 'position' => 1]);
    $this->actingAs($this->admin);

    Livewire::test(ListArticles::class)->callAction(TestAction::make('duplicate_for_arfro')->table($article));

    $copy = Article::query()->whereKeyNot($article->getKey())->where('slug', $article->slug)->firstOrFail();
    expect($copy->sites)->toBe(['arfro'])
        ->and($copy->is_published)->toBeFalse()
        ->and($copy->seo?->title)->toBe('Titre SEO')
        ->and($copy->faqItems()->count())->toBe($article->faqItems()->count());
});

it('assigns the sites a user manages', function () {
    $this->actingAs($this->admin);
    $role = Role::query()->where('name', User::ROLE_MANAGER)->firstOrFail();

    runAction(Livewire::test(ManageUsers::class), 'create', [
        'name' => 'Gestionnaire Arfro', 'email' => 'arfro@example.ma', 'password' => 'un-mot-de-passe-long',
        'roles' => [$role->getKey()], 'sites' => ['arfro'],
    ])->assertHasNoActionErrors();
    runAction(Livewire::test(ManageUsers::class), 'create', [
        'name' => 'Gestionnaire tous sites', 'email' => 'tous@example.ma', 'password' => 'un-mot-de-passe-long',
        'roles' => [$role->getKey()], 'sites' => [],
    ])->assertHasNoActionErrors();

    $arfro = User::query()->where('email', 'arfro@example.ma')->firstOrFail();
    expect($arfro->sites)->toBe(['arfro'])
        ->and($arfro->managedSites())->toBe(['arfro'])
        ->and(User::query()->where('email', 'tous@example.ma')->firstOrFail()->sites)->toBeNull();
});

it('saves the Arfro settings in their own group', function () {
    $this->actingAs($this->admin);
    $before = app(GeneralSettings::class)->hours;

    Livewire::test(ManageArfroGeneralSettings::class)
        ->assertSee('Réglages — Arfro')
        ->set('data.hours', 'Lun–Sam 9 h – 18 h (Arfro)')
        ->call('save')
        ->assertHasNoFormErrors();

    expect(json_decode((string) DB::table('settings')->where('group', 'general_arfro')->where('name', 'hours')->value('payload')))
        ->toBe('Lun–Sam 9 h – 18 h (Arfro)')
        ->and((new ArfroGeneralSettings)->hours)->toBe('Lun–Sam 9 h – 18 h (Arfro)')
        ->and((new GeneralSettings)->hours)->toBe($before);
});

it('opens the settings of a site to the users managing it', function () {
    $this->actingAs(siteManager(['cm']));
    $this->get(ManageHomeSettings::getUrl())->assertOk();
    $this->get(ManageArfroHomeSettings::getUrl())->assertForbidden();
    $this->get(ManageArfroGeneralSettings::getUrl())->assertForbidden(); // Réglages: admins only

    $this->actingAs($this->admin);
    $this->get(ManageGeneralSettings::getUrl())->assertOk();
    $this->get(ManageArfroGeneralSettings::getUrl())->assertOk();
    $this->get(ManageArfroHomeSettings::getUrl())->assertOk();
});

it('lists only the content shown on the sites a manager handles', function () {
    $product = Product::query()->where('slug', 'lg-dual-inverter')->firstOrFail();
    $product->update(['sites' => ['cm']]);
    $this->actingAs(siteManager(['arfro']));

    Livewire::test(ListProducts::class)->assertCanNotSeeTableRecords([$product]);
    $this->get("/admin/products/{$product->getKey()}/edit")->assertNotFound();
});

it('links the edit page to each site showing the record', function () {
    $product = productWithoutImages();
    $product->update(['sites' => ['arfro']]);

    $this->actingAs($this->admin)->get("/admin/products/{$product->getKey()}/edit")->assertOk()
        ->assertSee('Voir sur Arfro')->assertDontSee('Voir sur Climatisation Maroc');
});
