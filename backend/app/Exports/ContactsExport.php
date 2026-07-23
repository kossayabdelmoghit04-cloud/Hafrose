<?php

namespace App\Exports;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ContactsExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    public function __construct(protected array $filters = []) {}

    public function query(): Builder
    {
        $query = Contact::query();

        if (! empty($this->filters['search'])) {
            $search = '%'.$this->filters['search'].'%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search)
                    ->orWhere('subject', 'like', $search);
            });
        }

        if (isset($this->filters['is_read'])) {
            $query->where('is_read', filter_var($this->filters['is_read'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = $this->filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($this->filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortOrder);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nom',
            'Email',
            'Téléphone',
            'Sujet',
            'Message',
            'Statut Lecture',
            'Date de Réception',
        ];
    }

    /**
     * @param  Contact  $contact
     */
    public function map($contact): array
    {
        return [
            $contact->id,
            $contact->name,
            $contact->email,
            $contact->phone ?? '-',
            $contact->subject,
            $contact->message,
            $contact->is_read ? 'Lu' : 'Non lu',
            $contact->created_at?->format('d/m/Y H:i'),
        ];
    }

    public function title(): string
    {
        return 'Contacts';
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
