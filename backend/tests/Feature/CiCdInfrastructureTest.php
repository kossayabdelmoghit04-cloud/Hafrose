<?php

namespace Tests\Feature;

use Tests\TestCase;

class CiCdInfrastructureTest extends TestCase
{
    /**
     * Test that all GitHub Actions workflow files exist and are non-empty.
     */
    public function test_github_workflows_exist(): void
    {
        $basePath = base_path('.github/workflows');

        $workflows = [
            'ci.yml',
            'quality.yml',
            'security.yml',
            'deploy.yml',
            'release.yml',
        ];

        foreach ($workflows as $workflow) {
            $filePath = $basePath.'/'.$workflow;

            $this->assertFileExists(
                $filePath,
                "Workflow file [{$workflow}] should exist in .github/workflows/"
            );

            $this->assertGreaterThan(
                0,
                filesize($filePath),
                "Workflow file [{$workflow}] should not be empty."
            );
        }
    }

    /**
     * Test that all required scripts are present in composer.json.
     */
    public function test_composer_scripts_are_configured(): void
    {
        $composerPath = base_path('composer.json');

        $this->assertFileExists($composerPath);

        $composerData = json_decode(file_get_contents($composerPath), true);

        $this->assertArrayHasKey('scripts', $composerData, 'composer.json should contain a scripts section.');

        $requiredScripts = ['test', 'analyse', 'lint', 'quality', 'ci', 'deploy'];

        foreach ($requiredScripts as $script) {
            $this->assertArrayHasKey(
                $script,
                $composerData['scripts'],
                "Composer script [{$script}] must be defined in composer.json."
            );
        }
    }

    /**
     * Test that .env.ci configuration file exists and contains essential keys.
     */
    public function test_env_ci_file_exists_and_configured(): void
    {
        $envCiPath = base_path('.env.ci');

        $this->assertFileExists($envCiPath, '.env.ci file must exist in root directory.');

        $content = file_get_contents($envCiPath);

        $this->assertStringContainsString('APP_ENV=testing', $content);
        $this->assertStringContainsString('DB_CONNECTION=sqlite', $content);
        $this->assertStringContainsString('CACHE_STORE=array', $content);
        $this->assertStringContainsString('QUEUE_CONNECTION=sync', $content);
        $this->assertStringContainsString('MAIL_MAILER=array', $content);
    }

    /**
     * Test that CI/CD documentation exists and covers key aspects.
     */
    public function test_ci_cd_documentation_exists(): void
    {
        $docPath = base_path('docs/ci-cd.md');

        $this->assertFileExists($docPath, 'docs/ci-cd.md documentation file must exist.');

        $content = file_get_contents($docPath);

        $this->assertStringContainsString('Workflows GitHub Actions', $content);
        $this->assertStringContainsString('ci.yml', $content);
        $this->assertStringContainsString('quality.yml', $content);
        $this->assertStringContainsString('security.yml', $content);
        $this->assertStringContainsString('deploy.yml', $content);
        $this->assertStringContainsString('release.yml', $content);
        $this->assertStringContainsString('Variables & Secrets GitHub', $content);
        $this->assertStringContainsString('Rollback', $content);
    }

    /**
     * Test application configuration integrity under testing environment.
     */
    public function test_application_config_integrity(): void
    {
        $this->assertEquals('testing', config('app.env'));
        $this->assertNotEmpty(config('app.name'));
    }
}
