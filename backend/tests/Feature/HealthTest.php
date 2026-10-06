<?php

it('answers the API health check under /api/v1', function () {
    $this->getJson('/api/v1/health')
        ->assertOk()
        ->assertJsonPath('status', 'ok');
});

it('answers the Laravel up check', function () {
    $this->get('/up')->assertOk();
});
