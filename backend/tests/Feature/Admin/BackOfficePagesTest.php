<?php

use App\Models\User;
use Filament\Facades\Filament;
use Filament\Resources\Resource;

/*
| Every back-office resource renders its list, create and edit pages for an admin,
| on the fully seeded database (catalogue, content, demo records).
*/

beforeEach(function () {
    $this->seed();
    $this->admin = User::factory()->create();
    $this->admin->assignRole(User::ROLE_ADMIN);
});

it('renders every resource page', function () {
    $this->withoutExceptionHandling();
    $this->actingAs($this->admin);
    $checked = 0;

    /** @var class-string<resource> $resource */
    foreach (Filament::getPanel('admin')->getResources() as $resource) {
        $pages = $resource::getPages();

        $this->get($resource::getUrl('index'))->assertOk();
        $checked++;

        if (isset($pages['create']) && $resource::canCreate()) {
            $this->get($resource::getUrl('create'))->assertOk();
        }

        $record = $resource::getModel()::query()->first();
        foreach (['edit', 'view'] as $page) {
            if ($record && isset($pages[$page])) {
                $this->get($resource::getUrl($page, ['record' => $record]))->assertOk();
            }
        }
    }

    expect($checked)->toBeGreaterThan(0);
});

it('renders the dashboard and settings pages', function () {
    $this->actingAs($this->admin)->get('/admin')->assertOk();
    foreach (Filament::getPanel('admin')->getPages() as $page) {
        $this->get($page::getUrl())->assertOk();
    }
});
