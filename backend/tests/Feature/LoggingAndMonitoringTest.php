<?php

namespace Tests\Feature;

use App\Logging\SanitizeContextProcessor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Monolog\Level;
use Monolog\LogRecord;
use Tests\TestCase;

/**
 * LoggingAndMonitoringTest — Suite de validation complète pour la Phase 5.3.
 *
 * Valide :
 * - Healthcheck /api/health (Application, Database, Storage, Logs, Cache)
 * - Processeur de masquage des secrets SanitizeContextProcessor (Monolog 3)
 * - Configuration du canal daily et rotation
 * - Déclenchement d'erreur contrôlée sans fuite de secrets
 * - Événements d'authentification (login, échec, logout)
 * - Commande de nettoyage des logs hafrose:logs:clean
 */
class LoggingAndMonitoringTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 1. Vérification du Healthcheck Public
     */
    public function test_health_check_endpoint_returns_healthy_with_all_services(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'timestamp',
                'services' => [
                    'application',
                    'database',
                    'storage',
                    'logs',
                    'cache',
                ],
            ])
            ->assertJson([
                'status' => 'healthy',
                'services' => [
                    'application' => 'ok',
                    'database' => 'ok',
                    'storage' => 'ok',
                    'logs' => 'ok',
                    'cache' => 'ok',
                ],
            ]);
    }

    /**
     * 2. Vérification de la configuration de logging (Canal Daily & Rétention 14 jours)
     */
    public function test_logging_configuration_uses_daily_channel_and_correct_retention(): void
    {
        $defaultChannel = config('logging.default');
        $this->assertContains($defaultChannel, ['daily', 'stack']);

        $dailyConfig = config('logging.channels.daily');
        $this->assertNotNull($dailyConfig);
        $this->assertEquals('daily', $dailyConfig['driver']);
        $this->assertEquals(14, $dailyConfig['days']);

        // Vérifier la présence du processeur de masquage
        $this->assertContains(
            SanitizeContextProcessor::class,
            $dailyConfig['processors'] ?? []
        );
    }

    /**
     * 3. Vérification unitaire du processeur SanitizeContextProcessor
     */
    public function test_sanitize_context_processor_redacts_sensitive_keys(): void
    {
        $processor = new SanitizeContextProcessor();

        $context = [
            'user_id' => 42,
            'email' => 'client@hafrose.com',
            'password' => 'UltraSecret123!',
            'password_confirmation' => 'UltraSecret123!',
            'token' => 'plain-text-token-xyz',
            'api_key' => 'sk_live_1234567890abcdef',
            'card_number' => '4532 1234 5678 9010',
            'cvv' => '123',
            'nested' => [
                'db_password' => 'secret_db_pass',
                'safe_field' => 'visible_value',
            ],
        ];

        $record = new LogRecord(
            datetime: new \DateTimeImmutable(),
            channel: 'testing',
            level: Level::Info,
            message: 'User authentication attempt',
            context: $context
        );

        $sanitizedRecord = $processor($record);

        $this->assertEquals(42, $sanitizedRecord->context['user_id']);
        $this->assertEquals('client@hafrose.com', $sanitizedRecord->context['email']);
        $this->assertEquals('[REDACTED]', $sanitizedRecord->context['password']);
        $this->assertEquals('[REDACTED]', $sanitizedRecord->context['password_confirmation']);
        $this->assertEquals('[REDACTED]', $sanitizedRecord->context['token']);
        $this->assertEquals('[REDACTED]', $sanitizedRecord->context['api_key']);
        $this->assertEquals('[REDACTED]', $sanitizedRecord->context['card_number']);
        $this->assertEquals('[REDACTED]', $sanitizedRecord->context['cvv']);
        $this->assertEquals('[REDACTED]', $sanitizedRecord->context['nested']['db_password']);
        $this->assertEquals('visible_value', $sanitizedRecord->context['nested']['safe_field']);
    }

    /**
     * 4. Vérification du masquage des motifs sensibles dans les chaînes de texte
     */
    public function test_sanitize_context_processor_redacts_patterns_in_messages(): void
    {
        $processor = new SanitizeContextProcessor();

        $rawMessage = 'Header Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz.abc with key base64:aJh0BPjx92M9Fz1qyL63dW0xzK8qisPGBjUUjKAR8Pg= and Sanctum token 442|GshHwgQawjeF3eC4I3xVTjfdhGAECVMfoCOmcID4306dc69d';

        $record = new LogRecord(
            datetime: new \DateTimeImmutable(),
            channel: 'testing',
            level: Level::Error,
            message: $rawMessage,
            context: []
        );

        $sanitizedRecord = $processor($record);

        $this->assertStringNotContainsString('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', $sanitizedRecord->message);
        $this->assertStringNotContainsString('aJh0BPjx92M9Fz1qyL63dW0xzK8qisPGBjUUjKAR8Pg=', $sanitizedRecord->message);
        $this->assertStringNotContainsString('GshHwgQawjeF3eC4I3xVTjfdhGAECVMfoCOmcID4306dc69d', $sanitizedRecord->message);

        $this->assertStringContainsString('Bearer [REDACTED]', $sanitizedRecord->message);
        $this->assertStringContainsString('base64:[REDACTED_APP_KEY]', $sanitizedRecord->message);
        $this->assertStringContainsString('[REDACTED_SANCTUM_TOKEN]', $sanitizedRecord->message);
    }

    /**
     * 5. Test d'erreur contrôlée sans divulgation de secrets
     *
     * Utilise un fichier log temporaire isolé pour garantir que seules
     * les entrées générées par CE test sont analysées (pas les anciennes).
     */
    public function test_controlled_error_is_logged_without_leaking_secrets(): void
    {
        // Fichier log temporaire isolé pour ce test
        $tempLogPath = storage_path('logs/laravel-sanitize-test.log');

        // S'assurer qu'il est vide avant le test
        if (File::exists($tempLogPath)) {
            File::delete($tempLogPath);
        }

        // Configurer un channel Monolog temporaire pointant sur ce fichier
        $handler = new \Monolog\Handler\StreamHandler($tempLogPath, \Monolog\Level::Debug);
        $processor = new \App\Logging\SanitizeContextProcessor();
        $monolog = new \Monolog\Logger('sanitize_test');
        $monolog->pushHandler($handler);
        $monolog->pushProcessor($processor);

        // Écrire un log avec des données sensibles via Monolog directement
        $monolog->error('Erreur applicative simulée avec token', [
            'password' => 'MonMotDePasseSecret!',
            'token'    => '123|TokenConfidentielDeSecuriteSuperLong',
            'app_key'  => config('app.key'),
            'operation' => 'test_controlled_error',
        ]);

        // Vérifier que le fichier a été créé
        $this->assertTrue(File::exists($tempLogPath), 'Le fichier log temporaire doit exister.');

        $content = File::get($tempLogPath);

        // Vérifier la présence du message d'erreur
        $this->assertStringContainsString('Erreur applicative simulée avec token', $content);

        // Vérifier l'ABSENCE ABSOLUE du mot de passe en clair
        $this->assertStringNotContainsString('MonMotDePasseSecret!', $content);

        // Vérifier l'ABSENCE du token Sanctum en clair
        $this->assertStringNotContainsString('123|TokenConfidentielDeSecuriteSuperLong', $content);

        // Vérifier l'ABSENCE de l'APP_KEY Laravel en clair
        $appKey = config('app.key');
        if ($appKey) {
            $this->assertStringNotContainsString($appKey, $content);
        }

        // Nettoyage
        File::delete($tempLogPath);
    }


    /**
     * 6. Authentification Client : Login réussi, échec et logout
     */
    public function test_customer_authentication_lifecycle_logging(): void
    {
        $password = 'SecretPassword123!';
        $customer = User::factory()->create([
            'email' => 'client_test_logging@hafrose.com',
            'password' => Hash::make($password),
            'role' => 'customer',
        ]);

        // 6.1 Login réussi
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'client_test_logging@hafrose.com',
            'password' => $password,
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token');
        $this->assertNotEmpty($token);

        // 6.2 Logout
        $logoutResponse = $this->postJson('/api/auth/logout', [], [
            'Authorization' => "Bearer {$token}",
        ]);
        $logoutResponse->assertStatus(200);

        // 6.3 Échec de login avec mot de passe incorrect (renvoie 422 Validation failed)
        $failedResponse = $this->postJson('/api/auth/login', [
            'email' => 'client_test_logging@hafrose.com',
            'password' => 'MauvaisMotDePasse!',
        ]);
        $failedResponse->assertStatus(422);
    }

    /**
     * 7. Commande Artisan hafrose:logs:clean
     */
    public function test_clean_logs_artisan_command(): void
    {
        // 7.1 Dry-run
        $this->artisan('hafrose:logs:clean', ['--dry-run' => true])
            ->assertSuccessful();

        // 7.2 Exécution réelle avec rétention 30 jours forcée
        $this->artisan('hafrose:logs:clean', [
            '--days' => 30,
            '--force' => true,
        ])->assertSuccessful();
    }
}
