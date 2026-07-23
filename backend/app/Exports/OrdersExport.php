<?php

namespace App\Exports;

use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrdersExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    public function __construct(protected array $filters = []) {}

    public function query(): Builder
    {
        $query = Order::query();

        if (! empty($this->filters['search'])) {
            $search = '%'.$this->filters['search'].'%';
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', $search)
                    ->orWhere('phone', 'like', $search)
                    ->orWhere('city', 'like', $search);
            });
        }

        if (! empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
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
            'ID Commande',
            'Nom du Client',
            'Téléphone',
            'Adresse',
            'Ville',
            'Montant Total (€)',
            'Statut',
            'Date de Commande',
        ];
    }

    /**
     * @param  Order  $order
     */
    public function map($order): array
    {
        return [
            $order->id,
            $order->customer_name,
            $order->phone,
            $order->address,
            $order->city,
            number_format((float) $order->total_price, 2, '.', '').' €',
            $order->status,
            $order->created_at?->format('d/m/Y H:i'),
        ];
    }

    public function title(): string
    {
        return 'Commandes';
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
