<?php

namespace App\Exports;

use App\Models\Review;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReviewsExport implements FromQuery, WithHeadings, WithMapping, WithTitle, WithStyles, ShouldAutoSize
{
    public function __construct(protected array $filters = []) {}

    public function query(): Builder
    {
        $query = Review::query()->with('product');

        if (!empty($this->filters['search'])) {
            $search = '%' . $this->filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', $search)
                  ->orWhere('comment', 'like', $search);
            });
        }

        if (isset($this->filters['is_approved'])) {
            $query->where('is_approved', filter_var($this->filters['is_approved'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = $this->filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($this->filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortOrder);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Produit',
            'Nom du Client',
            'Note (/5)',
            'Commentaire',
            'Statut',
            'Date de Soumission',
        ];
    }

    /**
     * @param Review $review
     */
    public function map($review): array
    {
        return [
            $review->id,
            $review->product?->name ?? 'Produit #' . $review->product_id,
            $review->customer_name,
            $review->rating . '/5',
            $review->comment,
            $review->is_approved ? 'Approuvé' : 'En attente',
            $review->created_at?->format('d/m/Y H:i'),
        ];
    }

    public function title(): string
    {
        return 'Avis Clients';
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E293B'],
                ],
            ],
        ];
    }
}
