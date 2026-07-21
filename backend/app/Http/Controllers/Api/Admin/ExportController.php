<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminExportRequest;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\ExcelExportService;
use App\Services\ExportService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(
        protected ExportService $csvExportService,
        protected ExcelExportService $excelExportService,
        protected AdminLogService $adminLogService,
    ) {}

    /**
     * Exporter les données d'une ressource au format CSV.
     */
    public function exportCsv(AdminExportRequest $request, string $resource): StreamedResponse|JsonResponse
    {
        $validated = $request->validated();

        $this->adminLogService->log(
            request: $request,
            action: AdminLog::ACTION_EXPORT,
            resource: $resource,
            newValues: array_merge(['format' => 'csv'], $validated),
            description: "Exportation CSV de la ressource : {$resource}"
        );

        return $this->csvExportService->exportCsv($resource, $validated);
    }

    /**
     * Exporter les données d'une ressource au format Excel.
     */
    public function exportExcel(AdminExportRequest $request, string $resource): BinaryFileResponse|JsonResponse
    {
        $validated = $request->validated();

        $this->adminLogService->log(
            request: $request,
            action: AdminLog::ACTION_EXPORT,
            resource: $resource,
            newValues: array_merge(['format' => 'excel'], $validated),
            description: "Exportation Excel de la ressource : {$resource}"
        );

        return $this->excelExportService->exportExcel($resource, $validated);
    }
}
