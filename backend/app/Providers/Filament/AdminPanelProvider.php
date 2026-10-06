<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->brandName('Climatisation Maroc')
            // Brand colours from the design. Filament picks button shades from 500/600 with a contrast
            // check, so those are pinned to the exact design colours (white text on #0B5CAD).
            ->colors([
                'primary' => array_replace(Color::hex('#0B5CAD'), [500 => '#0B5CAD', 600 => '#0B5CAD', 700 => '#084683']),
                'warning' => array_replace(Color::hex('#F4731F'), [500 => '#D85A17', 600 => '#C4501A', 700 => '#A8461A']),
                'danger' => array_replace(Color::hex('#C4501A'), [500 => '#C4501A', 600 => '#C4501A', 700 => '#A8461A']),
                'success' => array_replace(Color::hex('#1F9D57'), [500 => '#1F9D57', 600 => '#1F9D57', 700 => '#187D45']),
            ])
            ->font('Figtree')
            ->darkMode(false)
            ->databaseNotifications()
            ->sidebarCollapsibleOnDesktop()
            ->navigationGroups(['Catalogue', 'Ventes', 'Contenu', 'Configuration'])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
