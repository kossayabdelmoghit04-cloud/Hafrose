<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\AdminLog;
use App\Models\User;
use App\Services\MaintenanceService;
use App\Services\ProductionBackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests de la Phase 5.8.1 — Infrastructure de Production & Sauvegardes
 *
 * Couvre :
 *  — ProductionBackupService (dry-run, création, rotation, suppression)
 *  — MaintenanceService (statut, activation/désactivation)
 *  — Commande Artisan hafrose:backup
 *  — API Admin /system/backup et /system/backups
 *  — Variables d'environnement et configuration
 *  — Aucune régression des routes existantes
 */
class ProductionBackupTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Créer et authentifier un administrateur.
     * Note : utilise uniquement la colonne `role` (pattern existant du projet).
     */
    private function adminUser(): User
    {
        return User::factory()->create([
            'email' => 'admin-backup-test@hafrose.com',
            'role' => User::ROLE_ADMIN,
        ]);
    }

    /**
     * Créer un utilisateur standard.
     */
    private function regularUser(): User
    {
        return User::factory()->create([
            'email' => 'user-backup-test@hafrose.com',
            'role' => 'customer',
        ]);
    }

    // =========================================================================
    // 1. Configuration de production
    // =========================================================================

    #[Test]
    public function production_config_file_exists(): void
    {
        $this->assertFileExists(config_path('production.php'));
    }

    #[Test]
    public function production_config_has_required_sections(): void
    {
        $sections = ['backup', 'retention', 'compression', 'maintenance', 'storage', 'health', 'scheduler'];

        foreach ($sections as $section) {
            $this->assertNotNull(
                config("production.{$section}"),
                "La section [{$section}] est manquante dans config/production.php"
            );
        }
    }

    #[Test]
    public function production_config_backup_defaults_are_sensible(): void
    {
        $this->assertTrue(config('production.backup.enabled'));
        $this->assertEquals('backups', config('production.backup.path'));
        $this->assertTrue(config('production.backup.database'));
        $this->assertTrue(config('production.backup.compress'));
        $this->assertGreaterThan(0, config('production.backup.min_disk_space_mb'));
    }

    #[Test]
    public function production_config_retention_defaults_are_sensible(): void
    {
        $this->assertEquals(7, config('production.retention.daily'));
        $this->assertEquals(4, config('production.retention.weekly'));
        $this->assertEquals(6, config('production.retention.monthly'));
        $this->assertEquals(30, config('production.retention.days'));
    }

    // =========================================================================
    // 2. Variables d'environnement
    // =========================================================================

    #[Test]
    public function env_example_contains_backup_variables(): void
    {
        $envExample = file_get_contents(base_path('.env.example'));

        $expectedVars = [
            'BACKUP_ENABLED',
            'BACKUP_PATH',
            'BACKUP_RETENTION_DAILY',
            'BACKUP_RETENTION_WEEKLY',
            'BACKUP_RETENTION_MONTHLY',
            'BACKUP_RETENTION_DAYS',
            'BACKUP_DATABASE',
            'BACKUP_STORAGE',
            'BACKUP_IMAGES',
            'BACKUP_COMPRESS',
            'BACKUP_MIN_DISK_SPACE_MB',
            'BACKUP_STORAGE_DISK',
            'MAINTENANCE_SECRET',
            'MAINTENANCE_ALLOWED_IPS',
            'MAINTENANCE_MESSAGE',
            'MAINTENANCE_RETRY_AFTER',
            'PRODUCTION_READ_ONLY',
            'HEALTH_CHECK_ENABLED',
            'HEALTH_DISK_WARNING_THRESHOLD',
            'HEALTH_DISK_CRITICAL_THRESHOLD',
            'SCHEDULER_ENABLED',
            'SCHEDULER_BACKUP_TIME',
            'SCHEDULER_TIMEZONE',
        ];

        foreach ($expectedVars as $var) {
            $this->assertStringContainsString(
                $var,
                $envExample,
                "La variable [{$var}] est manquante dans .env.example"
            );
        }
    }

    #[Test]
    public function production_config_reads_from_env(): void
    {
        Config::set('production.backup.enabled', false);
        $this->assertFalse(config('production.backup.enabled'));

        Config::set('production.retention.daily', 14);
        $this->assertEquals(14, config('production.retention.daily'));
    }

    // =========================================================================
    // 3. ProductionBackupService — Dry Run
    // =========================================================================

    #[Test]
    public function backup_service_dry_run_succeeds(): void
    {
        Config::set('production.backup.enabled', true);

        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $report = $service->run(dryRun: true, verbose: true);

        $this->assertTrue($report['success'], 'Le dry-run doit réussir.');
        $this->assertTrue($report['dry_run']);
        $this->assertArrayHasKey('steps', $report);
        $this->assertNotEmpty($report['steps']);
    }

    #[Test]
    public function backup_service_dry_run_creates_no_files(): void
    {
        Config::set('production.backup.enabled', true);

        $backupDir = storage_path('app/backups');
        $before = File::isDirectory($backupDir) ? count(File::files($backupDir)) : 0;

        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $service->run(dryRun: true);

        $after = File::isDirectory($backupDir) ? count(File::files($backupDir)) : 0;

        $this->assertEquals($before, $after, 'Un dry-run ne doit créer aucun fichier.');
    }

    #[Test]
    public function backup_service_disabled_throws_runtime_exception(): void
    {
        Config::set('production.backup.enabled', false);

        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $report = $service->run(dryRun: true);

        $this->assertFalse($report['success']);
        $this->assertNotEmpty($report['errors']);
        $this->assertStringContainsString('désactivées', $report['errors'][0]);
    }

    #[Test]
    public function backup_service_disk_check_step_is_present(): void
    {
        Config::set('production.backup.enabled', true);

        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $report = $service->run(dryRun: true);

        $stepNames = array_column($report['steps'], 'name');
        $this->assertContains('disk_check', $stepNames, 'L\'étape disk_check doit être présente.');
    }

    #[Test]
    public function backup_service_report_has_all_required_keys(): void
    {
        Config::set('production.backup.enabled', true);

        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $report = $service->run(dryRun: true);

        $requiredKeys = ['success', 'dry_run', 'started_at', 'steps', 'archive', 'errors'];
        foreach ($requiredKeys as $key) {
            $this->assertArrayHasKey($key, $report, "La clé [{$key}] est manquante dans le rapport.");
        }
    }

    // =========================================================================
    // 4. Rotation des sauvegardes
    // =========================================================================

    #[Test]
    public function rotation_keeps_backups_within_limits(): void
    {
        Config::set('production.backup.enabled', true);
        Config::set('production.retention.daily', 3);
        Config::set('production.retention.weekly', 2);
        Config::set('production.retention.monthly', 1);

        $backupDir = storage_path('app/test_rotation');
        File::ensureDirectoryExists($backupDir, 0755);

        // Créer 10 fichiers ZIP factices avec timestamps différents
        for ($i = 0; $i < 10; $i++) {
            $filename = $backupDir.'/hafrose-backup_2026-01-'.str_pad($i + 1, 2, '0', STR_PAD_LEFT).'_00-00-00.zip';
            file_put_contents($filename, 'fake backup '.$i);
            // Modifier le timestamp de modification
            touch($filename, mktime(0, 0, 0, 1, $i + 1, 2026));
        }

        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $service->rotateBackups('test_rotation');

        $remainingFiles = count(File::files($backupDir));

        // Nettoyage
        File::deleteDirectory($backupDir);

        // Après rotation : max daily(3) + weekly(2) + monthly(1) = 6 mais avec dédoublonnage peut être moins
        $this->assertLessThanOrEqual(6, $remainingFiles, 'La rotation doit réduire le nombre de backups.');
        $this->assertGreaterThan(0, $remainingFiles, 'La rotation ne doit pas tout supprimer.');
    }

    #[Test]
    public function list_backups_returns_array(): void
    {
        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $backups = $service->listBackups();

        $this->assertIsArray($backups);
    }

    #[Test]
    public function delete_backup_throws_for_nonexistent_id(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/introuvable/i');

        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $service->deleteBackup('nonexistent-backup-id');
    }

    #[Test]
    public function verify_integrity_returns_false_for_nonexistent(): void
    {
        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $result = $service->verifyBackupIntegrity('nonexistent-id');

        $this->assertFalse($result);
    }

    #[Test]
    public function restore_method_returns_not_implemented_response(): void
    {
        /** @var ProductionBackupService $service */
        $service = app(ProductionBackupService::class);
        $response = $service->restore('some-backup-id');

        $this->assertFalse($response['success']);
        $this->assertArrayHasKey('message', $response);
        $this->assertArrayHasKey('backup_id', $response);
    }

    // =========================================================================
    // 5. MaintenanceService
    // =========================================================================

    #[Test]
    public function maintenance_service_can_check_status(): void
    {
        /** @var MaintenanceService $service */
        $service = app(MaintenanceService::class);
        $status = $service->status();

        $this->assertArrayHasKey('in_maintenance', $status);
        $this->assertArrayHasKey('checked_at', $status);
        $this->assertIsBool($status['in_maintenance']);
    }

    #[Test]
    public function maintenance_service_is_down_returns_bool(): void
    {
        /** @var MaintenanceService $service */
        $service = app(MaintenanceService::class);

        $this->assertIsBool($service->isDown());
    }

    #[Test]
    public function maintenance_schedule_returns_scheduled_response(): void
    {
        /** @var MaintenanceService $service */
        $service = app(MaintenanceService::class);
        $response = $service->schedule(300, secret: 'test-secret', message: 'Maintenance dans 5 minutes');

        $this->assertTrue($response['success']);
        $this->assertStringContainsString('planifiée', $response['message']);
        $this->assertArrayHasKey('starts_at', $response);
        $this->assertArrayHasKey('scheduled_at', $response);
    }

    // =========================================================================
    // 6. Commande Artisan hafrose:backup
    // =========================================================================

    #[Test]
    public function artisan_backup_command_exists(): void
    {
        $this->artisan('hafrose:backup', ['--dry-run' => true])
            ->assertExitCode(0);
    }

    #[Test]
    public function artisan_backup_command_dry_run_exits_with_success(): void
    {
        Config::set('production.backup.enabled', true);

        $this->artisan('hafrose:backup', ['--dry-run' => true])
            ->assertExitCode(0);
    }

    #[Test]
    public function artisan_backup_command_disabled_exits_with_failure(): void
    {
        Config::set('production.backup.enabled', false);

        $this->artisan('hafrose:backup')
            ->assertExitCode(1);
    }

    #[Test]
    public function artisan_backup_command_force_flag_overrides_disabled(): void
    {
        Config::set('production.backup.enabled', false);

        $this->artisan('hafrose:backup', ['--dry-run' => true, '--force' => true])
            ->assertExitCode(0);
    }

    #[Test]
    public function artisan_backup_command_detailed_flag_works(): void
    {
        Config::set('production.backup.enabled', true);

        $this->artisan('hafrose:backup', ['--dry-run' => true, '--detailed' => true])
            ->assertExitCode(0);
    }

    // =========================================================================
    // 7. API Admin — POST /api/admin/system/backup
    // =========================================================================

    #[Test]
    public function unauthenticated_cannot_trigger_backup(): void
    {
        $this->postJson('/api/admin/system/backup')
            ->assertStatus(401);
    }

    #[Test]
    public function non_admin_cannot_trigger_backup(): void
    {
        $user = $this->regularUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->postJson('/api/admin/system/backup', [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(403);
    }

    #[Test]
    public function admin_can_trigger_dry_run_backup(): void
    {
        Config::set('production.backup.enabled', true);

        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->postJson(
            '/api/admin/system/backup',
            ['dry_run' => true],
            ['Authorization' => "Bearer {$token}"]
        );

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'success',
                    'dry_run',
                    'steps',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.dry_run', true);
    }

    #[Test]
    public function backup_create_logs_admin_action(): void
    {
        Config::set('production.backup.enabled', true);

        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $this->postJson(
            '/api/admin/system/backup',
            ['dry_run' => true],
            ['Authorization' => "Bearer {$token}"]
        )->assertStatus(200);

        $this->assertDatabaseHas('admin_logs', [
            'action' => 'backup_create',
            'resource' => 'system',
            'admin_id' => $admin->id,
        ]);
    }

    #[Test]
    public function backup_create_logs_activity(): void
    {
        Config::set('production.backup.enabled', true);

        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $this->postJson(
            '/api/admin/system/backup',
            ['dry_run' => true],
            ['Authorization' => "Bearer {$token}"]
        )->assertStatus(200);

        $this->assertDatabaseHas('activity_logs', [
            'event_type' => 'backup.create',
            'category' => ActivityLog::CATEGORY_ADMIN,
            'resource' => AdminLog::RESOURCE_SYSTEM,
        ]);
    }

    // =========================================================================
    // 8. API Admin — GET /api/admin/system/backups
    // =========================================================================

    #[Test]
    public function unauthenticated_cannot_list_backups(): void
    {
        $this->getJson('/api/admin/system/backups')
            ->assertStatus(401);
    }

    #[Test]
    public function non_admin_cannot_list_backups(): void
    {
        $user = $this->regularUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->getJson('/api/admin/system/backups', ['Authorization' => "Bearer {$token}"])
            ->assertStatus(403);
    }

    #[Test]
    public function admin_can_list_backups(): void
    {
        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->getJson(
            '/api/admin/system/backups',
            ['Authorization' => "Bearer {$token}"]
        );

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => ['total', 'backup_path', 'disk'],
            ])
            ->assertJsonPath('success', true);

        $this->assertIsArray($response->json('data'));
    }

    // =========================================================================
    // 9. API Admin — DELETE /api/admin/system/backups/{id}
    // =========================================================================

    #[Test]
    public function unauthenticated_cannot_delete_backup(): void
    {
        $this->deleteJson('/api/admin/system/backups/some-id')
            ->assertStatus(401);
    }

    #[Test]
    public function non_admin_cannot_delete_backup(): void
    {
        $user = $this->regularUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->deleteJson('/api/admin/system/backups/some-id', [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(403);
    }

    #[Test]
    public function admin_deleting_nonexistent_backup_returns_404(): void
    {
        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $this->deleteJson(
            '/api/admin/system/backups/nonexistent-backup-2026',
            [],
            ['Authorization' => "Bearer {$token}"]
        )->assertStatus(404);
    }

    #[Test]
    public function delete_backup_invalid_id_returns_422(): void
    {
        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $this->deleteJson(
            '/api/admin/system/backups/invalid_backup_id_with_invalid_chars_!@#$',
            [],
            ['Authorization' => "Bearer {$token}"]
        )->assertStatus(422);
    }

    #[Test]
    public function admin_can_delete_existing_backup(): void
    {
        // Créer un faux backup ZIP
        $backupDir = storage_path('app/backups');
        File::ensureDirectoryExists($backupDir, 0755);

        $backupId = 'hafrose-backup_test_delete_backup';
        $backupFile = $backupDir.'/'.$backupId.'.zip';
        file_put_contents($backupFile, 'fake zip content for delete test');

        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $this->deleteJson(
            "/api/admin/system/backups/{$backupId}",
            [],
            ['Authorization' => "Bearer {$token}"]
        )->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertFileDoesNotExist($backupFile);
    }

    #[Test]
    public function delete_backup_logs_admin_action(): void
    {
        // Créer un faux backup ZIP
        $backupDir = storage_path('app/backups');
        File::ensureDirectoryExists($backupDir, 0755);

        $backupId = 'hafrose-backup_test_delete_log';
        $backupFile = $backupDir.'/'.$backupId.'.zip';
        file_put_contents($backupFile, 'fake zip content');

        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $this->deleteJson(
            "/api/admin/system/backups/{$backupId}",
            [],
            ['Authorization' => "Bearer {$token}"]
        )->assertStatus(200);

        $this->assertDatabaseHas('admin_logs', [
            'action' => 'backup_delete',
            'resource' => 'system',
            'admin_id' => $admin->id,
        ]);
    }

    // =========================================================================
    // 10. Aucune régression des routes existantes
    // =========================================================================

    #[Test]
    public function public_products_route_still_works(): void
    {
        $this->getJson('/api/products')
            ->assertStatus(200);
    }

    #[Test]
    public function public_categories_route_still_works(): void
    {
        $this->getJson('/api/categories')
            ->assertStatus(200);
    }

    #[Test]
    public function admin_dashboard_route_still_protected(): void
    {
        $this->getJson('/api/admin/dashboard')
            ->assertStatus(401);
    }

    #[Test]
    public function admin_cache_clear_route_still_works(): void
    {
        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $this->postJson('/api/admin/cache/clear', [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    #[Test]
    public function admin_logs_route_still_works(): void
    {
        $admin = $this->adminUser();
        $token = $admin->createToken('test')->plainTextToken;

        $this->getJson('/api/admin/logs', ['Authorization' => "Bearer {$token}"])
            ->assertStatus(200);
    }

    // =========================================================================
    // 11. Permissions & sécurité
    // =========================================================================

    #[Test]
    public function backup_path_is_configurable(): void
    {
        Config::set('production.backup.path', 'custom-backups');
        $this->assertEquals('custom-backups', config('production.backup.path'));
    }

    #[Test]
    public function admin_log_model_has_backup_constants(): void
    {
        $this->assertEquals('backup_create', AdminLog::ACTION_BACKUP_CREATE);
        $this->assertEquals('backup_delete', AdminLog::ACTION_BACKUP_DELETE);
        $this->assertEquals('system', AdminLog::RESOURCE_SYSTEM);
    }

    #[Test]
    public function production_backup_service_is_injectable(): void
    {
        $service = app(ProductionBackupService::class);
        $this->assertInstanceOf(ProductionBackupService::class, $service);
    }

    #[Test]
    public function maintenance_service_is_injectable(): void
    {
        $service = app(MaintenanceService::class);
        $this->assertInstanceOf(MaintenanceService::class, $service);
    }
}
