<?php

use App\Models\User;
use Database\Seeders\RolesAndUsersSeeder;

beforeEach(fn () => $this->seed(RolesAndUsersSeeder::class));

it('redirects guests to the French admin login', function () {
    $this->get('/admin')->assertRedirect('/admin/login');
});

it('lets admins and managers into the back office', function (string $role) {
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)->get('/admin')->assertOk();
})->with([User::ROLE_ADMIN, User::ROLE_MANAGER]);

it('keeps resellers out of the back office', function () {
    $user = User::factory()->create();
    $user->assignRole(User::ROLE_RESELLER);

    $this->actingAs($user)->get('/admin')->assertForbidden();
});
