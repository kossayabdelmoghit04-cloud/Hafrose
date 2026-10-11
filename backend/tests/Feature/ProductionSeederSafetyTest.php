<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DevelopmentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionSeederSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_development_seeder_is_a_no_op_in_production(): void
    {
        $this->app['env'] = 'production';

        $seeder = new DevelopmentSeeder;
        $seeder->setContainer($this->app);
        $seeder->run();

        $this->assertFakeCommerceTablesAreEmpty();
    }

    public function test_database_seeder_does_not_create_fake_commerce_data_in_production(): void
    {
        $this->app['env'] = 'production';

        $this->artisan('db:seed', [
            '--class' => DatabaseSeeder::class,
            '--force' => true,
        ])->assertExitCode(0);

        $this->assertFakeCommerceTablesAreEmpty();
    }

    private function assertFakeCommerceTablesAreEmpty(): void
    {
        foreach (['products', 'orders', 'reviews', 'contacts'] as $table) {
            $this->assertDatabaseCount($table, 0);
        }
    }
}
