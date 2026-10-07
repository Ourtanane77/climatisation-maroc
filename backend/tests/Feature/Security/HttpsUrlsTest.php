<?php

use App\Providers\AppServiceProvider;
use Illuminate\Support\Facades\URL;

/*
| Production behind Cloudflare + Traefik: the request may reach PHP as http, but the generated
| URLs (Livewire, Filament assets, links) must be https or the browser blocks them as mixed content.
*/

afterEach(fn () => URL::forceScheme(null));

function bootProvider(string $env, string $appUrl): void
{
    app()->detectEnvironment(fn () => $env);
    config(['app.url' => $appUrl]);
    (new AppServiceProvider(app()))->boot();
}

it('generates https URLs in production when APP_URL is https, even for an http request', function () {
    bootProvider('production', 'https://app.arfro.com');

    $this->get('http://app.arfro.com/up');
    expect(url('/livewire/update'))->toStartWith('https://');
});

it('keeps http when APP_URL is http, so a local production test still works', function () {
    bootProvider('production', 'http://localhost:8090');

    expect(url('/livewire/update'))->toStartWith('http://');
});

it('does not force https outside production', function () {
    bootProvider('local', 'https://app.arfro.com');

    expect(url('/livewire/update'))->toStartWith('http://');
});
