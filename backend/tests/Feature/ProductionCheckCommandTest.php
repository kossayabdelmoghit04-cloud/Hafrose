<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProductionCheckCommandTest extends TestCase
{
    protected function tearDown(): void
    {
        foreach (['MYSQL_ROOT_PASSWORD', 'CORS_ALLOWED_ORIGINS'] as $key) {
            putenv($key);
            unset($_ENV[$key], $_SERVER[$key]);
        }

        parent::tearDown();
    }

    public function test_safe_configuration_passes_without_sending_mail(): void
    {
        $this->configureSafeProduction();

        $this->artisan('hafrose:production-check')
            ->expectsOutputToContain('Production preflight passed')
            ->assertExitCode(0);
    }

    public function test_debug_mode_is_rejected(): void
    {
        $this->configureSafeProduction();
        config(['app.debug' => true]);

        $this->artisan('hafrose:production-check')
            ->expectsOutputToContain('[FAIL] APP_DEBUG is false')
            ->assertExitCode(1);
    }

    public function test_missing_application_key_is_rejected(): void
    {
        $this->configureSafeProduction();
        config(['app.key' => '']);

        $this->artisan('hafrose:production-check')
            ->expectsOutputToContain('[FAIL] APP_KEY is configured')
            ->assertExitCode(1);
    }

    public function test_weak_database_secrets_are_rejected(): void
    {
        $this->configureSafeProduction();
        config(['database.connections.mysql.password' => 'secret']);
        $this->setRaw('MYSQL_ROOT_PASSWORD', 'rootsecret');

        $this->artisan('hafrose:production-check')
            ->expectsOutputToContain('[FAIL] DB_PASSWORD is strong/configured')
            ->expectsOutputToContain('[FAIL] MYSQL_ROOT_PASSWORD is strong/configured')
            ->assertExitCode(1);
    }

    private function configureSafeProduction(): void
    {
        config([
            'app.env' => 'production',
            'app.debug' => false,
            'app.key' => 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
            'app.url' => 'https://api.hafrose.test',
            'app.frontend_url' => 'https://www.hafrose.test',
            'database.connections.mysql.host' => 'db',
            'database.connections.mysql.database' => 'hafrose',
            'database.connections.mysql.username' => 'hafrose',
            'database.connections.mysql.password' => 'strong-database-password',
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => 'smtp.hafrose.test',
            'mail.from.address' => 'no-reply@hafrose.test',
            'sanctum.customer_expiration' => 480,
            'sanctum.admin_expiration' => 120,
            'turnstile.enabled' => true,
            'turnstile.site_key' => 'public-site-key',
            'turnstile.secret_key' => 'private-test-value',
            'production.encryption.enabled' => false,
            'production.offsite.enabled' => false,
        ]);

        $this->setRaw('MYSQL_ROOT_PASSWORD', 'strong-root-password');
        $this->setRaw('CORS_ALLOWED_ORIGINS', 'https://www.hafrose.test');
    }

    private function setRaw(string $key, string $value): void
    {
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}
