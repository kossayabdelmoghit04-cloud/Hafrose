<?php

namespace Tests\Feature;

use Tests\TestCase;

class RepositoryHardeningTest extends TestCase
{
    private string $repositoryRoot;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositoryRoot = dirname(base_path());
    }

    public function test_backend_image_enforces_platform_requirements_and_non_root_runtime(): void
    {
        $dockerfile = $this->read('backend/Dockerfile');

        $this->assertStringNotContainsString('--ignore-platform-reqs', $dockerfile);
        $this->assertStringContainsString('composer check-platform-reqs --no-dev', $dockerfile);
        $this->assertStringContainsString('USER www-data', $dockerfile);
        $this->assertStringContainsString('mariadb-client', $dockerfile);
    }

    public function test_compose_contains_scheduler_health_and_container_hardening(): void
    {
        $compose = $this->read('docker-compose.yml');

        $this->assertStringContainsString('scheduler:', $compose);
        $this->assertStringContainsString('schedule:work', $compose);
        $this->assertStringContainsString('hafrose:healthcheck', $compose);
        $this->assertStringContainsString('condition: service_healthy', $compose);
        $this->assertStringContainsString('no-new-privileges:true', $compose);
        $this->assertStringContainsString('cap_drop: [ALL]', $compose);
        $this->assertStringContainsString('max-size: "10m"', $compose);
    }

    public function test_production_compose_has_no_dangerous_secret_defaults(): void
    {
        $compose = $this->read('docker-compose.yml');

        $this->assertStringNotContainsString('DB_PASSWORD:-secret', $compose);
        $this->assertStringNotContainsString('MYSQL_ROOT_PASSWORD:-rootsecret', $compose);
        $this->assertStringContainsString('DB_PASSWORD:?DB_PASSWORD is required', $compose);
        $this->assertStringContainsString('MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required', $compose);
    }

    public function test_production_environment_template_documents_required_groups(): void
    {
        $template = $this->read('.env.production.example');

        foreach ([
            'APP_ENV=', 'APP_DEBUG=', 'APP_KEY=', 'DB_PASSWORD=',
            'MYSQL_ROOT_PASSWORD=', 'MAIL_MAILER=', 'MAIL_HOST=',
            'TURNSTILE_SECRET_KEY=', 'VITE_TURNSTILE_SITE_KEY=',
            'CORS_ALLOWED_ORIGINS=', 'SANCTUM_ADMIN_EXPIRATION=',
            'QUEUE_CONNECTION=', 'CACHE_STORE=', 'FILESYSTEM_DISK=',
            'BACKUP_DISK=', 'BACKUP_RETENTION_DAILY=', 'OFFSITE_ENABLED=',
        ] as $required) {
            $this->assertStringContainsString($required, $template);
        }
    }

    private function read(string $path): string
    {
        $absolute = $this->repositoryRoot.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $path);
        $this->assertFileExists($absolute);

        return (string) file_get_contents($absolute);
    }
}
