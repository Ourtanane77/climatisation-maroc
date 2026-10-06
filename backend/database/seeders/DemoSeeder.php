<?php

namespace Database\Seeders;

use App\Enums\LeadStatus;
use App\Enums\LeadType;
use App\Enums\OrderStatus;
use App\Enums\ResellerStatus;
use App\Models\City;
use App\Models\Lead;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\ResellerAccount;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Demo records from the design states (order CM-2026-01042, Froid Atlas reseller, a quote request).
 * Development only: never run in production (see DatabaseSeeder).
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $marrakech = City::query()->where('slug', 'marrakech')->firstOrFail();

        $password = config('shop.seed.reseller_password');
        if ($password) {
            $user = User::query()->firstOrCreate(['email' => 'contact@froid-atlas.ma'], [
                'name' => 'Hicham Ouali',
                'phone' => '0661234567',
                'password' => $password,
            ]);
            $user->syncRoles([User::ROLE_RESELLER]);
            ResellerAccount::query()->updateOrCreate(['user_id' => $user->id], [
                'company' => 'Froid Atlas SARL',
                'ice' => '001528749000012',
                'city_id' => $marrakech->id,
                'activity' => 'installateur',
                'contact_name' => 'Hicham Ouali',
                'phone' => '0661234567',
                'status' => ResellerStatus::Valide,
                'decided_at' => now(),
            ]);
        }

        if (! Order::query()->where('reference', 'CM-2026-01042')->exists()) {
            $lines = [['D13AJH.N', 1], ['CUIV0018', 1], ['CLIM00076', 2]];
            $order = Order::query()->create([
                'reference' => 'CM-2026-01042',
                'access_token' => Str::random(40),
                'customer_name' => 'Yassine El Amrani',
                'phone' => '0612345678',
                'city_id' => $marrakech->id,
                'city_name' => $marrakech->name,
                'address' => '24 rue Ibn Sina, Guéliz',
                'status' => OrderStatus::Nouvelle,
                'subtotal' => 0,
                'total' => 0,
            ]);
            $subtotal = 0;
            foreach ($lines as [$sku, $qty]) {
                $variant = ProductVariant::query()->with('product')->where('sku', $sku)->firstOrFail();
                $unit = $variant->sellingPrice();
                $order->lines()->create([
                    'product_variant_id' => $variant->id,
                    'sku' => $sku,
                    'name' => $variant->product->name,
                    'variant_label' => $variant->label,
                    'unit_price' => $unit,
                    'qty' => $qty,
                    'line_total' => $unit * $qty,
                ]);
                $subtotal += $unit * $qty;
            }
            $order->update(['subtotal' => $subtotal, 'total' => $subtotal]);
            $order->history()->create(['status' => OrderStatus::Nouvelle->value]);
            $order->transitionTo(OrderStatus::Confirmee);
        }

        Lead::query()->firstOrCreate(['type' => LeadType::Devis, 'phone' => '0661234567', 'name' => 'Karim Benali'], [
            'status' => LeadStatus::Nouveau,
            'customer_kind' => 'particulier',
            'city_id' => $marrakech->id,
            'city_name' => $marrakech->name,
            'project_type' => 'Nouvelle installation',
            'space_type' => 'Appartement',
            'surface' => 40,
            'message' => 'Demande de démonstration.',
        ]);
    }
}
