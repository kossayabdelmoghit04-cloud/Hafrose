<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Contact;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Service réutilisable d'exportation CSV en streaming.
 */
class ExportService
{
    /**
     * Exporter les données d'une ressource au format CSV en streaming.
     */
    public function exportCsv(string $resource, array $filters = []): StreamedResponse
    {
        $normalizedResource = strtolower(trim($resource));
        $now = Carbon::now();
        $filename = sprintf('%s_%s.csv', $normalizedResource, $now->format('Y-m-d_H-i'));

        $query = $this->buildQuery($normalizedResource, $filters);
        $headersAndMapper = $this->getHeadersAndMapper($normalizedResource, $filters['columns'] ?? []);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $filename),
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($query, $headersAndMapper) {
            $output = fopen('php://output', 'w');

            // Insérer le BOM UTF-8 pour assurer une ouverture correcte sous Excel (accents français)
            fwrite($output, "\xEF\xBB\xBF");

            // En-têtes CSV
            fputcsv($output, $headersAndMapper['headers'], ';');

            // Streaming via cursor Eloquent
            foreach ($query->cursor() as $model) {
                $row = ($headersAndMapper['mapper'])($model);
                fputcsv($output, $row, ';');
            }

            fclose($output);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    /**
     * Construire la requête optimisée avec filtres et tri.
     */
    public function buildQuery(string $resource, array $filters = []): Builder
    {
        $query = match ($resource) {
            'products', 'product' => Product::query()->with('category'),
            'categories', 'category' => Category::query()->withCount('products'),
            'orders', 'order' => Order::query(),
            'reviews', 'review' => Review::query()->with('product'),
            'contacts', 'contact' => Contact::query(),
            'users', 'user' => User::query(),
            default => throw new \InvalidArgumentException("Ressource non supportée pour l'exportation CSV : {$resource}"),
        };

        // Filtre par terme de recherche s'il est fourni
        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            match ($resource) {
                'products', 'product' => $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', $search)
                        ->orWhere('description', 'like', $search)
                        ->orWhere('brand', 'like', $search);
                }),
                'categories', 'category' => $query->where('name', 'like', $search),
                'orders', 'order' => $query->where(function ($q) use ($search) {
                    $q->where('customer_name', 'like', $search)
                        ->orWhere('phone', 'like', $search)
                        ->orWhere('city', 'like', $search);
                }),
                'reviews', 'review' => $query->where(function ($q) use ($search) {
                    $q->where('customer_name', 'like', $search)
                        ->orWhere('comment', 'like', $search);
                }),
                'contacts', 'contact' => $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', $search)
                        ->orWhere('email', 'like', $search)
                        ->orWhere('subject', 'like', $search);
                }),
                'users', 'user' => $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', $search)
                        ->orWhere('email', 'like', $search);
                }),
                default => null,
            };
        }

        // Filtres spécifiques
        if (isset($filters['category_id']) && in_array($resource, ['products', 'product'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['status'])) {
            if (in_array($resource, ['orders', 'order'])) {
                $query->where('status', $filters['status']);
            }
        }

        if (isset($filters['is_approved']) && in_array($resource, ['reviews', 'review'])) {
            $query->where('is_approved', filter_var($filters['is_approved'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['is_read']) && in_array($resource, ['contacts', 'contact'])) {
            $query->where('is_read', filter_var($filters['is_read'], FILTER_VALIDATE_BOOLEAN));
        }

        if (! empty($filters['start_date'])) {
            $query->where('created_at', '>=', $filters['start_date']);
        }

        if (! empty($filters['end_date'])) {
            $query->where('created_at', '<=', $filters['end_date']);
        }

        // Tri
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortOrder);
    }

    /**
     * Définir les en-têtes et la fonction de mapping pour chaque ressource.
     */
    protected function getHeadersAndMapper(string $resource, array $requestedColumns = []): array
    {
        return match ($resource) {
            'products', 'product' => [
                'headers' => ['ID', 'Nom', 'Slug', 'Prix', 'Stock', 'Couleur', 'Matériau', 'Marque', 'Catégorie', 'Mis en avant', 'Date création'],
                'mapper' => fn (Product $p) => [
                    $p->id,
                    $p->name,
                    $p->slug,
                    number_format((float) $p->price, 2, '.', '').' €',
                    $p->stock,
                    $p->color ?? '-',
                    $p->material ?? '-',
                    $p->brand ?? '-',
                    $p->category?->name ?? '-',
                    $p->is_featured ? 'Oui' : 'Non',
                    $p->created_at?->format('Y-m-d H:i:s'),
                ],
            ],
            'categories', 'category' => [
                'headers' => ['ID', 'Nom', 'Slug', 'Description', 'Nombre de produits', 'Date création'],
                'mapper' => fn (Category $c) => [
                    $c->id,
                    $c->name,
                    $c->slug,
                    $c->description ?? '-',
                    $c->products_count ?? $c->products()->count(),
                    $c->created_at?->format('Y-m-d H:i:s'),
                ],
            ],
            'orders', 'order' => [
                'headers' => ['ID', 'Nom Client', 'Téléphone', 'Adresse', 'Ville', 'Prix Total', 'Statut', 'Date création'],
                'mapper' => fn (Order $o) => [
                    $o->id,
                    $o->customer_name,
                    $o->phone,
                    $o->address,
                    $o->city,
                    number_format((float) $o->total_price, 2, '.', '').' €',
                    $o->status,
                    $o->created_at?->format('Y-m-d H:i:s'),
                ],
            ],
            'reviews', 'review' => [
                'headers' => ['ID', 'Produit', 'Client', 'Note', 'Commentaire', 'Statut', 'Date création'],
                'mapper' => fn (Review $r) => [
                    $r->id,
                    $r->product?->name ?? 'Produit #'.$r->product_id,
                    $r->customer_name,
                    $r->rating.'/5',
                    $r->comment,
                    $r->is_approved ? 'Approuvé' : 'En attente',
                    $r->created_at?->format('Y-m-d H:i:s'),
                ],
            ],
            'contacts', 'contact' => [
                'headers' => ['ID', 'Nom', 'Email', 'Téléphone', 'Sujet', 'Message', 'Lu', 'Date création'],
                'mapper' => fn (Contact $c) => [
                    $c->id,
                    $c->name,
                    $c->email,
                    $c->phone ?? '-',
                    $c->subject,
                    $c->message,
                    $c->is_read ? 'Oui' : 'Non',
                    $c->created_at?->format('Y-m-d H:i:s'),
                ],
            ],
            'users', 'user' => [
                'headers' => ['ID', 'Nom', 'Email', 'Rôle', 'Date création'],
                'mapper' => fn (User $u) => [
                    $u->id,
                    $u->name,
                    $u->email,
                    $u->role ?? 'user',
                    $u->created_at?->format('Y-m-d H:i:s'),
                ],
            ],
            default => throw new \InvalidArgumentException("Ressource inconnue : {$resource}"),
        };
    }
}
