<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Contact;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Support\Facades\DB;

class DashboardStatsService
{
    /**
     * Obtenir les métriques principales du tableau de bord avec mise en cache.
     */
    public function getMetrics(): array
    {
        $ttl = config('cache-performance.ttls.dashboard', 1800);

        return PerformanceCacheManager::remember('dashboard_metrics', $ttl, function () {
            $orderStats = Order::selectRaw('
                SUM(CASE WHEN status != ? THEN total_price ELSE 0 END) as revenue,
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_orders
            ', [Order::STATUS_CANCELLED, Order::STATUS_PENDING])->first();

            return [
                'products_count' => Product::count(),
                'categories_count' => Category::count(),
                'orders_count' => $orderStats ? (int) $orderStats->total_orders : 0,
                'pending_orders' => $orderStats ? (int) $orderStats->pending_orders : 0,
                'revenue' => $orderStats ? round((float) $orderStats->revenue, 2) : 0.0,
                'pending_reviews' => Review::where('is_approved', false)->count(),
                'unread_contacts' => Contact::where('is_read', false)->count(),
            ];
        }, ['dashboard', 'stats']);
    }

    /**
     * Obtenir les données du graphique des ventes avec mise en cache.
     */
    public function getSalesChartData(int $days = 15): array
    {
        $ttl = config('cache-performance.ttls.dashboard', 1800);
        $key = "dashboard_sales_chart_{$days}";

        return PerformanceCacheManager::remember($key, $ttl, function () use ($days) {
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

            $chartData = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $dateString = now()->subDays($i)->format('Y-m-d');
                $found = $sales->firstWhere('date', $dateString);

                $chartData[] = [
                    'date' => now()->subDays($i)->format('d/m'),
                    'sales' => $found ? (float) $found->total : 0.0,
                    'count' => $found ? (int) $found->count : 0,
                ];
            }

            return $chartData;
        }, ['dashboard', 'stats']);
    }

    /**
     * Obtenir les produits populaires pour le tableau de bord avec mise en cache.
     */
    public function getPopularProducts(int $limit = 5): array
    {
        $ttl = config('cache-performance.ttls.dashboard', 1800);
        $key = "dashboard_popular_products_{$limit}";

        return PerformanceCacheManager::remember($key, $ttl, function () use ($limit) {
            $popular = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'))
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', '!=', Order::STATUS_CANCELLED)
                ->groupBy('product_id')
                ->orderBy('total_qty', 'desc')
                ->limit($limit)
                ->with('product.category')
                ->get();

            return $popular->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product ? $item->product->name : 'Produit supprimé',
                    'slug' => $item->product ? $item->product->slug : '#',
                    'category' => ($item->product && $item->product->category) ? $item->product->category->name : 'N/A',
                    'price' => $item->product ? (float) $item->product->price : 0,
                    'sales_qty' => (int) $item->total_qty,
                ];
            })->toArray();
        }, ['dashboard', 'popular']);
    }

    /**
     * Obtenir les 5 dernières commandes avec mise en cache.
     */
    public function getLatestOrders(int $limit = 5): array
    {
        $ttl = config('cache-performance.ttls.dashboard', 1800);
        $key = "dashboard_latest_orders_{$limit}";

        return PerformanceCacheManager::remember($key, $ttl, function () use ($limit) {
            return Order::select('id', 'customer_name', 'phone', 'city', 'total_price', 'status', 'created_at')
                ->latest()
                ->limit($limit)
                ->get()
                ->toArray();
        }, ['dashboard', 'orders']);
    }

    /**
     * Obtenir les 5 derniers messages de contact avec mise en cache.
     */
    public function getLatestMessages(int $limit = 5): array
    {
        $ttl = config('cache-performance.ttls.dashboard', 1800);
        $key = "dashboard_latest_messages_{$limit}";

        return PerformanceCacheManager::remember($key, $ttl, function () use ($limit) {
            return Contact::select('id', 'name', 'email', 'subject', 'is_read', 'created_at')
                ->latest()
                ->limit($limit)
                ->get()
                ->toArray();
        }, ['dashboard', 'contacts']);
    }

    /**
     * Forcer le rafraîchissement complet du cache du tableau de bord.
     */
    public function refreshCache(): array
    {
        PerformanceCacheManager::invalidateDashboard();

        return [
            'metrics' => $this->getMetrics(),
            'sales_chart' => $this->getSalesChartData(),
            'popular_products' => $this->getPopularProducts(),
            'latest_orders' => $this->getLatestOrders(),
            'latest_messages' => $this->getLatestMessages(),
            'refreshed_at' => now()->toIso8601String(),
        ];
    }
}
