<?php

namespace App\Filament\Widgets;

use App\Enums\LeadStatus;
use App\Enums\OrderStatus;
use App\Enums\ResellerStatus;
use App\Filament\Resources\Leads\LeadResource;
use App\Filament\Resources\Orders\OrderResource;
use App\Filament\Resources\Products\ProductResource;
use App\Filament\Resources\Resellers\ResellerAccountResource;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Product;
use App\Models\ResellerAccount;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;

/** Dashboard: new orders, new leads, products, promotions, resellers to validate, items to verify. */
class ShopOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $newOrders = Order::query()->where('status', OrderStatus::Nouvelle)->count();
        $ordersToday = Order::query()->whereDate('created_at', today())->count();
        $newLeads = Lead::query()->where('status', LeadStatus::Nouveau)->count();
        $published = Product::query()->published()->count();
        $promotions = Product::query()->published()
            ->whereHas('variants', fn (Builder $v) => $v->whereNotNull('promo_price')->whereColumn('promo_price', '<', 'price'))->count();
        $pending = ResellerAccount::query()->where('status', ResellerStatus::EnAttente)->count();
        $toVerify = Product::query()->needsVerification()->count();

        return [
            Stat::make('Nouvelles commandes', $newOrders)
                ->description($ordersToday.' aujourd’hui')
                ->color($newOrders ? 'warning' : 'gray')
                ->url(OrderResource::getUrl('index', ['tab' => 'nouvelle'])),
            Stat::make('Nouvelles demandes', $newLeads)
                ->description('Devis, contact, revendeurs, secteurs')
                ->color($newLeads ? 'danger' : 'gray')
                ->url(LeadResource::getUrl('index')),
            Stat::make('Produits publiés', $published)
                ->description($promotions.' en promotion')
                ->url(ProductResource::getUrl('index')),
            Stat::make('Revendeurs à valider', $pending)
                ->color($pending ? 'warning' : 'gray')
                ->url(ResellerAccountResource::getUrl('index')),
            Stat::make('Fiches à vérifier', $toVerify)
                ->description('Référence ou prix à confirmer')
                ->color($toVerify ? 'warning' : 'success')
                ->url(ProductResource::getUrl('index', ['filters' => ['a_verifier' => ['isActive' => true]]])),
        ];
    }
}
