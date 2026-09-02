<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Database\Seeders\TestCustomerSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TestCustomerSeederSecurityTest — Valide l'isolation absolue des seeders de test.
 *
 * Ces tests garantissent que les comptes de test ne peuvent JAMAIS être créés
 * hors de l'environnement 'testing'.
 */
class TestCustomerSeederSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const TEST_EMAILS = [
        'client.test@hafrose.com',
        'client@hafrose.com',
    ];

    /**
     * En environnement testing, TestCustomerSeeder s'exécute et crée les comptes de test.
     */
    public function test_seeder_executes_and_creates_users_in_testing_environment(): void
    {
        $this->assertEquals('testing', app()->environment());

        $this->seed(TestCustomerSeeder::class);

        foreach (self::TEST_EMAILS as $email) {
            $this->assertDatabaseHas('users', [
                'email' => $email,
                'role' => 'customer',
            ]);
        }
    }

    /**
     * En environnement production simulé, TestCustomerSeeder refuse strictement de s'exécuter.
     */
    public function test_seeder_strictly_refuses_execution_in_production(): void
    {
        $this->app['env'] = 'production';
        $this->assertTrue(app()->isProduction());
        $this->assertFalse(app()->environment('testing'));

        $seeder = new TestCustomerSeeder;
        $seeder->setContainer($this->app);
        $seeder->run();

        foreach (self::TEST_EMAILS as $email) {
            $this->assertDatabaseMissing('users', [
                'email' => $email,
            ]);
        }
    }

    /**
     * En environnement local simulé, TestCustomerSeeder refuse également de s'exécuter.
     */
    public function test_seeder_refuses_execution_in_local_environment(): void
    {
        $this->app['env'] = 'local';
        $this->assertFalse(app()->environment('testing'));

        $seeder = new TestCustomerSeeder;
        $seeder->setContainer($this->app);
        $seeder->run();

        foreach (self::TEST_EMAILS as $email) {
            $this->assertDatabaseMissing('users', [
                'email' => $email,
            ]);
        }
    }

    /**
     * En environnement production simulé, UserSeeder refuse strictement de s'exécuter.
     */
    public function test_user_seeder_refuses_execution_in_production(): void
    {
        $this->app['env'] = 'production';
        $this->assertFalse(app()->environment('testing'));

        $seeder = new UserSeeder;
        $seeder->setContainer($this->app);
        $seeder->run();

        $this->assertDatabaseMissing('users', [
            'email' => 'client.test@hafrose.com',
        ]);
    }

    /**
     * DatabaseSeeder en environnement production n'appelle pas les seeders de test.
     */
    public function test_database_seeder_does_not_seed_test_customers_in_production(): void
    {
        $this->app['env'] = 'production';
        $this->assertFalse(app()->environment('testing'));

        // Exécuter DatabaseSeeder avec l'option --force pour la production
        $this->artisan('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true]);

        // Les comptes de test ne doivent pas exister
        foreach (self::TEST_EMAILS as $email) {
            $this->assertDatabaseMissing('users', [
                'email' => $email,
            ]);
        }
    }
}
