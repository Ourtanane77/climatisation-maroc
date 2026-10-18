<?php

use App\Support\Sites\Sites;

/*
| A site's URL on the other site's production domain is a deployment mistake: refused.
*/

it('refuses a site URL on the other site\'s domain', function () {
    config(['sites.sites.cm.url' => 'https://www.arfro.com']);
    config(['sites.sites.arfro.url' => 'https://climatisationmaroc.com/']);

    expect(Sites::get('cm')->url)->toBe('https://climatisationmaroc.com')
        ->and(Sites::get('arfro')->url)->toBe('https://arfro.com')
        ->and(Sites::all()['cm']->url)->toBe('https://climatisationmaroc.com');
});

it('keeps a site URL of its own', function () {
    config(['sites.sites.cm.url' => 'https://www.climatisationmaroc.com']);
    config(['sites.sites.arfro.url' => 'http://arfro.localhost:8080']);

    expect(Sites::get('cm')->url)->toBe('https://www.climatisationmaroc.com')
        ->and(Sites::get('arfro')->url)->toBe('http://arfro.localhost:8080');
});
