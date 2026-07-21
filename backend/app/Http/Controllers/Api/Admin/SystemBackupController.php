<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BackupResource;
use App\Models\AdminLog;
use App\Services\ActivityLogService;
use App\Services\AdminLogService;
use App\Services\ProductionBackupService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ActivityLog;

/**
 * Contrôleur de gestion des sauvegardes système — Administration HAFROSE.
 *
 * Routes :
 *   POST   /api/admin/system/backup          → lancer une sauvegarde
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
        protected AdminLogService         $adminLogService,
        protected ActivityLogService      $activityLogService,
    ) {}

    // ─── POST /api/admin/system/backup ───────────────────────────────────────

    /**
     * Lancer une sauvegarde complète immédiate.
     *
     * @bodyParam dry_run  bool  Simuler sans écrire. Default: false.
     * @bodyParam verbose  bool  Inclure les détails dans la réponse. Default: false.
     *
     * @response 200 { "success": true, "message": "Sauvegarde créée.", "data": { ... } }
     * @response 422 { "success": false, "message": "Les sauvegardes sont désactivées." }
     * @response 500 { "success": false, "message": "Erreur interne." }
     */
    public function create(Request $request): JsonResponse
    {
        $dryRun  = (bool) $request->input('dry_run', false);
        $verbose = (bool) $request->input('verbose', false);

        try {
            $report = $this->backupService->run(dryRun: $dryRun, verbose: $verbose);

            // ── Journalisation AdminLog ──────────────────────────────────────
            $this->adminLogService->log(
                request:     $request,
                action:      AdminLog::ACTION_BACKUP_CREATE,
                resource:    AdminLog::RESOURCE_SYSTEM,
                description: $dryRun
                    ? 'Simulation de sauvegarde système (dry-run)'
                    : 'Sauvegarde système lancée manuellement',
                newValues: [
                    'dry_run' => $dryRun,
                    'success' => $report['success'],
                    'archive' => $report['archive'] ?? null,
                ],
            );

            // ── Journalisation ActivityLog ───────────────────────────────────
            $this->activityLogService->log(
                eventType:  'backup.create',
                category:   ActivityLog::CATEGORY_ADMIN,
                resource:   AdminLog::RESOURCE_SYSTEM,
                metadata:   [
                    'dry_run' => $dryRun,
                    'success' => $report['success'],
                    'archive' => $report['archive'] ?? null,
                    'errors'  => $report['errors'],
                ],
            );

            if (!$report['success']) {
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
                'errors'  => null,
                'data'    => $backups,
                'meta'    => [
                    'total'       => count($backups),
                    'backup_path' => config('production.backup.path', 'backups'),
                    'disk'        => config('production.storage.disk', 'local'),
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
                request:     $request,
                action:      AdminLog::ACTION_BACKUP_DELETE,
                resource:    AdminLog::RESOURCE_SYSTEM,
                description: "Suppression de la sauvegarde : {$safeId}",
                oldValues:   ['backup_id' => $safeId],
            );

            // ── Journalisation ActivityLog ───────────────────────────────────
            $this->activityLogService->log(
                eventType:  'backup.delete',
                category:   ActivityLog::CATEGORY_ADMIN,
                resource:   AdminLog::RESOURCE_SYSTEM,
                metadata:   ['backup_id' => $safeId],
            );

            return $this->successResponse(null, "Sauvegarde '{$safeId}' supprimée avec succès.");

        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 404);

        } catch (\Throwable $e) {
            Log::error('SystemBackupController: erreur suppression backup.', [
                'error' => $e->getMessage(),
                'id'    => $id,
            ]);

            return $this->errorResponse('Erreur interne lors de la suppression.', 500);
        }
    }
}
