<?php

use App\Support\Frontend\Revalidator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

it('asks the front office to expire its cached API data', function () {
    config(['shop.revalidate_secret' => 'test-secret', 'shop.frontend_internal_url' => 'http://next:3000']);
    Http::fake(['next:3000/*' => Http::response(['revalidated' => ['api']])]);

    expect(Revalidator::send())->toBeTrue();

    Http::assertSent(fn (Request $request) => $request->url() === 'http://next:3000/api/revalidate'
        && $request->header('X-Revalidate-Secret') === ['test-secret']
        && $request['tags'] === ['api']);
});

it('never fails the back office when the front office is down', function () {
    config(['shop.revalidate_secret' => 'test-secret']);
    Http::fake(fn () => throw new ConnectionException('down'));

    expect(Revalidator::send())->toBeFalse();
});
