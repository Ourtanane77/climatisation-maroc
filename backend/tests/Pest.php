<?php

use Filament\Actions\Testing\TestAction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Features\SupportTesting\Testable;
use Tests\TestCase;

/*
| Feature tests run against the MySQL test database (climatisation_test, see phpunit.xml),
| refreshed per test.
*/
pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/**
 * Mounts a Filament action, sets its form data and runs it.
 * (Filament's fillForm() test helper leaves mounted action data empty in this setup.)
 *
 * @param  string|TestAction  $action
 * @param  array<string, mixed>  $data
 */
function runAction(Testable $component, $action, array $data = []): Testable
{
    $component->mountAction($action);
    foreach ($data as $key => $value) {
        $component->set("mountedActions.0.data.{$key}", $value);
    }

    return $component->callMountedAction();
}
