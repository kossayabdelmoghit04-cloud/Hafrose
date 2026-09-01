<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\RunBackupJob;
use App\Models\ActivityLog;
use App\Models\AdminLog;
use App\Services\ActivityLogService;
use App\Services\AdminLogService;
use App\Services\ProductionBackupService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Contrôleur de gestion des sauvegardes système — Administration HAFROSE.
 *
 * Routes :
 *   POST   /api/admin/system/backup          → lancer une sauvegarde (asynchrone par défaut, ou synchrone si sync=true/dry_run=true)
 *   GET    /api/admin/system/backups         → lister les sauvegardes
 *   DELETE /api/admin/system/backups/{id}   → supprimer une sauvegarde
 *
 * Toutes les routes sont protégées par : auth:sanctum + admin.
 * Toutes les actions sont journalisées dans AdminLog et ActivityLog.
 */
class SystemBackupController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected ProductionBackupService $backupService,
        protected AdminLogService $adminLogService,
        protected ActivityLogService $activityLogService,
    ) {}

    // ─── POST /api/admin/system/backup ───────────────────────────────────────

    /**
     * Lancer une sauvegarde (asynchrone via Queue par défaut, ou synchrone si sync/dry_run).
     *
     * @bodyParam dry_run  bool  Simuler sans écrire. Default: false.
     * @bodyParam verbose  bool  Inclure les détails dans la réponse. Default: false.
     * @bodyParam sync     bool  Forcer l'exécution synchrone. Default: false (ou true si dry_run).
     *
     * @response 202 { "success": true, "message": "Sauvegarde mise en file d'attente.", "data": { ... } }
     * @response 200 { "success": true, "message": "Sauvegarde créée.", "data": { ... } }
     */
    public function create(Request $request): JsonResponse
    {
        $dryRun = (bool) $request->input('dry_run', false);
        $verbose = (bool) $request->input('verbose', false);
        // Si async=true est explicite, on force l'asynchrone. Sinon dry_run s'exécute synchrone pour inspection immédiate.
        $forceAsync = $request->boolean('async', false);
        $sync = ! $forceAsync && ($request->boolean('sync', false) || $dryRun);

        try {
            if ($sync) {
                $report = $this->backupService->run(dryRun: $dryRun, verbose: $verbose);

                // ── Journalisation AdminLog ──────────────────────────────────────
                $this->adminLogService->log(
                    request: $request,
                    action: AdminLog::ACTION_BACKUP_CREATE,
                    resource: AdminLog::RESOURCE_SYSTEM,
                    description: $dryRun
                        ? 'Simulation de sauvegarde système (dry-run)'
                        : 'Sauvegarde système lancée manuellement (synchrone)',
                    newValues: [
                        'dry_run' => $dryRun,
                        'success' => $report['success'],
                        'archive' => $report['archive'] ?? null,
                    ],
                );

                // ── Journalisation ActivityLog ───────────────────────────────────
                $this->activityLogService->log(
                    eventType: 'backup.create',
                    category: ActivityLog::CATEGORY_ADMIN,
                    resource: AdminLog::RESOURCE_SYSTEM,
                    metadata: [
                        'dry_run' => $dryRun,
                        'success' => $report['success'],
                        'archive' => $report['archive'] ?? null,
                        'errors' => $report['errors'],
                    ],
                );

                if (! $report['success']) {
                    $errorMessages = implode('; ', $report['errors']);

                    return $this->errorResponse(
                        "La sauvegarde a échoué : {$errorMessages}",
                        500,
                        $report['errors'],
                        $report
                    );
                }

                return $this->successResponse(
                    $report,
                    $dryRun ? 'Simulation de sauvegarde terminée.' : 'Sauvegarde créée avec succès.'
                );
            }

            // Mode asynchrone par défaut pour les vraies sauvegardes : dispatch dans la queue
            RunBackupJob::dispatch($dryRun, $verbose);

            // ── Journalisation AdminLog ──────────────────────────────────────
            $this->adminLogService->log(
                request: $request,
                action: AdminLog::ACTION_BACKUP_CREATE,
                resource: AdminLog::RESOURCE_SYSTEM,
                description: 'Sauvegarde système mise en file d\'attente (asynchrone)',
                newValues: [
                    'dry_run' => $dryRun,
                    'queued' => true,
                ],
            );

            // ── Journalisation ActivityLog ───────────────────────────────────
            $this->activityLogService->log(
                eventType: 'backup.create',
                category: ActivityLog::CATEGORY_ADMIN,
                resource: AdminLog::RESOURCE_SYSTEM,
                metadata: [
                    'dry_run' => $dryRun,
                    'queued' => true,
                ],
            );

            return response()->json([
                'success' => true,
                'message' => 'La tâche de sauvegarde a été mise en file d\'attente avec succès.',
                'errors' => null,
                'data' => [
                    'status' => 'queued',
                    'dry_run' => $dryRun,
                    'queued_at' => now()->toIso8601String(),
                ],
            ], 202);

        } catch (\Throwable $e) {
            Log::error('SystemBackupController: erreur inattendue lors du backup.', [
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Erreur interne lors de la sauvegarde.', 500);
        }
    }

    // ─── GET /api/admin/system/backups ───────────────────────────────────────

    /**
     * Lister toutes les sauvegardes disponibles.
     *
     * @response 200 { "success": true, "data": [ { "id": "...", "filename": "...", ... } ] }
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $backups = $this->backupService->listBackups();

            return response()->json([
                'success' => true,
                'message' => null,
                'errors' => null,
                'data' => $backups,
                'meta' => [
                    'total' => count($backups),
                    'backup_path' => config('production.backup.path', 'backups'),
                    'disk' => config('production.storage.disk', 'local'),
                ],
            ]);

        } catch (\Throwable $e) {
            Log::error('SystemBackupController: erreur listing backups.', [
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Impossible de lister les sauvegardes.', 500);
        }
    }

    // ─── DELETE /api/admin/system/backups/{id} ───────────────────────────────

    /**
     * Supprimer une sauvegarde par son identifiant.
     *
     * @urlParam id string required  Identifiant de la sauvegarde (nom sans extension).
     *
     * @response 200 { "success": true, "message": "Sauvegarde supprimée." }
     * @response 404 { "success": false, "message": "Sauvegarde introuvable." }
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            // Sécuriser l'identifiant contre la traversée de chemin
            if (str_contains($id, '/') || str_contains($id, '\\') || str_contains($id, '..')) {
                return $this->errorResponse('Identifiant de sauvegarde invalide ou dangereux.', 422);
            }

            $safeId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $id);

            if (empty($safeId) || $safeId !== $id) {
                return $this->errorResponse('Identifiant de sauvegarde invalide.', 422);
            }

            $this->backupService->deleteBackup($safeId);

            // ── Journalisation AdminLog ──────────────────────────────────────
            $this->adminLogService->log(
                request: $request,
                action: AdminLog::ACTION_BACKUP_DELETE,
                resource: AdminLog::RESOURCE_SYSTEM,
                description: "Suppression de la sauvegarde : {$safeId}",
                oldValues: ['backup_id' => $safeId],
            );

            // ── Journalisation ActivityLog ───────────────────────────────────
            $this->activityLogService->log(
                eventType: 'backup.delete',
                category: ActivityLog::CATEGORY_ADMIN,
                resource: AdminLog::RESOURCE_SYSTEM,
                metadata: ['backup_id' => $safeId],
            );

            return $this->successResponse(null, "Sauvegarde '{$safeId}' supprimée avec succès.");

        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 404);

        } catch (\Throwable $e) {
            Log::error('SystemBackupController: erreur suppression backup.', [
                'error' => $e->getMessage(),
                'id' => $id,
            ]);

            return $this->errorResponse('Erreur interne lors de la suppression.', 500);
        }
    }
}
