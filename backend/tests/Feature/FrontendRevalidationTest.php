<?php

use App\Support\Frontend\Revalidator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    config([
        'shop.revalidate_secret' => 'test-secret',
        'sites.sites.cm.frontend_internal_url' => 'http://next:3000',
        'sites.sites.arfro.frontend_internal_url' => 'http://next-arfro:3000',
    ]);
});

it('asks every storefront to expire its cached API data', function () {
    Http::fake([
        'next:3000/*' => Http::response(['revalidated' => ['api']]),
        'next-arfro:3000/*' => Http::response(['revalidated' => ['api']]),
    ]);

    expect(Revalidator::send())->toBeTrue();

    Http::assertSentCount(2);
    foreach (['http://next:3000/api/revalidate', 'http://next-arfro:3000/api/revalidate'] as $url) {
        Http::assertSent(fn (Request $request) => $request->url() === $url
            && $request->header('X-Revalidate-Secret') === ['test-secret']
            && $request['tags'] === ['api']);
    }
});

it('still revalidates the other storefronts when one is down', function () {
    Log::spy();
    Http::fake(function (Request $request) {
        if (str_contains($request->url(), 'next-arfro')) {
            throw new ConnectionException('down');
        }

        return Http::response(['revalidated' => ['api']]);
    });

    expect(Revalidator::send())->toBeFalse();

    Http::assertSent(fn (Request $request) => $request->url() === 'http://next:3000/api/revalidate');
    Log::shouldHaveReceived('warning')->once()->withArgs(fn (string $message, array $context) => $context['site'] === 'arfro');
});

it('reports a storefront that refuses the call', function () {
    Http::fake([
        'next:3000/*' => Http::response(['error' => 'forbidden'], 403),
        'next-arfro:3000/*' => Http::response(['revalidated' => ['api']]),
    ]);

    expect(Revalidator::send())->toBeFalse();
});

it('never fails the back office when the front offices are down', function () {
    Http::fake(fn () => throw new ConnectionException('down'));

    expect(Revalidator::send())->toBeFalse();
});
