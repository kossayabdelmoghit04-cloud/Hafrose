<?php

namespace App\Exports;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductsExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    public function __construct(protected array $filters = []) {}

    public function query(): Builder
    {
        $query = Product::query()->with('category');

        if (! empty($this->filters['search'])) {
            $search = '%'.$this->filters['search'].'%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                    ->orWhere('description', 'like', $search)
                    ->orWhere('brand', 'like', $search);
            });
        }

        if (isset($this->filters['category_id'])) {
            $query->where('category_id', $this->filters['category_id']);
        }

        if (! empty($this->filters['start_date'])) {
            $query->where('created_at', '>=', $this->filters['start_date']);
        }

        if (! empty($this->filters['end_date'])) {
            $query->where('created_at', '<=', $this->filters['end_date']);
        }

        $sortBy = $this->filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($this->filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortOrder);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nom du Produit',
            'Slug',
            'Prix (€)',
            'Stock',
            'Couleur',
            'Matériau',
            'Marque',
            'Catégorie',
            'Mis en avant',
            'Date de Création',
        ];
    }

    /**
     * @param  Product  $product
     */
    public function map($product): array
    {
        return [
            $product->id,
            $product->name,
            $product->slug,
            number_format((float) $product->price, 2, '.', '').' €',
            $product->stock,
            $product->color ?? '-',
            $product->material ?? '-',
            $product->brand ?? '-',
            $product->category?->name ?? '-',
            $product->is_featured ? 'Oui' : 'Non',
            $product->created_at?->format('d/m/Y H:i'),
        ];
    }

    public function title(): string
    {
        return 'Produits';
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E293B'],
                ],
            ],
        ];
    }
}
