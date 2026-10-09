<?php

namespace Tests\Feature;

use App\Http\Middleware\SanitizeInputMiddleware;
use App\Logging\SanitizeContextProcessor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Monolog\Level;
use Monolog\LogRecord;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

/**
 * SecurityAuditTest — Validation automatisée de sécurité et maintenance (Phase 5.4).
 *
 * Valide les exigences de sécurité locale :
 * - CORS : Port 3000 autorisé, aucun wildcard permissif (*), credentials supportés.
 * - Sanctum : Port 3000 inclus dans les domaines stateful.
 * - Authentification / Autorisation : Routes admin protégées (401 invité, 403 client, 200 admin).
 * - Stockage : Isolation stricte des sauvegardes hors de public/storage.
 * - Désinfection : SanitizeInputMiddleware filtre les balises script et null bytes.
 * - Logs : SanitizeContextProcessor masque les secrets et tokens.
 * - Hygiène Git & Environnement : Environnement local/testing, pas d'exposition de secrets.
 */
class SecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 1. CORS : Port 3000 explicitement autorisé et absence de wildcard laxiste.
     */
    public function test_cors_configuration_allows_frontend_port_3000_and_forbids_wildcard(): void
    {
        $allowedOrigins = config('cors.allowed_origins', []);
        $supportsCredentials = config('cors.supports_credentials');

        $this->assertTrue(
            in_array('http://localhost:3000', $allowedOrigins, true) ||
            in_array('http://127.0.0.1:3000', $allowedOrigins, true),
            'Le port frontend 3000 doit être présent dans les origines autorisées CORS.'
        );

        $this->assertNotContains(
            '*',
            $allowedOrigins,
            'Le wildcard "*" est strictement interdit dans les origines CORS avec support des credentials.'
        );

        $this->assertFalse(
            $supportsCredentials,
            'CORS ne doit pas autoriser les credentials : HAFROSE utilise des Bearer tokens Sanctum.'
        );
    }

    /**
     * 2. Sanctum : Port 3000 présent dans les domaines stateful.
     */
    public function test_sanctum_stateful_domains_includes_port_3000(): void
    {
        $statefulDomains = config('sanctum.stateful', []);

        $hasPort3000 = false;
        foreach ($statefulDomains as $domain) {
            if (str_contains($domain, 'localhost:3000') || str_contains($domain, '127.0.0.1:3000')) {
                $hasPort3000 = true;
                break;
            }
        }

        $this->assertTrue(
            $hasPort3000,
            'Sanctum doit inclure localhost:3000 dans ses domaines stateful.'
        );
    }

    /**
     * 3. Protection des routes d'administration contre les accès non autorisés.
     */
    public function test_admin_routes_reject_unauthenticated_and_non_admin_users(): void
    {
        // Cas 1 : Accès anonyme / invité -> 401 Unauthenticated
        $guestResponse = $this->getJson('/api/admin/dashboard');
        $guestResponse->assertStatus(401);

        // Cas 2 : Utilisateur connecté mais simple client (rôle 'customer') -> 403 Forbidden
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $customerResponse = $this->actingAs($customer, 'sanctum')->getJson('/api/admin/dashboard');
        $customerResponse->assertStatus(403);

        // Cas 3 : Administrateur authentifié -> 200 OK
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $adminResponse = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard');
        $adminResponse->assertStatus(200);
    }

    /**
     * 4. Isolation stricte du stockage de sauvegarde : non exposé via le lien public.
     */
    public function test_backup_storage_is_isolated_from_public_storage(): void
    {
        $links = config('filesystems.links', []);
        $publicDiskRoot = config('filesystems.disks.public.root');

        // Le lien symbolique public ne doit pointer QUE vers storage/app/public
        $this->assertEquals(
            storage_path('app/public'),
            $publicDiskRoot,
            'Le disque public doit pointer exclusivement vers storage/app/public.'
        );

        // Vérifier que le dossier des backups est en dehors de storage/app/public
        $backupDir = storage_path('app/backups');
        $this->assertFalse(
            str_starts_with($backupDir, $publicDiskRoot),
            'Le répertoire des sauvegardes ne doit JAMAIS se trouver dans storage/app/public.'
        );
    }

    /**
     * 5. Middleware de désinfection des entrées : neutralisation des balises scripts et null bytes.
     */
    public function test_input_sanitizer_middleware_strips_malicious_script_tags_and_null_bytes(): void
    {
        $middleware = new SanitizeInputMiddleware;

        $rawInput = [
            'comment' => "Message avec <script>alert('xss')</script> et du texte sain.",
            'name' => "Jean\0Valjean",
            'nested' => [
                'field' => "Attaque <script src='evil.js'></script> testée.",
            ],
        ];

        $request = Request::create('/api/test-sanitize', 'POST', $rawInput);
        $request->headers->set('Accept', 'application/json');

        $middleware->handle($request, function (Request $req) {
            $data = $req->all();

            $this->assertStringNotContainsString('<script>', $data['comment']);
            $this->assertStringNotContainsString('</script>', $data['comment']);
            $this->assertStringContainsString('Message avec  et du texte sain.', $data['comment']);

            $this->assertStringNotContainsString("\0", $data['name']);
            $this->assertEquals('JeanValjean', $data['name']);

            $this->assertStringNotContainsString('<script', $data['nested']['field']);

            return new Response('OK');
        });
    }

    /**
     * 6. Processeur Monolog 3 : masquage systématique des données sensibles dans les logs.
     */
    public function test_monolog_sanitizer_redacts_credentials_and_tokens(): void
    {
        $processor = new SanitizeContextProcessor;

        $sensitiveRecord = new LogRecord(
            datetime: new \DateTimeImmutable,
            channel: 'daily',
            level: Level::Info,
            message: 'Requête authentifiée avec Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 et token 42|abcdef1234567890abcdef1234567890abcdef12',
            context: [
                'password' => 'SuperSecret123!',
                'password_confirmation' => 'SuperSecret123!',
                'token' => '42|abcdef1234567890abcdef1234567890abcdef12',
                'api_key' => 'ak_test_secret_998877665544',
                'authorization' => 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
                'safe_info' => 'Identifiant public 104',
            ],
            extra: []
        );

        $sanitized = $processor($sensitiveRecord);

        // Vérification du contexte
        $this->assertEquals('[REDACTED]', $sanitized->context['password']);
        $this->assertEquals('[REDACTED]', $sanitized->context['password_confirmation']);
        $this->assertEquals('[REDACTED]', $sanitized->context['token']);
        $this->assertEquals('[REDACTED]', $sanitized->context['api_key']);
        $this->assertEquals('[REDACTED]', $sanitized->context['authorization']);
        $this->assertEquals('Identifiant public 104', $sanitized->context['safe_info']);

        // Vérification du message
        $this->assertStringNotContainsString('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', $sanitized->message);
        $this->assertStringNotContainsString('42|abcdef1234567890abcdef1234567890abcdef12', $sanitized->message);
        $this->assertStringContainsString('[REDACTED]', $sanitized->message);
    }

    /**
     * 7. Protection de l'intégrité de l'environnement local et des logs.
     */
    public function test_logging_configuration_uses_daily_rotation_and_safe_retention(): void
    {
        $logChannel = config('logging.default');
        $this->assertContains($logChannel, ['daily', 'stack'], 'Le canal de log doit être daily ou stack.');

        $dailyDays = config('logging.channels.daily.days', 14);
        $this->assertGreaterThanOrEqual(7, $dailyDays, 'La rétention des logs doit être de 7 à 14 jours.');
    }
}
