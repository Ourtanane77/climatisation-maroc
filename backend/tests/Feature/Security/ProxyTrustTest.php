<?php

/*
| X-Forwarded-For is only trusted from the private Docker network (config/trustedproxy.php):
| a visitor cannot forge a private address to escape the public read limit.
*/

it('ignores a forged X-Forwarded-For from a public address', function () {
    $public = ['REMOTE_ADDR' => '41.140.20.30', 'HTTP_X_FORWARDED_FOR' => '10.0.0.9'];

    $statuses = collect(range(1, 121))->map(fn () => $this->withServerVariables($public)->getJson('/api/v1/cities')->status());

    expect($statuses->first())->toBe(200)
        ->and($statuses->last())->toBe(429);
});

it('keeps the internal Next.js server unlimited and reads the visitor IP it forwards', function () {
    // The Next server (private address) forwards the visitor's IP for the form limits.
    $request = Illuminate\Http\Request::create('/api/v1/cities', server: ['REMOTE_ADDR' => '172.27.0.5', 'HTTP_X_FORWARDED_FOR' => '41.140.20.30']);
    app()->instance('request', $request);
    Illuminate\Http\Request::setTrustedProxies(config('trustedproxy.proxies'), Illuminate\Http\Request::HEADER_X_FORWARDED_FOR);

    expect($request->ip())->toBe('41.140.20.30');

    $statuses = collect(range(1, 125))->map(fn () => $this->withServerVariables(['REMOTE_ADDR' => '172.27.0.5'])->getJson('/api/v1/cities')->status());
    expect($statuses->unique()->all())->toBe([200]);
});
