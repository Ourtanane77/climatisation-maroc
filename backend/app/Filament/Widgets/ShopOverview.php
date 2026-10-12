<?php

namespace App\Filament\Widgets;

use App\Enums\LeadStatus;
use App\Enums\OrderStatus;
use App\Enums\ResellerStatus;
use App\Filament\Forms\SiteFields;
use App\Filament\Resources\Leads\LeadResource;
use App\Filament\Resources\Orders\OrderResource;
use App\Filament\Resources\Products\ProductResource;
use App\Filament\Resources\Resellers\ResellerAccountResource;
use App\Filament\Support\SiteScope;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;

/**
 * Dashboard: new orders, new leads, products, promotions, resellers to validate, items to verify.
 * Counts cover the sites the user manages (the resources' scoped queries), split per site when
 * there are several.
 */
class ShopOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $newOrdersQuery = OrderResource::getEloquentQuery()->where('status', OrderStatus::Nouvelle);
        $newOrders = (clone $newOrdersQuery)->count();
        $ordersToday = OrderResource::getEloquentQuery()->whereDate('created_at', today())->count();
        $newLeadsQuery = LeadResource::getEloquentQuery()->where('status', LeadStatus::Nouveau);
        $newLeads = (clone $newLeadsQuery)->count();
        $published = SiteScope::content(Product::query())->published()->count();
        $promotions = SiteScope::content(Product::query())->published()
            ->whereHas('variants', fn (Builder $v) => $v->whereNotNull('promo_price')->whereColumn('promo_price', '<', 'price'))->count();
        $pending = ResellerAccountResource::getEloquentQuery()->where('status', ResellerStatus::EnAttente)->count();
        $toVerify = SiteScope::content(Product::query())->needsVerification()->count();

        $ordersBySite = SiteFields::breakdown($newOrdersQuery);
        $leadsBySite = SiteFields::breakdown($newLeadsQuery);

        return [
            Stat::make('Nouvelles commandes', $newOrders)
                ->description($ordersToday.' aujourd’hui'.($ordersBySite ? ' · '.$ordersBySite : ''))
                ->color($newOrders ? 'warning' : 'gray')
                ->url(OrderResource::getUrl('index', ['tab' => 'nouvelle'])),
            Stat::make('Nouvelles demandes', $newLeads)
                ->description($leadsBySite ?? 'Devis, contact, revendeurs, secteurs')
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
