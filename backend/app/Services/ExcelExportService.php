<?php

namespace App\Services;

use App\Exports\CategoriesExport;
use App\Exports\ContactsExport;
use App\Exports\OrdersExport;
use App\Exports\ProductsExport;
use App\Exports\ReviewsExport;
use App\Exports\UsersExport;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Service gérant l'exportation des données au format Excel.
 */
class ExcelExportService
{
    /**
     * Exporter les données d'une ressource au format Excel (XLSX).
     */
    public function exportExcel(string $resource, array $filters = []): BinaryFileResponse
    {
        $normalizedResource = strtolower(trim($resource));
        $now = Carbon::now();
        $filename = sprintf('%s_%s.xlsx', $normalizedResource, $now->format('Y-m-d_H-i'));

        $export = match ($normalizedResource) {
            'products', 'product' => new ProductsExport($filters),
            'categories', 'category' => new CategoriesExport($filters),
            'orders', 'order' => new OrdersExport($filters),
            'reviews', 'review' => new ReviewsExport($filters),
            'contacts', 'contact' => new ContactsExport($filters),
            'users', 'user' => new UsersExport($filters),
            default => throw new \InvalidArgumentException("Ressource non supportée pour l'exportation Excel : {$resource}"),
        };

        return Excel::download($export, $filename);
    }
}
