<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * TEST_DB_DATABASE selects another test database for parallel runs. Only climatisation_test*
     * names are accepted, so a test run can never reach the dev database.
     */
    public function createApplication()
    {
        $database = getenv('TEST_DB_DATABASE');
        if (is_string($database) && preg_match('/^climatisation_test\w*$/', $database)) {
            putenv("DB_DATABASE={$database}");
            $_ENV['DB_DATABASE'] = $_SERVER['DB_DATABASE'] = $database;
        }

        return parent::createApplication();
    }
}
