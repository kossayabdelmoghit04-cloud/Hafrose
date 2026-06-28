<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Contact;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Obtenir toutes les statistiques clés pour le tableau de bord.
     */
    public function getMetrics(): array
    {
        // Chiffre d'affaires : commandes non annulées
        $revenue = Order::where('status', '!=', Order::STATUS_CANCELLED)->sum('total_price');

        return [
            'products_count'    => Product::count(),
            'categories_count'  => Category::count(),
            'orders_count'      => Order::count(),
            'pending_orders'    => Order::where('status', Order::STATUS_PENDING)->count(),
            'revenue'           => round($revenue, 2),
            'pending_reviews'   => Review::where('is_approved', false)->count(),
            'unread_contacts'   => Contact::where('is_read', false)->count(),
        ];
    }

    /**
     * Obtenir les données pour le graphique des ventes (15 derniers jours).
     */
    public function getSalesChartData(int $days = 15): array
    {
        $sales = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price) as total'),
                DB::raw('COUNT(id) as count')
            )
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        // Remplir les dates vides pour avoir un graphique continu
        $chartData = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $dateString = now()->subDays($i)->format('Y-m-d');
            $found = $sales->firstWhere('date', $dateString);

            $chartData[] = [
                'date'  => now()->subDays($i)->format('d/m'),
                'sales' => $found ? (float)$found->total : 0.0,
                'count' => $found ? (int)$found->count : 0,
            ];
        }

        return $chartData;
    }

    /**
     * Obtenir les produits populaires (les plus vendus).
     */
    public function getPopularProducts(int $limit = 5): array
    {
        $popular = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->whereHas('order', function ($query) {
                $query->where('status', '!=', Order::STATUS_CANCELLED);
            })
            ->groupBy('product_id')
            ->orderBy('total_qty', 'desc')
            ->limit($limit)
            ->with('product.category')
            ->get();

        return $popular->map(function ($item) {
            return [
                'id'        => $item->product_id,
                'name'      => $item->product ? $item->product->name : 'Produit supprimé',
                'slug'      => $item->product ? $item->product->slug : '#',
                'category'  => ($item->product && $item->product->category) ? $item->product->category->name : 'N/A',
                'price'     => $item->product ? (float)$item->product->price : 0,
                'sales_qty' => (int)$item->total_qty,
            ];
        })->toArray();
    }

    /**
     * Obtenir les 5 dernières commandes.
     */
    public function getLatestOrders(int $limit = 5): array
    {
        return Order::latest()
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Obtenir les 5 derniers messages de contact.
     */
    public function getLatestMessages(int $limit = 5): array
    {
        return Contact::latest()
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
