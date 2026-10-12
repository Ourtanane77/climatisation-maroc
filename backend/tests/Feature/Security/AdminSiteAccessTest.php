<?php

use App\Enums\LeadType;
use App\Enums\OrderStatus;
use App\Models\Lead;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/*
| Back-office extras outside Filament (order print sheet, lead attachment): a manager restricted to
| some sites (users.sites) cannot open another site's records by URL; admins manage every site.
*/

beforeEach(function () {
    Storage::fake('local');
    Role::findOrCreate(User::ROLE_MANAGER, 'web');
    Role::findOrCreate(User::ROLE_ADMIN, 'web');

    foreach (['cm' => 'CM-2026-00001', 'arfro' => 'AR-2026-00001'] as $site => $reference) {
        $this->orders[$site] = Order::query()->create([
            'site' => $site, 'reference' => $reference, 'access_token' => Str::random(40), 'customer_name' => 'Client',
            'phone' => '0612345678', 'city_name' => 'Marrakech', 'address' => '24 rue Ibn Sina',
            'status' => OrderStatus::Nouvelle, 'subtotal' => 0, 'total' => 0,
        ]);
        Storage::disk('local')->put("leads/{$site}.pdf", 'plan');
        $this->leads[$site] = Lead::query()->create([
            'site' => $site, 'type' => LeadType::Devis, 'phone' => '0612345678', 'attachment_path' => "leads/{$site}.pdf",
        ]);
    }
});

it('refuses another site\'s order sheet and lead attachment to a manager restricted to one site', function () {
    $manager = User::factory()->create(['sites' => ['cm']]);
    $manager->assignRole(User::ROLE_MANAGER);
    $this->actingAs($manager);

    $this->get(route('admin.orders.print', $this->orders['cm']))->assertOk()->assertSee('CM-2026-00001');
    $this->get(route('admin.orders.print', $this->orders['arfro']))->assertNotFound();
    $this->get(route('admin.leads.attachment', $this->leads['cm']))->assertOk();
    $this->get(route('admin.leads.attachment', $this->leads['arfro']))->assertNotFound();
});

it('lets admins and unrestricted managers open every site\'s records', function () {
    $admin = User::factory()->create(['sites' => ['cm']]);
    $admin->assignRole(User::ROLE_ADMIN);
    $manager = User::factory()->create();
    $manager->assignRole(User::ROLE_MANAGER);

    foreach ([$admin, $manager] as $user) {
        $this->actingAs($user);
        $this->get(route('admin.orders.print', $this->orders['arfro']))->assertOk()->assertSee('AR-2026-00001');
        $this->get(route('admin.leads.attachment', $this->leads['arfro']))->assertOk();
    }
});
